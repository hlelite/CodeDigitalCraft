// Debug: Log input data
console.log('=== INPUT DATA ===');
console.log('Keys:', Object.keys(inputData).join(', '));

const contactId = inputData.contactId;
const opportunityId = inputData.opportunityId;
let estimateDataInput = inputData.data || inputData.estimateData || inputData.estimates;
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

// Log extracted values
console.log('contactId:', contactId);
console.log('opportunityId:', opportunityId);
console.log('locationId:', locationId);
console.log('estimateDataInput type:', typeof estimateDataInput);

// Extract estimate from input data
// Handle multiple formats
let estimateData;

// Check for individual fields first: estimateNumber, estimateUrl, estimateName
if (!estimateDataInput && inputData.estimateNumber) {
  console.log('Format detected: Individual fields (estimateNumber, estimateUrl, estimateName) in inputData');
  estimateData = {
    id: inputData.estimateNumber,
    number: inputData.estimateNumber,
    url: inputData.estimateUrl || '',
    name: inputData.estimateName || ''
  };
}

if (!estimateDataInput && !estimateData) {
  throw new Error('estimateData is missing from input');
}

// Try parsing if it's a string (only if estimateData not already set)
if (!estimateData && typeof estimateDataInput === 'string') {
  try {
    estimateDataInput = JSON.parse(estimateDataInput);
    console.log('Parsed estimateDataInput from string:', estimateDataInput);
  } catch (e) {
    console.log('Failed to parse estimateDataInput string');
  }
}

// Format 1: { estimates: [{...}] } - array
if (!estimateData && estimateDataInput && estimateDataInput.estimates && Array.isArray(estimateDataInput.estimates) && estimateDataInput.estimates.length > 0) {
  console.log('Format detected: { estimates: [{...}] } - array');
  estimateData = estimateDataInput.estimates[0];
  // Normalize: if 'number' exists but not 'id' (or id is empty string), copy it to 'id'
  if (estimateData.number && (!estimateData.id || estimateData.id.toString().trim() === '')) {
    estimateData.id = estimateData.number;
  }
}
// Format 1b: { estimates: {...} } - object (NOT array)
else if (!estimateData && estimateDataInput && estimateDataInput.estimates && typeof estimateDataInput.estimates === 'object' && !Array.isArray(estimateDataInput.estimates)) {
  console.log('Format detected: { estimates: {...} } - object');
  estimateData = estimateDataInput.estimates;
  // Normalize: if 'number' exists but not 'id' (or id is empty string), copy it to 'id'
  if (estimateData.number && (!estimateData.id || estimateData.id.toString().trim() === '')) {
    estimateData.id = estimateData.number;
  }
}
// Format 2: { id, name, url, ... } or { number, name, url, ... }
else if (!estimateData && estimateDataInput && (estimateDataInput.id || estimateDataInput.number)) {
  console.log('Format detected: { id/number, name, ... }');
  estimateData = estimateDataInput;
  // Normalize: if 'number' exists but not 'id' (or id is empty string), copy it to 'id'
  if (estimateDataInput.number && (!estimateDataInput.id || estimateDataInput.id.toString().trim() === '')) {
    estimateData.id = estimateDataInput.number;
  }
}
// Format 3: Direct array [{ id, ... }]
else if (!estimateData && Array.isArray(estimateDataInput) && estimateDataInput.length > 0) {
  console.log('Format detected: [{...}]');
  estimateData = estimateDataInput[0];
}
// Format 4: Maybe estimates is a string that needs parsing
else if (!estimateData && estimateDataInput && typeof estimateDataInput === 'string') {
  try {
    const parsed = JSON.parse(estimateDataInput);
    console.log('Format detected: String that needs parsing');
    if (Array.isArray(parsed) && parsed.length > 0) {
      estimateData = parsed[0];
    } else if (parsed.estimates && Array.isArray(parsed.estimates)) {
      estimateData = parsed.estimates[0];
    } else if (parsed.id) {
      estimateData = parsed;
    }
  } catch (e) {
    console.log('Failed to parse estimate string:', e.message);
  }
}

