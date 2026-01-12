// Debug: Log ALL inputData first
console.log('=== FULL INPUT DATA ===');
console.log('inputData keys:', Object.keys(inputData));
console.log('Full inputData:', JSON.stringify(inputData, null, 2));

const contactId = inputData.contactId;
const opportunityId = inputData.opportunityId;
let invoiceDataInput = inputData.data || inputData.invoiceData || inputData.invoice;
const locationId = inputData.locationId || inputData.location_id;
const apiToken = inputData.api || inputData.apiToken || inputData.token;

// Validate required fields
if (!contactId) throw new Error('contactId is required');
if (!opportunityId) throw new Error('opportunityId is required');
if (!locationId) throw new Error('locationId is required');
if (!apiToken) throw new Error('api token is required');

// Headers for API calls
const headers = {
  'Accept': 'application/json',
  'Version': '2021-07-28',
  'Authorization': `Bearer ${apiToken}`
};

// Debug: Log input data
console.log('=== EXTRACTED VALUES ===');
console.log('contactId:', contactId);
console.log('opportunityId:', opportunityId);
console.log('locationId:', locationId);
console.log('apiToken:', apiToken ? `${apiToken.substring(0, 10)}...` : 'none');
console.log('invoiceDataInput type:', typeof invoiceDataInput);
console.log('invoiceDataInput:', JSON.stringify(invoiceDataInput));

// Extract invoice from input data
// Handle multiple formats
let invoiceData;

if (!invoiceDataInput) {
  throw new Error('invoiceData is missing from input');
}

// Try parsing if it's a string
if (typeof invoiceDataInput === 'string') {
  try {
    invoiceDataInput = JSON.parse(invoiceDataInput);
    console.log('Parsed invoiceDataInput from string:', invoiceDataInput);
  } catch (e) {
    console.log('Failed to parse invoiceDataInput string');
  }
}

// Format 1: { invoice: [{...}] } - array
if (invoiceDataInput && invoiceDataInput.invoice && Array.isArray(invoiceDataInput.invoice) && invoiceDataInput.invoice.length > 0) {
  console.log('Format detected: { invoice: [{...}] } - array');
  invoiceData = invoiceDataInput.invoice[0];
}
// Format 1b: { invoice: {...} } - object (NOT array)
else if (invoiceDataInput && invoiceDataInput.invoice && typeof invoiceDataInput.invoice === 'object' && !Array.isArray(invoiceDataInput.invoice)) {
  console.log('Format detected: { invoice: {...} } - object');
  invoiceData = invoiceDataInput.invoice;
}
// Format 2: { invoice_no, invoice_status, ... }
else if (invoiceDataInput && invoiceDataInput.invoice_no) {
  console.log('Format detected: { invoice_no, ... }');
  invoiceData = invoiceDataInput;
}
// Format 3: Direct array [{ invoice_no, ... }]
else if (Array.isArray(invoiceDataInput) && invoiceDataInput.length > 0) {
  console.log('Format detected: [{...}]');
  invoiceData = invoiceDataInput[0];
}
// Format 4: Maybe invoice is a string that needs parsing
else if (invoiceDataInput && typeof invoiceDataInput === 'string') {
  try {
    const parsed = JSON.parse(invoiceDataInput);
    console.log('Format detected: String that needs parsing');
    if (Array.isArray(parsed) && parsed.length > 0) {
      invoiceData = parsed[0];
    } else if (parsed.invoice && Array.isArray(parsed.invoice)) {
      invoiceData = parsed.invoice[0];
    } else if (parsed.invoice_no) {
      invoiceData = parsed;
    }
  } catch (e) {
    console.log('Failed to parse invoice string:', e.message);
  }
}

// Last resort: check if inputData itself has invoice structure
if (!invoiceData && inputData.invoice && Array.isArray(inputData.invoice) && inputData.invoice.length > 0) {
  console.log('Format detected: invoice directly in inputData');
  invoiceData = inputData.invoice[0];
}

if (!invoiceData) {
  console.log('No valid format detected.');
  console.log('invoiceDataInput keys:', Object.keys(invoiceDataInput || {}));
  console.log('invoiceDataInput value:', invoiceDataInput);
  throw new Error('Invoice data format not recognized. Please provide invoice data with invoice_no field');
}

console.log('Extracted invoiceData:', JSON.stringify(invoiceData));

// Validate invoice data
if (!invoiceData || !invoiceData.invoice_no || invoiceData.invoice_no.trim() === '') {
  console.log('Validation failed. invoiceData:', invoiceData);
  throw new Error('Invoice data with invoice_no is required');
}

console.log('Invoice validation passed. invoice_no:', invoiceData.invoice_no);

// ============ GET CONTACT DETAILS ============
const contactResponse = await customRequest.get(
  `https://services.leadconnectorhq.com/contacts/${contactId}`, {
    headers
  }
);

const fields = contactResponse.data.contact.customFields;

// Find the custom field that contains total_lead_in_hlelite_helper_kit
let totalOpportunityTrackHelper = null;

