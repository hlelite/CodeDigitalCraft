// Debug: Log input data
console.log('=== INPUT DATA ===');
console.log('Keys:', Object.keys(inputData).join(', '));

const contactId = inputData.contactId;
const opportunityId = inputData.opportunityId;
let contractDataInput = inputData.data || inputData.contractData || inputData.contracts;
const locationId = inputData.locationId || inputData.location_id;
const apiToken = inputData.api || inputData.apiToken || inputData.token;

// Validate required fields
if (!contactId) throw new Error('contactId is required');
if (!locationId) throw new Error('locationId is required');
if (!apiToken) throw new Error('api token is required');

// opportunityId is optional - if not provided, we'll search for it by ContractsId

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
console.log('contractDataInput type:', typeof contractDataInput);

// Extract contract from input data
// Handle multiple formats
let contractData;

// Check for individual fields first: ContractsName, ContractsUrl, ContractsPdfLink, ContractsPreviewUrl, ContractsStatus
if (!contractDataInput && (inputData.ContractsName || inputData.ContractsPdfLink || inputData.ContractsPreviewUrl)) {
  console.log('Format detected: Individual fields (ContractsName, ContractsPdfLink, etc.) in inputData');

  // Extract ContractsId from ContractsPreviewUrl or ContractsUrl
  let contractsId = null;
  if (inputData.ContractsPreviewUrl) {
    const match = inputData.ContractsPreviewUrl.match(/\/([a-f0-9-]{36})(?:\?|$)/i);
    if (match) {
      contractsId = match[1];
      console.log('Extracted ContractsId from ContractsPreviewUrl:', contractsId);
    }
  }
  // If not found in PreviewUrl, try ContractsUrl
  if (!contractsId && inputData.ContractsUrl) {
    const match = inputData.ContractsUrl.match(/\/([a-f0-9-]{36})(?:\?|$)/i);
    if (match) {
      contractsId = match[1];
      console.log('Extracted ContractsId from ContractsUrl:', contractsId);
    }
  }

  contractData = {
    id: contractsId || inputData.ContractsName || `contract_${Date.now()}`,
    name: inputData.ContractsName || '',
    pdfLink: inputData.ContractsPdfLink || '',
    url: inputData.ContractsUrl || '',
    previewUrl: inputData.ContractsPreviewUrl || '',
    status: inputData.ContractsStatus || ''
  };
}

if (!contractDataInput && !contractData) {
  throw new Error('contractData is missing from input');
}

// Try parsing if it's a string (only if contractData not already set)
if (!contractData && typeof contractDataInput === 'string') {
  try {
    contractDataInput = JSON.parse(contractDataInput);
    console.log('Parsed contractDataInput from string:', contractDataInput);
  } catch (e) {
    console.log('Failed to parse contractDataInput string');
  }
}

