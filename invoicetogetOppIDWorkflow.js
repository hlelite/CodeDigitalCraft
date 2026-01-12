// This is wrapped in an async function
const invoice = inputData.invoice;
const locationId = inputData.location_id;
const apiKey = inputData.api;

// Build URL
const url = 'https://services.leadconnectorhq.com/invoices/' + 
    '?altId=' + locationId + 
    '&altType=location' + 
    '&search=' + invoice + 
    '&limit=100' + 
    '&offset=0';

// Call the API
const response = await customRequest.get(url, {
    headers: {
        'Accept': 'application/json',
        'Version': '2021-07-28',
        'Authorization': 'Bearer ' + apiKey
    }
});

const data = response.data;

// Console log the data
console.log('Full Response:', JSON.stringify(data, null, 2));

// Extract values
let result = {
    invoiceNumber: null,
    opportunityId: null
};

if (data.invoices && data.invoices.length > 0) {
    result.invoiceNumber = data.invoices[0].invoiceNumber;
    result.opportunityId = data.invoices[0].opportunityDetails && data.invoices[0].opportunityDetails.opportunityId || null;
}

console.log('Result:', result);

output = result;