for (let i = 0; i < fields.length; i++) {
  const field = fields[i];

  if (field.value && typeof field.value === 'string') {
    try {
      const parsedValue = JSON.parse(field.value);

      if (Array.isArray(parsedValue)) {
        for (const item of parsedValue) {
          if (item && typeof item === 'object') {
            for (const key in item) {
              if (item[key].total_lead_in_hlelite_helper_kit !== undefined) {
                totalOpportunityTrackHelper = parsedValue;
                break;
              }
            }
          }
        }
      } else if (typeof parsedValue === 'object') {
        for (const key in parsedValue) {
          if (parsedValue[key] && parsedValue[key].total_lead_in_hlelite_helper_kit !== undefined) {
            totalOpportunityTrackHelper = parsedValue;
            break;
          }
        }
      }
    } catch (e) {
      continue;
    }
  } else if (field.value && typeof field.value === 'object') {
    const checkForKey = (obj) => {
      if (Array.isArray(obj)) {
        return obj.some(item => checkForKey(item));
      }
      if (typeof obj === 'object' && obj !== null) {
        if (obj.total_lead_in_hlelite_helper_kit !== undefined) return true;
        return Object.values(obj).some(val => checkForKey(val));
      }
      return false;
    };

    if (checkForKey(field.value)) {
      totalOpportunityTrackHelper = field.value;
    }
  }

  if (totalOpportunityTrackHelper) break;
}

// Ensure it's always an array format: [{"id": {values}}]
let updatedTrackHelper = [];

if (totalOpportunityTrackHelper) {
  if (Array.isArray(totalOpportunityTrackHelper)) {
    updatedTrackHelper = totalOpportunityTrackHelper;
  } else if (typeof totalOpportunityTrackHelper === 'object') {
    for (const key in totalOpportunityTrackHelper) {
      updatedTrackHelper.push({
        [key]: totalOpportunityTrackHelper[key]
      });
    }
  }
}

// ============ VERIFY AND CLEAN UP DELETED OPPORTUNITIES ============
let removedOpportunities = [];
if (locationId && contactId) {
  try {
    const opportunitiesSearchResponse = await customRequest.get(
      `https://services.leadconnectorhq.com/opportunities/search?location_id=${locationId}&contact_id=${contactId}&limit=100`,
      { headers }
    );

    const validOpportunities = opportunitiesSearchResponse.data.opportunities || [];
    const validOpportunityIds = validOpportunities.map(opp => opp.id);

    console.log('Valid opportunity IDs from API:', validOpportunityIds);

    // Filter out opportunities that no longer exist in the API
    const cleanedTrackHelper = [];
    for (let i = 0; i < updatedTrackHelper.length; i++) {
      const obj = updatedTrackHelper[i];
      const oppId = Object.keys(obj)[0];

      if (validOpportunityIds.includes(oppId)) {
        // Opportunity still exists - keep it
        cleanedTrackHelper.push(obj);
      } else {
        // Opportunity deleted - remove it
        console.log('Removing deleted opportunity:', oppId);
        removedOpportunities.push(oppId);
      }
    }

    updatedTrackHelper = cleanedTrackHelper;
    console.log('Opportunities after cleanup:', updatedTrackHelper.length);
    console.log('Removed opportunities:', removedOpportunities);
  } catch (e) {
    console.log('Failed to verify opportunities:', e.message);
    // Continue with existing data if verification fails
  }
}

// ============ FIND OPPORTUNITY AND UPDATE INVOICE ============
let opportunityFound = false;
let invoiceUpdated = false;

for (let i = 0; i < updatedTrackHelper.length; i++) {
  if (updatedTrackHelper[i][opportunityId] !== undefined) {
    // Opportunity found
    const existingData = updatedTrackHelper[i][opportunityId];
    const existingInvoices = existingData.invoice || [];

    // Check if invoice already exists
    let invoiceFound = false;

    for (let j = 0; j < existingInvoices.length; j++) {
      if (existingInvoices[j].invoice_no === invoiceData.invoice_no) {
        // Invoice exists - UPDATE it
        existingInvoices[j] = {
          ...existingInvoices[j],
          ...invoiceData
        };
        invoiceFound = true;
        invoiceUpdated = true;
        console.log('Invoice updated:', invoiceData.invoice_no);
        break;
      }
    }

    if (!invoiceFound) {
      // Invoice doesn't exist - APPEND it
      existingInvoices.push(invoiceData);
      invoiceUpdated = true;
      console.log('Invoice added:', invoiceData.invoice_no);
    }

    // Update the opportunity with modified invoices
    updatedTrackHelper[i][opportunityId].invoice = existingInvoices;
    opportunityFound = true;
    break;
  }
}

if (!opportunityFound) {
  throw new Error(`Opportunity with ID ${opportunityId} not found in contact data`);
}

// ============ UPDATE TOTAL COUNT FOR ALL OPPORTUNITIES ============
// Get total count of objects in array
const totalCount = updatedTrackHelper.length;

// Update total_lead_in_hlelite_helper_kit for ALL objects in array
for (let i = 0; i < updatedTrackHelper.length; i++) {
  const obj = updatedTrackHelper[i];
  for (const key in obj) {
    if (obj[key] && typeof obj[key] === 'object') {
      obj[key].total_lead_in_hlelite_helper_kit = totalCount;
    }
  }
}

// Convert to string for storage
const finalValue = JSON.stringify(updatedTrackHelper);

// PUT request to update contact custom field
const putHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Version': '2021-07-28',
  'Authorization': 'Bearer pit-c3d64739-567f-4d89-8c91-c7037434e3f7'
};

const putData = {
  customFields: [{
    key: "opportunity_track_helper",
    field_value: finalValue
  }]
};

const updateResponse = await customRequest.put(
  `https://services.leadconnectorhq.com/contacts/${contactId}`, {
    data: putData,
    headers: putHeaders
  }
);

// Output
output = {
  result: finalValue,
  opportunityId: opportunityId,
  totalCount: totalCount,
  removedOpportunities: removedOpportunities,
  invoiceNo: invoiceData.invoice_no,
  invoiceUpdated: invoiceUpdated,
  updateStatus: updateResponse.status,
  updateData: updateResponse.data
};