// Format 1: { contracts: [{...}] } - array
if (!contractData && contractDataInput && contractDataInput.contracts && Array.isArray(contractDataInput.contracts) && contractDataInput.contracts.length > 0) {
  console.log('Format detected: { contracts: [{...}] } - array');
  contractData = contractDataInput.contracts[0];
}
// Format 1b: { contracts: {...} } - object (NOT array)
else if (!contractData && contractDataInput && contractDataInput.contracts && typeof contractDataInput.contracts === 'object' && !Array.isArray(contractDataInput.contracts)) {
  console.log('Format detected: { contracts: {...} } - object');
  contractData = contractDataInput.contracts;
}
// Format 2: { name, pdfLink, url, previewUrl, ... }
else if (!contractData && contractDataInput && (contractDataInput.name || contractDataInput.ContractsName || contractDataInput.pdfLink || contractDataInput.ContractsPdfLink)) {
  console.log('Format detected: { name/ContractsName, pdfLink, ... }');
  contractData = {
    name: contractDataInput.name || contractDataInput.ContractsName || '',
    pdfLink: contractDataInput.pdfLink || contractDataInput.ContractsPdfLink || '',
    url: contractDataInput.url || contractDataInput.ContractsUrl || '',
    previewUrl: contractDataInput.previewUrl || contractDataInput.ContractsPreviewUrl || ''
  };
  if (contractDataInput.id) {
    contractData.id = contractDataInput.id;
  }
}
// Format 3: Direct array [{ name, ... }]
else if (!contractData && Array.isArray(contractDataInput) && contractDataInput.length > 0) {
  console.log('Format detected: [{...}]');
  contractData = contractDataInput[0];
}
// Format 4: Maybe contracts is a string that needs parsing
else if (!contractData && contractDataInput && typeof contractDataInput === 'string') {
  try {
    const parsed = JSON.parse(contractDataInput);
    console.log('Format detected: String that needs parsing');
    if (Array.isArray(parsed) && parsed.length > 0) {
      contractData = parsed[0];
    } else if (parsed.contracts && Array.isArray(parsed.contracts)) {
      contractData = parsed.contracts[0];
    } else if (parsed.name || parsed.ContractsName) {
      contractData = parsed;
    }
  } catch (e) {
    console.log('Failed to parse contract string:', e.message);
  }
}

// Last resort: check if inputData itself has contracts structure
if (!contractData && inputData.contracts) {
  if (Array.isArray(inputData.contracts) && inputData.contracts.length > 0) {
    console.log('Format detected: contracts array directly in inputData');
    contractData = inputData.contracts[0];
  } else if (typeof inputData.contracts === 'object' && !Array.isArray(inputData.contracts)) {
    console.log('Format detected: contracts object directly in inputData');
    contractData = inputData.contracts;
  }
}

if (!contractData) {
  console.log('No valid format detected.');
  console.log('contractDataInput type:', typeof contractDataInput);
  console.log('contractDataInput keys:', Object.keys(contractDataInput || {}));
  console.log('contractDataInput value:', JSON.stringify(contractDataInput));
  console.log('Is contractDataInput an object?', typeof contractDataInput === 'object');
  console.log('Is contractDataInput an array?', Array.isArray(contractDataInput));

  // One more attempt: if contractDataInput is an object with keys, try treating it as contract data
  if (contractDataInput && typeof contractDataInput === 'object' && Object.keys(contractDataInput).length > 0) {
    console.log('Last attempt: treating contractDataInput as direct contract object');
    contractData = contractDataInput;
  }
}

if (!contractData) {
  throw new Error('Contract data format not recognized. Please provide contract data');
}

// Normalize field names to consistent format
if (contractData) {
  const normalized = {
    name: contractData.name || contractData.ContractsName || '',
    pdfLink: contractData.pdfLink || contractData.ContractsPdfLink || '',
    url: contractData.url || contractData.ContractsUrl || '',
    previewUrl: contractData.previewUrl || contractData.ContractsPreviewUrl || '',
    status: contractData.status || contractData.ContractsStatus || ''
  };

  // Keep ID if it exists, otherwise extract from previewUrl or url
  if (contractData.id) {
    normalized.id = contractData.id;
  } else {
    // Try to extract ID from previewUrl first
    let extractedId = null;
    if (normalized.previewUrl) {
      const match = normalized.previewUrl.match(/\/([a-f0-9-]{36})(?:\?|$)/i);
      if (match) {
        extractedId = match[1];
        console.log('Extracted ContractsId from previewUrl:', extractedId);
      }
    }
    // If not found in previewUrl, try url
    if (!extractedId && normalized.url) {
      const match = normalized.url.match(/\/([a-f0-9-]{36})(?:\?|$)/i);
      if (match) {
        extractedId = match[1];
        console.log('Extracted ContractsId from url:', extractedId);
      }
    }
    // Use extracted ID, or fallback to name or timestamp
    normalized.id = extractedId || normalized.name || `contract_${Date.now()}`;
  }

  contractData = normalized;
}

