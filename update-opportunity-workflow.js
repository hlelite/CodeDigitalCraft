const data = inputData.data;
const contactId = inputData.contactId;
const api = inputData.api;
const opportunityId = inputData.opportunityId;
const locationId = inputData.locationId || inputData.location_id;

// Custom field IDs for images and files
const AFTER_IMAGES_FIELD_ID = "J7yOa10VTpuQFwwpup9w";
const BEFORE_IMAGES_FIELD_ID = "4frR2sKYAEhhzacBfn82";
const SHARED_FILES_FIELD_ID = "4frR2sKYAEhhzacBfnew1";

// Parse the input data - handle different formats
let parsedData;

try {
  if (typeof data === 'string') {
    if (data.trim().startsWith('{')) {
      parsedData = JSON.parse(data);
    } else {
      parsedData = JSON.parse(`{${data}}`);
    }
  } else if (typeof data === 'object') {
    parsedData = data;
  }
} catch (e) {
  const match = data.match(/"([^"]+)"\s*:\s*(\{[\s\S]*\}|\[[\s\S]*\]|"[^"]*"|[0-9]+|true|false|null)/);
  if (match) {
    parsedData = { [match[1]]: JSON.parse(match[2]) };
  } else {
    throw new Error(`Unable to parse data: ${data}`);
  }
}

// Get the key from parsedData (e.g., "12345")
const inputKey = Object.keys(parsedData)[0];
const inputValue = parsedData[inputKey];

// Headers for API calls
const headers = {
  'Accept': 'application/json',
  'Version': '2021-07-28',
  'Authorization': 'Bearer ' + api
};

// ============ FETCH OPPORTUNITY FOR IMAGES AND SHARED FILES ============
let BeforeImages = [];
let AfterImages = [];
let shareFiles = [];

if (opportunityId) {
  try {
    const opportunityResponse = await customRequest.get(
      `https://services.leadconnectorhq.com/opportunities/${opportunityId}`, {
        headers
      }
    );

    const customFields = opportunityResponse.data.opportunity.customFields || [];

    for (const field of customFields) {
      if (field.id === AFTER_IMAGES_FIELD_ID && Array.isArray(field.fieldValue)) {
        for (const img of field.fieldValue) {
          if (img && img.deleted === false && img.url) {
            AfterImages.push(img.url);
          }
        }
      }

      if (field.id === BEFORE_IMAGES_FIELD_ID && Array.isArray(field.fieldValue)) {
        for (const img of field.fieldValue) {
          if (img && img.deleted === false && img.url) {
            BeforeImages.push(img.url);
          }
        }
      }

      if (field.id === SHARED_FILES_FIELD_ID && Array.isArray(field.fieldValue)) {
        for (const file of field.fieldValue) {
          if (file && file.deleted === false && file.url) {
            shareFiles.push({
              name: (file.meta && file.meta.name) ? file.meta.name : 'Unnamed File',
              url: file.url
            });
          }
        }
      }
    }
  } catch (e) {
    console.log('Failed to fetch opportunity data:', e.message);
  }
}

// ============ ADD IMAGES AND SHARED FILES TO INPUT VALUE ============
inputValue.BeforeImages = BeforeImages;
inputValue.AfterImages = AfterImages;
inputValue.shareFiles = shareFiles;

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

// ============ FIND AND UPDATE OPPORTUNITY ============
let opportunityFound = false;

for (let i = 0; i < updatedTrackHelper.length; i++) {
  if (updatedTrackHelper[i][inputKey] !== undefined) {
    // Opportunity found - update with new data
    const existingData = updatedTrackHelper[i][inputKey];

    // Merge new data with existing data
    updatedTrackHelper[i][inputKey] = {
      ...existingData,  // Keep all existing fields
      ...inputValue     // Overwrite with new data (includes images and shareFiles)
    };

    opportunityFound = true;
    console.log('Opportunity updated:', inputKey);
    break;
  }
}

if (!opportunityFound) {
  // Opportunity not found - CREATE it
  console.log('Opportunity not found, creating new entry:', inputKey);
  updatedTrackHelper.push({
    [inputKey]: inputValue
  });
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
  'Authorization': 'Bearer ' + api
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
  opportunityId: inputKey,
  totalCount: totalCount,
  removedOpportunities: removedOpportunities,
  BeforeImages: BeforeImages,
  AfterImages: AfterImages,
  shareFiles: shareFiles,
  updateStatus: updateResponse.status,
  updateData: updateResponse.data
};