// Last resort: check if inputData itself has estimates structure
if (!estimateData && inputData.estimates) {
  if (Array.isArray(inputData.estimates) && inputData.estimates.length > 0) {
    console.log('Format detected: estimates array directly in inputData');
    estimateData = inputData.estimates[0];
  } else if (typeof inputData.estimates === 'object' && !Array.isArray(inputData.estimates)) {
    console.log('Format detected: estimates object directly in inputData');
    estimateData = inputData.estimates;
  }
}

// Normalize after detection
if (estimateData && estimateData.number && (!estimateData.id || estimateData.id.toString().trim() === '')) {
  estimateData.id = estimateData.number;
}

if (!estimateData) {
  console.log('No valid format detected.');
  console.log('estimateDataInput type:', typeof estimateDataInput);
  console.log('estimateDataInput keys:', Object.keys(estimateDataInput || {}));
  console.log('estimateDataInput value:', JSON.stringify(estimateDataInput));
  console.log('Is estimateDataInput an object?', typeof estimateDataInput === 'object');
  console.log('Is estimateDataInput an array?', Array.isArray(estimateDataInput));

  // One more attempt: if estimateDataInput is an object with keys, try treating it as estimate data
  if (estimateDataInput && typeof estimateDataInput === 'object' && Object.keys(estimateDataInput).length > 0) {
    console.log('Last attempt: treating estimateDataInput as direct estimate object');
    estimateData = estimateDataInput;
    if (estimateData.number && (!estimateData.id || estimateData.id.toString().trim() === '')) {
      estimateData.id = estimateData.number;
    }
  }
}

if (!estimateData) {
  throw new Error('Estimate data format not recognized. Please provide estimate data with id or number field');
}

console.log('Extracted estimateData:', JSON.stringify(estimateData));

// Final normalization: ensure 'id' exists and is not empty (copy from 'number' if needed)
if (estimateData.number && (!estimateData.id || estimateData.id.toString().trim() === '')) {
  estimateData.id = estimateData.number;
}

// Validate estimate data
if (!estimateData || !estimateData.id || estimateData.id.toString().trim() === '') {
  console.log('Validation failed. estimateData:', estimateData);
  throw new Error('Estimate data with id or number is required');
}

console.log('Estimate validation passed. id:', estimateData.id);

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

// ============ FIND OPPORTUNITY AND UPDATE ESTIMATE ============
let opportunityFound = false;
let estimateUpdated = false;

for (let i = 0; i < updatedTrackHelper.length; i++) {
  if (updatedTrackHelper[i][opportunityId] !== undefined) {
    // Opportunity found
    const existingData = updatedTrackHelper[i][opportunityId];
    const existingEstimates = existingData.estimates || [];

    // Check if estimate already exists
    let estimateFound = false;

    for (let j = 0; j < existingEstimates.length; j++) {
      if (existingEstimates[j].id === estimateData.id) {
        // Estimate exists - UPDATE it
        existingEstimates[j] = {
          ...existingEstimates[j],
          ...estimateData
        };
        estimateFound = true;
        estimateUpdated = true;
        console.log('Estimate updated:', estimateData.id);
        break;
      }
    }

    if (!estimateFound) {
      // Estimate doesn't exist - APPEND it
      existingEstimates.push(estimateData);
      estimateUpdated = true;
      console.log('Estimate added:', estimateData.id);
    }

    // Update the opportunity with modified estimates
    updatedTrackHelper[i][opportunityId].estimates = existingEstimates;
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
  'Authorization': `Bearer ${apiToken}`
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
  estimateId: estimateData.id,
  estimateNumber: estimateData.number || estimateData.id,
  estimateName: estimateData.name || 'N/A',
  estimateUrl: estimateData.url || 'N/A',
  estimateUpdated: estimateUpdated,
  updateStatus: updateResponse.status,
  updateData: updateResponse.data
};