console.log('Extracted contractData:', JSON.stringify(contractData));

// Validate contract data - must have either ID or name
if (!contractData || (!contractData.id && !contractData.name) ||
    (contractData.id && contractData.id.toString().trim() === '') ||
    (!contractData.id && contractData.name && contractData.name.toString().trim() === '')) {
  console.log('Validation failed. contractData:', contractData);
  throw new Error('Contract data with id or name is required');
}

console.log('Contract validation passed. id:', contractData.id, 'name:', contractData.name);

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

// ============ FIND OPPORTUNITY AND UPDATE CONTRACT ============
let opportunityFound = false;
let contractUpdated = false;
let foundOpportunityId = opportunityId; // Track which opportunity we found

if (opportunityId) {
  // SCENARIO 1: opportunityId provided - search that specific opportunity
  console.log('Searching for opportunity:', opportunityId);

  for (let i = 0; i < updatedTrackHelper.length; i++) {
    if (updatedTrackHelper[i][opportunityId] !== undefined) {
      // Opportunity found
      const existingData = updatedTrackHelper[i][opportunityId];
      const existingContracts = existingData.contracts || [];

      // Check if contract already exists (by id or name)
      let contractFound = false;

      for (let j = 0; j < existingContracts.length; j++) {
        if (existingContracts[j].id === contractData.id || existingContracts[j].name === contractData.name) {
          // Contract exists - UPDATE it
          existingContracts[j] = {
            ...existingContracts[j],
            ...contractData
          };
          contractFound = true;
          contractUpdated = true;
          console.log('Contract updated:', contractData.name);
          break;
        }
      }

      if (!contractFound) {
        // Contract doesn't exist - APPEND it
        existingContracts.push(contractData);
        contractUpdated = true;
        console.log('Contract added:', contractData.name);
      }

      // Update the opportunity with modified contracts
      updatedTrackHelper[i][opportunityId].contracts = existingContracts;
      opportunityFound = true;
      break;
    }
  }

  if (!opportunityFound) {
    throw new Error(`Opportunity with ID ${opportunityId} not found in contact data`);
  }
} else {
  // SCENARIO 2: No opportunityId - search ALL opportunities for contract with matching ContractsId
  console.log('No opportunityId provided. Searching all opportunities for contract with ID:', contractData.id);

  for (let i = 0; i < updatedTrackHelper.length; i++) {
    const oppId = Object.keys(updatedTrackHelper[i])[0];
    const existingData = updatedTrackHelper[i][oppId];
    const existingContracts = existingData.contracts || [];

    // Search for contract with matching ID
    for (let j = 0; j < existingContracts.length; j++) {
      if (existingContracts[j].id === contractData.id) {
        // Contract found - UPDATE it
        existingContracts[j] = {
          ...existingContracts[j],
          ...contractData
        };
        contractUpdated = true;
        opportunityFound = true;
        foundOpportunityId = oppId;
        console.log('Contract found and updated in opportunity:', oppId);
        break;
      }
    }

    if (opportunityFound) {
      // Update the opportunity with modified contracts
      updatedTrackHelper[i][oppId].contracts = existingContracts;
      break;
    }
  }

  if (!opportunityFound) {
    throw new Error(`Contract with ID ${contractData.id} not found in any opportunity. Please provide opportunityId to create a new contract.`);
  }
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
  opportunityId: foundOpportunityId,  // The opportunity where contract was found/updated
  totalCount: totalCount,
  removedOpportunities: removedOpportunities,
  contractId: contractData.id,
  contractName: contractData.name,
  contractPdfLink: contractData.pdfLink || 'N/A',
  contractUrl: contractData.url || 'N/A',
  contractPreviewUrl: contractData.previewUrl || 'N/A',
  contractStatus: contractData.status || 'N/A',
  contractUpdated: contractUpdated,
  updateStatus: updateResponse.status,
  updateData: updateResponse.data
};
