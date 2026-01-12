//need too add button after .flex flex-col items-center justify-center border-0 border-b border-solid border-clientportal-border px-4 pb-6
(function() {
    'use strict';

    // ============================================
    // CONFIGURATION OBJECT - UPDATE SETTINGS HERE
    // ============================================

    // Function to get current script tag and read data attributes
    function getScriptConfig() {
        const currentScript = document.currentScript ||
                             document.querySelector('script[src*="main_code.js"]') ||
                             document.querySelector('script[src*="index.js"]');

        if (!currentScript) {
            console.warn('Could not find script tag. Using default configuration.');
            return {};
        }

        const dataset = currentScript.dataset;
        console.log('Script tag data attributes:', dataset);

        return {
            apiKey: dataset.apiKey || dataset.apitoken,
            agencyId: dataset.agencyId,
            theme: dataset.theme,
            brandColor: dataset.brandColor || dataset.primaryColor,
            secondaryColor: dataset.secondaryColor,
            neutralColor: dataset.neutralColor,
            logoUrl: dataset.logoUrl,
            companyWebsite: dataset.companyWebsite
        };
    }

    // Get configuration from script tag
    const scriptConfig = getScriptConfig();

    // Default/Fallback Configuration
    const CONFIG = {
        // API Configuration
        api: {
            token: scriptConfig.apiKey || 'pit-a23fcd36-d811-4da5-8a11-064f4f28f947'
        },

        // Custom Field IDs (for images and files)
        customFields: {
            afterImages: 'J7yOa10VTpuQFwwpup9w',
            beforeImages: '4frR2sKYAEhhzacBfn82',
            sharedFiles: '4frR2sKYAEhhzacBfnew1'
        },

        // Company Branding
        branding: {
            logoUrl: scriptConfig.logoUrl || 'https://msgsndr-private.storage.googleapis.com/companyPhotos/afc04bf5-2bc5-40ff-a172-b10a8685a4e3.png',
            companyWebsite: scriptConfig.companyWebsite || 'https://valjtqdbxqs7iql1iib2.app.clientclub.net/home'
        },

        // Color Scheme - Can be overridden via data attributes
        colors: {
            primary: scriptConfig.brandColor || '#ff5e15',    // Main brand color (buttons, links)
            secondary: scriptConfig.secondaryColor || '#dc2626',  // Accent color (PDF buttons, errors)
            neutral: scriptConfig.neutralColor || '#8a9bb5'     // Gray color (text, borders)
        },

        // Typography
        fonts: {
            family: "'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
            weights: {
                normal: 400,
                medium: 500,
                semibold: 600,
                bold: 700
            }
        }
    };

    console.log('=== FINAL CONFIGURATION ===');
    console.log('API Token:', CONFIG.api.token);
    console.log('Brand Colors:', CONFIG.colors);
    console.log('Logo URL:', CONFIG.branding.logoUrl);

    // Static configuration (don't change these)
    const STATIC_CONFIG = {
        api: {
            baseUrl: 'https://services.leadconnectorhq.com',
            version: '2021-07-28'
        },
        customFields: {
            opportunityTrackHelper: 'opportunity_track_helper'
        },
        gallery: {
            itemsPerPage: 4
        },
        stages: {
            'Deposit Due': 1,
            'Survey To Be Scheduled': 2,
            'Survey Scheduled': 3,
            'Get Contract Ready': 4,
            'Contract To Be Signed': 5,
            'Items To Be Ordered': 6,
            'Items To Be Signed Off': 7,
            'Waiting For Delivery': 8,
            'Fitting Date To Be Scheduled': 9,
            'Fitting Date Scheduled': 10,
            'Installation Complete': 11,
            'Balance To Be Collected': 12,
            'Job Complete': 13
        },
        redirects: {
            login: '/login'
        }
    };

    // Helper function to darken a color by a percentage
    function darkenColor(hex, percent) {
        // Remove # if present
        hex = hex.replace('#', '');

        // Convert to RGB
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        // Darken by reducing each channel
        r = Math.floor(r * (1 - percent / 100));
        g = Math.floor(g * (1 - percent / 100));
        b = Math.floor(b * (1 - percent / 100));

        // Convert back to hex
        const rr = r.toString(16).padStart(2, '0');
        const gg = g.toString(16).padStart(2, '0');
        const bb = b.toString(16).padStart(2, '0');

        return `#${rr}${gg}${bb}`;
    }

    // Auto-generated colors from base colors (don't edit)
    const COLORS = {
        // Primary colors
        primary: CONFIG.colors.primary,
        primaryHover: darkenColor(CONFIG.colors.primary, 15),  // Darker shade of primary

        // Secondary colors
        secondary: CONFIG.colors.secondary,
        secondaryHover: darkenColor(CONFIG.colors.secondary, 15),  // Darker shade of secondary

        // Status colors (derived from primary/secondary)
        success: '#059669',      // Green for completed/paid
        successBg: '#d1fae5',
        warning: '#d97706',      // Orange for pending
        warningBg: '#fef3c7',
        error: CONFIG.colors.secondary,  // Use secondary color for errors
        errorBg: '#fee2e2',
        info: CONFIG.colors.primary,  // Use primary color for info
        infoBg: '#dbeafe',

        // Neutral colors
        neutral: CONFIG.colors.neutral,
        neutralBg: '#f0f4f8',
        text: '#1e293b',
        textSecondary: '#64748b',
        border: '#e2e8f0',
        background: '#ffffff'
    };
    // ============================================

    // Function to inject CSS custom properties dynamically
    function injectDynamicStyles() {
        const styleElement = document.createElement('style');
        styleElement.id = 'dynamic-color-styles';
        styleElement.textContent = `
            :root {
                --primary: ${CONFIG.colors.primary};
                --primary-hover: ${COLORS.primaryHover};
                --secondary: ${CONFIG.colors.secondary};
                --secondary-hover: ${COLORS.secondaryHover};
                --neutral: ${CONFIG.colors.neutral};
                --text-light: ${CONFIG.colors.neutral};
            }
        `;
        document.head.appendChild(styleElement);
        console.log('Dynamic color styles injected:', CONFIG.colors);
    }

    // Inject dynamic styles immediately
    injectDynamicStyles();

    console.log('=== CLIENT PORTAL SCRIPT LOADED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('URL:', window.location.href);
    console.log('User Agent:', navigator.userAgent);

    // Store opportunities data globally
    var opportunitiesData = null;
    var currentOpportunityId = null;

    // Gallery carousel variables
    var currentGalleryPage = 0;
    var galleryItemsPerPage = STATIC_CONFIG.gallery.itemsPerPage;
    var currentGalleryItems = [];
    var currentGalleryType = 'before';

    // Function to get contact ID from URL params or localStorage
    function getContactId() {
        console.log('=== GETTING CONTACT ID ===');
        const urlParams = new URLSearchParams(window.location.search);
        console.log('URL Params:', Object.fromEntries(urlParams));

        const contactId = urlParams.get('contactId') || urlParams.get('contact_id');
        if (contactId) {
            console.log('Contact ID found in URL:', contactId);
            return contactId;
        }

        // Check localStorage for direct contactId
        const storedContactId = localStorage.getItem('contactId') || localStorage.getItem('contact_id');
        if (storedContactId) {
            console.log('Contact ID found in localStorage:', storedContactId);
            return storedContactId;
        }

        // Check localStorage for event object
        try {
            const eventData = localStorage.getItem('event');
            console.log('Event data from localStorage:', eventData);
            if (eventData) {
                const event = JSON.parse(eventData);
                console.log('Parsed event object:', event);
                if (event && event.contactId) {
                    console.log('Contact ID found in event object:', event.contactId);
                    return event.contactId;
                }
            }
        } catch (error) {
            console.error('Error parsing event from localStorage:', error);
        }

        console.log('No contact ID found');
        return null;
    }

    // Function to fetch contact data from API
    function fetchContactData(contactId) {
        console.log('=== FETCHING CONTACT DATA ===');
        console.log('Contact ID:', contactId);
        const apiUrl = `${STATIC_CONFIG.api.baseUrl}/contacts/${contactId}`;
        console.log('API URL:', apiUrl);

        return fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Version': STATIC_CONFIG.api.version,
                'Authorization': `Bearer ${CONFIG.api.token}`
            }
        })
        .then(response => {
            console.log('API Response Status:', response.status);
            console.log('API Response OK:', response.ok);
            if (response.ok) {
                return response.json();
            } else {
                console.error('API Error - Status:', response.status);
                return Promise.reject('API Error');
            }
        })
        .catch(error => {
            console.error('Fetch Contact Data Error:', error);
            throw error;
        });
    }

    // Function to parse opportunities data from custom fields
    function parseOpportunitiesData(customFields) {
        if (!customFields || !Array.isArray(customFields)) return null;

        const matchingField = customFields.find(field =>
            field.value && typeof field.value === 'string' && field.value.includes('total_lead_in_hlelite_helper_kit')
        );

        if (!matchingField) {
            console.error('Not found: total_lead_in_hlelite_helper_kit');
            return null;
        }

        try {
            const parsedData = JSON.parse(matchingField.value);
            console.log('=== PARSED OPPORTUNITIES DATA ===', parsedData);

            if (Array.isArray(parsedData) && parsedData.length > 0) {
                const opportunities = [];
                parsedData.forEach(item => {
                    Object.keys(item).forEach(oppId => {
                        const opportunityData = { id: oppId, ...item[oppId] };
                        console.log('=== INDIVIDUAL OPPORTUNITY ===');
                        console.log('Opportunity ID:', oppId);
                        console.log('Full Opportunity Data:', opportunityData);
                        console.log('Available Fields:', Object.keys(opportunityData));
                        opportunities.push(opportunityData);
                    });
                });
                console.log('=== ALL OPPORTUNITIES ARRAY ===', opportunities);
                console.log('Total Opportunities:', opportunities.length);
                return opportunities;
            }
            return null;
        } catch (error) {
            console.error('Error parsing opportunities:', error);
            return null;
        }
    }

    // Function to get stage number from stage name
    function getStageNumber(stageName) {
        return STATIC_CONFIG.stages[stageName] || 1;
    }

    // Function to get current opportunity data
    function getCurrentOpportunity() {
        if (!opportunitiesData || !currentOpportunityId) return null;
        return opportunitiesData.find(opp => opp.id === currentOpportunityId);
    }

    // Function to update cards with current opportunity data
    function updateCardsWithData() {
        const opportunity = getCurrentOpportunity();
        if (!opportunity) {
            console.log('No opportunity found - using default stage');
            initializeProgressTracking(1);
            return;
        }

        console.log('=== UPDATING CARDS WITH OPPORTUNITY DATA ===');
        console.log('Full Opportunity Object:', opportunity);
        console.log('Opportunity ID:', opportunity.id);
        console.log('Opportunity Name:', opportunity.name);
        console.log('Opportunity Stage:', opportunity.stage);
        console.log('Contract Number:', opportunity.contract_number);
        console.log('Title/Last Name:', opportunity.TitleLastName);
        console.log('Payment Due Now:', opportunity.payment_due_now);
        console.log('Balance Outstanding:', opportunity.balance_outstanding);
        console.log('Contract Value:', opportunity.contract_value);
        console.log('Before Images:', opportunity.BeforeImages);
        console.log('After Images:', opportunity.AfterImages);
        console.log('Invoice Data:', opportunity.invoice);
        console.log('Shared Files:', opportunity.shareFiles);
        console.log('Contracts Data:', opportunity.contracts);
        console.log('Estimates Data:', opportunity.estimates);
        console.log('All Opportunity Keys:', Object.keys(opportunity));

        // Update dropdown (for display version, not needed for select)
        const dropdownValue = document.querySelector('.custom-order-dropdown-value');
        if (dropdownValue) {
            dropdownValue.textContent = `Order #${opportunity.contract_number} – ${opportunity.name}`;
        }

        // Update financial information
        const contractNumber = document.querySelector('.custom-contract-number');
        if (contractNumber) {
            contractNumber.textContent = `#${opportunity.contract_number || 'N/A'}`;
        }

        const customerName = document.querySelector('.custom-customer-name');
        if (customerName) {
            const title = opportunity.TitleLastName || 'Customer';
            customerName.textContent = title;
        }

        const paymentDueNow = document.querySelector('.custom-payment-due-now');
        if (paymentDueNow) {
            paymentDueNow.textContent = `£${parseFloat(opportunity.payment_due_now || 0).toFixed(2)}`;
        }

        const balanceOutstanding = document.querySelector('.custom-balance-outstanding');
        if (balanceOutstanding) {
            balanceOutstanding.textContent = `£${parseFloat(opportunity.balance_outstanding || 0).toFixed(2)}`;
        }

        const contractValue = document.querySelector('.custom-contract-value');
        if (contractValue) {
            contractValue.textContent = `£${parseFloat(opportunity.contract_value || 0).toFixed(2)}`;
        }

        // Update invoices
        const invoiceContainers = document.querySelectorAll('#invoiceContainer');
        const invoiceCards = document.querySelectorAll('#invoicesCard');

        if (invoiceContainers && invoiceContainers.length > 0) {
            const invoices = opportunity.invoice;
            console.log('=== RENDERING INVOICES ===');
            console.log('Invoice Data:', invoices);

            // Check if there are any invoices
            const hasInvoices = invoices && Array.isArray(invoices) && invoices.length > 0;

            if (hasInvoices) {
                // Show invoice card
                invoiceCards.forEach(card => {
                    if (card) card.style.display = 'block';
                });

                let invoiceHTML = '';
                invoices.forEach((invoice, index) => {
                    console.log(`Invoice ${index + 1}:`, invoice);
                    const invoiceNo = invoice.invoice_no || 'N/A';
                    const invoiceStatus = invoice.invoice_status || 'Unknown';
                    const invoiceUrl = invoice.invoice_url || '#';
                    const dueDate = invoice.due_date || '';
                    const issueDate = invoice.issue_date || '';

                    // Style invoice status with colors
                    let statusColor = CONFIG.colors.neutral; // default gray
                    let statusBg = '#f0f4f8';

                    if (invoiceStatus.toLowerCase() === 'paid') {
                        statusColor = '#059669';
                        statusBg = '#d1fae5';
                    } else if (invoiceStatus.toLowerCase() === 'unpaid' || invoiceStatus.toLowerCase() === 'pending') {
                        statusColor = '#dc2626';
                        statusBg = '#fee2e2';
                    } else if (invoiceStatus.toLowerCase() === 'partially_paid') {
                        statusColor = '#d97706';
                        statusBg = '#fef3c7';
                    }

                    invoiceHTML += `
                        <div style="padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 0.5rem; background: white;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 0.25rem;">Invoice #${invoiceNo}</div>
                                    <div style="display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 500; color: ${statusColor}; background: ${statusBg};">
                                        ${invoiceStatus}
                                    </div>
                                </div>
                                <a href="${invoiceUrl}" target="_blank" style="padding: 0.5rem 1rem; background: ${CONFIG.colors.primary}; color: white; border-radius: 6px; text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: background 0.2s;" onmouseover="this.style.background='${COLORS.primaryHover}'" onmouseout="this.style.background='${CONFIG.colors.primary}'">
                                    View Invoice
                                </a>
                            </div>
                        </div>
                    `;
                });

                invoiceContainers.forEach(container => {
                    container.innerHTML = invoiceHTML;
                });
            } else {
                // Hide invoice card if no invoices
                console.log('No invoices found - hiding invoice card');
                invoiceCards.forEach(card => {
                    if (card) card.style.display = 'none';
                });
            }
        }

        // Document tabs are initialized separately and handle their own rendering

        // Update progress with stage
        const stageNumber = getStageNumber(opportunity.stage);
        console.log('Stage Name:', opportunity.stage, '→ Stage Number:', stageNumber);
        initializeProgressTracking(stageNumber);

        // Update gallery with current opportunity images
        const activeTab = document.querySelector('.photo-tab-btn.tab-active');
        if (activeTab) {
            const tabType = activeTab.getAttribute('data-gallery-type') || 'before';
            const galleryGrid = document.getElementById('photoDisplayGrid');
            if (galleryGrid) {
                const items = tabType === 'before' ? opportunity.BeforeImages : opportunity.AfterImages;
                renderGalleryItems(items, tabType);
            }
        }

        // Update document tabs with current opportunity data
        const activeDocTab = document.querySelector('[data-doc-type].tab-active');
        if (activeDocTab) {
            const docType = activeDocTab.getAttribute('data-doc-type') || 'contracts';
            renderDocumentContent(docType);
        }
    }

    // Helper function to render gallery items (can be called from multiple places)
    function renderGalleryItems(items, tabType) {
        console.log('=== RENDERING GALLERY ITEMS ===');
        console.log('Tab Type:', tabType);
        console.log('Items:', items);
        console.log('Number of Items:', items ? items.length : 0);

        const galleryGrids = document.querySelectorAll('#photoDisplayGrid');
        console.log('Gallery Grids Found:', galleryGrids.length);

        if (!galleryGrids || galleryGrids.length === 0) {
            console.log('No gallery grids found');
            return;
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            console.log('No items to display');
            galleryGrids.forEach(galleryGrid => {
                galleryGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: ${CONFIG.colors.neutral}; padding: 2rem;">No images available</p>`;
            });
            return;
        }

        // Calculate pagination
        const startIndex = currentGalleryPage * galleryItemsPerPage;
        const endIndex = startIndex + galleryItemsPerPage;
        const paginatedItems = items.slice(startIndex, endIndex);

        const galleryHTML = paginatedItems.map((item, index) => {
            const url = typeof item === 'string' ? item : (item.url || item.URL || item);

            if (isPDF(url)) {
                return `
                    <div class="photo-card" data-url="${url}" data-type="pdf" style="overflow: hidden; width: 100%; height: 100%; box-sizing: border-box;">
                        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f0f4f8; cursor: pointer; box-sizing: border-box;">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${CONFIG.colors.primary}" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <text x="12" y="16" text-anchor="middle" fill="${CONFIG.colors.primary}" font-size="6" font-weight="bold">PDF</text>
                            </svg>
                            <span style="font-size: 0.75rem; color: #5a6b8a; margin-top: 0.5rem;">Click to open</span>
                        </div>
                    </div>
                `;
            } else if (isImage(url)) {
                return `
                    <div class="photo-card" data-url="${url}" data-type="image" style="overflow: hidden; width: 100%; height: 100%; box-sizing: border-box;">
                        <img src="${url}" alt="${tabType} ${index + 1}" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer; display: block; box-sizing: border-box;">
                    </div>
                `;
            } else {
                return `
                    <div class="photo-card" data-url="${url}" data-type="file" style="overflow: hidden; width: 100%; height: 100%; box-sizing: border-box;">
                        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f0f4f8; cursor: pointer; box-sizing: border-box;">
                            <span style="font-size: 0.75rem; color: #5a6b8a;">View File</span>
                        </div>
                    </div>
                `;
            }
        }).join('');

        // Update all gallery grids
        galleryGrids.forEach(galleryGrid => {
            galleryGrid.innerHTML = galleryHTML;
            // Ensure grid doesn't overflow
            galleryGrid.style.width = '100%';
            galleryGrid.style.maxWidth = '100%';
            galleryGrid.style.overflow = 'hidden';
            galleryGrid.style.boxSizing = 'border-box';
        });
        console.log('Gallery HTML rendered successfully');

        // Add click handlers - open everything in new tab
        setTimeout(() => {
            document.querySelectorAll('.photo-card').forEach(item => {
                item.addEventListener('click', () => {
                    const url = item.getAttribute('data-url');
                    console.log('Opening gallery item:', url);
                    // Open all gallery items (images, PDFs, files) in new tab
                    window.open(url, '_blank');
                });
            });
            console.log('Click handlers added to photo cards');
        }, 100);
    }

    // Load contact data on page load
    function loadContactData() {
        console.log('=== LOAD CONTACT DATA CALLED ===');
        const contactId = getContactId();

        if (!contactId) {
            console.error('❌ No contact ID found - Falling back to static UI');
            initializeStaticUI(); // Fallback to static UI
            return;
        }

        console.log('✅ Contact ID obtained, fetching data...');
        fetchContactData(contactId)
            .then(data => {
                console.log('=== RAW API RESPONSE ===');
                console.log('Full Response Data:', data);
                console.log('Contact Data:', data.contact);
                console.log('Custom Fields:', data.contact?.customFields);
                console.log('Number of Custom Fields:', data.contact?.customFields?.length);

                if (data.contact && data.contact.customFields) {
                    console.log('Parsing opportunities data from custom fields...');
                    opportunitiesData = parseOpportunitiesData(data.contact.customFields);

                    if (opportunitiesData && opportunitiesData.length > 0) {
                        console.log('=== ✅ OPPORTUNITIES SUCCESSFULLY LOADED ===');
                        console.log('Opportunities Data:', opportunitiesData);
                        console.log('Number of Opportunities:', opportunitiesData.length);
                        currentOpportunityId = opportunitiesData[0].id;
                        console.log('Current Opportunity ID Set To:', currentOpportunityId);
                        console.log('Initializing Dynamic UI...');
                        initializeDynamicUI();
                    } else {
                        console.log('❌ No opportunities found - initializing static UI');
                        initializeStaticUI();
                    }
                } else {
                    console.log('❌ No custom fields found - initializing static UI');
                    initializeStaticUI();
                }
            })
            .catch(error => {
                console.error('❌ Failed to load contact data:', error);
                console.error('Error Stack:', error.stack);
                initializeStaticUI();
            });
    }

    // Initialize with dynamic data from API
    function initializeDynamicUI() {
        console.log('=== INITIALIZING DYNAMIC UI ===');
        console.log('Opportunities Data:', opportunitiesData);
        console.log('Current Opportunity ID:', currentOpportunityId);

        waitforElement('.flex.flex-col.items-start.py-6', function(topMenu) {
            console.log('Top menu element found, creating cards container...');
            topMenu.classList.add('my-custom-button-container');
            var cardsContainer = document.createElement('div');
            cardsContainer.id = 'custom-cards-container';

            // Dynamic Order Selector Dropdown
            var orderSelector = document.createElement('div');
            orderSelector.className = 'custom-order-selector';

            let dropdownHTML = '<select class="custom-order-dropdown" id="orderDropdown">';
            opportunitiesData.forEach(opp => {
                const selected = opp.id === currentOpportunityId ? 'selected' : '';
                dropdownHTML += `<option value="${opp.id}" ${selected}>Order #${opp.contract_number} – ${opp.name}</option>`;
            });
            dropdownHTML += '</select>';
            orderSelector.innerHTML = dropdownHTML;

            setTimeout(() => {
                const dropdown = document.getElementById('orderDropdown');
                if (dropdown) {
                    dropdown.addEventListener('change', function(e) {
                        console.log('=== OPPORTUNITY CHANGED VIA DROPDOWN ===');
                        console.log('Previous Opportunity ID:', currentOpportunityId);
                        currentOpportunityId = e.target.value;
                        console.log('New Opportunity ID:', currentOpportunityId);
                        const selectedOpp = opportunitiesData.find(opp => opp.id === currentOpportunityId);
                        console.log('Selected Opportunity Data:', selectedOpp);
                        updateCardsWithData();
                    });
                }
            }, 100);

            cardsContainer.appendChild(orderSelector);
            createCards(cardsContainer);
            topMenu.parentNode.insertBefore(cardsContainer, topMenu.nextSibling);

            const opportunity = getCurrentOpportunity();
            const stageNumber = opportunity ? getStageNumber(opportunity.stage) : 1;
            initializeProgressTracking(stageNumber);
            initializeGalleryTabs();
            initializeDocumentTabs();
            updateCardsWithData();
        });
    }

    // Function to create all cards (shared by both dynamic and static UI)
    function createCards(cardsContainer) {

    // 1. Order Progress Card (Full Width)
    var progressCard = document.createElement('div');
    progressCard.className = 'custom-card';
    progressCard.innerHTML = `
        <h2 class="custom-card-title">Order Progress</h2>
        <div class="custom-progress-container">
            <div class="custom-progress-steps" id="customProgressSteps">
                <!-- Steps will be rendered by JavaScript -->
            </div>
        </div>
        <p class="custom-progress-status" id="customProgressStatus">Your order is being processed.</p>
    `;
    cardsContainer.appendChild(progressCard);

    // 2. Grid Container for Financial & Gallery (Side by Side)
    var gridContainer = document.createElement('div');
    gridContainer.className = 'custom-grid-2';
    gridContainer.style.overflow = 'hidden';
    gridContainer.style.width = '100%';
    gridContainer.style.maxWidth = '100%';
    gridContainer.style.boxSizing = 'border-box';

    // 2a. Financial Information Card
    var financialCard = document.createElement('div');
    financialCard.className = 'custom-card';
    financialCard.style.overflow = 'hidden';
    financialCard.style.boxSizing = 'border-box';
    financialCard.innerHTML = `
        <h2 class="custom-card-title">Financial Information</h2>
        <div class="custom-financial-row">
            <span class="custom-financial-label">Contract Value:</span>
            <span class="custom-financial-value custom-contract-value">£5,000.00</span>
        </div>
        <div class="custom-financial-row">
            <span class="custom-financial-label">Balance Outstanding:</span>
            <span class="custom-financial-value custom-balance-outstanding">£0.00</span>
        </div>
        <div class="custom-financial-row">
            <span class="custom-financial-label">Payment Due Now:</span>
            <span class="custom-financial-value custom-payment-due-now">£0.00</span>
        </div>
    `;
    gridContainer.appendChild(financialCard);

    // 2b. Photo Gallery Card
    var galleryCard = document.createElement('div');
    galleryCard.className = 'custom-card';
    galleryCard.style.overflow = 'hidden';
    galleryCard.style.boxSizing = 'border-box';
    galleryCard.style.width = '100%';
    galleryCard.innerHTML = `
        <h2 class="custom-card-title">Photo Gallery</h2>
        <div class="photo-showcase-tabs">
            <button class="photo-tab-btn tab-active" data-gallery-type="before">Before Photos</button>
            <button class="photo-tab-btn" data-gallery-type="after">After Photos</button>
        </div>
        <div class="photo-carousel-wrap" style="overflow: hidden; width: 100%;">
            <button class="carousel-nav-btn nav-btn-prev" id="photoPrevious">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>
            <div class="photo-display-area" style="overflow: hidden; width: 100%;">
                <div class="photo-items-grid" id="photoDisplayGrid" style="width: 100%; max-width: 100%; overflow: hidden;">
                    <p style="grid-column: 1/-1; text-align: center; color: ${CONFIG.colors.neutral}; padding: 2rem;">No images available</p>
                </div>
            </div>
            <button class="carousel-nav-btn nav-btn-next" id="photoNext">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
        </div>
    `;
    gridContainer.appendChild(galleryCard);

    cardsContainer.appendChild(gridContainer);

    // 3. Invoices Card (Full Width)
    var invoicesCard = document.createElement('div');
    invoicesCard.className = 'custom-card';
    invoicesCard.id = 'invoicesCard';
    invoicesCard.innerHTML = `
        <h2 class="custom-card-title">Invoices</h2>
        <div id="invoiceContainer" class="custom-invoice-container">
            <!-- Invoices will be rendered here -->
        </div>
    `;
    cardsContainer.appendChild(invoicesCard);

    // 4. Documents & Contracts Card (Full Width with Tabs)
    var documentsCard = document.createElement('div');
    documentsCard.className = 'custom-card';
    documentsCard.innerHTML = `
        <h2 class="custom-card-title">Documents & Contracts</h2>
        <div class="photo-showcase-tabs">
            <button class="photo-tab-btn tab-active" data-doc-type="contracts">Contracts</button>
            <button class="photo-tab-btn" data-doc-type="estimates">Estimates</button>
            <button class="photo-tab-btn" data-doc-type="shared">Shared Documents</button>
        </div>
        <div id="documentsDisplayArea" class="custom-documents-area" style="margin-top: 1rem;">
            <!-- Content will be rendered here based on active tab -->
        </div>
    `;
    cardsContainer.appendChild(documentsCard);

    }

    // Initialize with static data (fallback)
    function initializeStaticUI() {
        console.log('=== INITIALIZING STATIC UI (FALLBACK) ===');
        console.log('Using default/demo data');

        waitforElement('.flex.flex-col.items-start.py-6', function(topMenu) {
            console.log('Top menu element found for static UI...');
            topMenu.classList.add('my-custom-button-container');
            var cardsContainer = document.createElement('div');
            cardsContainer.id = 'custom-cards-container';

            // Static Order Selector
            var orderSelector = document.createElement('div');
            orderSelector.className = 'custom-order-selector';
            orderSelector.innerHTML = `
                <div class="custom-order-dropdown">
                    <span class="custom-order-dropdown-label">Your Orders:</span>
                    <span class="custom-order-dropdown-value">Order #1023 – Front Windows & Door</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
            `;
            cardsContainer.appendChild(orderSelector);
            createCards(cardsContainer);
            topMenu.parentNode.insertBefore(cardsContainer, topMenu.nextSibling);

            initializeProgressTracking(10);
            initializeGalleryTabs();
            initializeDocumentTabs();
        });

        // Also create mobile version for static UI
        waitforElement('.flex.flex-col.mt-12.p-4', function(mobileTarget) {
            var mobileContainer = document.createElement('div');
            mobileContainer.className = 'custom-mobile-container';
            mobileContainer.id = 'custom-mobile-cards-container';

            // Static Order Selector for mobile
            var orderSelector = document.createElement('div');
            orderSelector.className = 'custom-order-selector';
            orderSelector.innerHTML = `
                <div class="custom-order-dropdown" style="width: 100%;">
                    <span class="custom-order-dropdown-label">Your Orders:</span>
                    <span class="custom-order-dropdown-value">Order #1023 – Front Windows & Door</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
            `;
            mobileContainer.appendChild(orderSelector);
            createCards(mobileContainer);
            mobileTarget.parentNode.insertBefore(mobileContainer, mobileTarget.nextSibling);

            initializeProgressTracking(10);
            initializeGalleryTabs();
            initializeDocumentTabs();
        });
    }

    // Function to add logo to nav-container
    function addLogoToNav() {
        waitforElement('.nav-container', function(navContainer) {
            // Check if logo already exists
            if (navContainer.querySelector('.custom-nav-logo')) {
                return;
            }

            // Create logo link
            var logoLink = document.createElement('a');
            logoLink.href = CONFIG.branding.companyWebsite;
            logoLink.target = '_blank';
            logoLink.className = 'custom-nav-logo';
            logoLink.style.cssText = 'padding: 1rem; display: flex; align-items: center; text-decoration: none; cursor: pointer;';

            // Create logo image
            var logoImg = document.createElement('img');
            logoImg.src = CONFIG.branding.logoUrl;
            logoImg.alt = 'Company Logo';
            logoImg.style.cssText = 'max-height: 60px; height: auto; width: auto; max-width: 200px;';

            logoLink.appendChild(logoImg);

            // Prepend logo to nav-container (add at the beginning)
            navContainer.insertBefore(logoLink, navContainer.firstChild);

            console.log('Logo added to nav-container');
        });
    }

    // Add logo to navigation
    console.log('Adding logo to navigation...');
    addLogoToNav();

    // Function to add logout button after notification button
    function addLogoutButton() {
        waitforElement('#btn-notification', function(btnNotification) {
            const parentDiv = btnNotification.parentElement;

            if (!parentDiv) {
                console.error('Parent of #btn-notification not found');
                return;
            }

            // Check if logout button already exists
            if (parentDiv.querySelector('.custom-desktop-logout-btn')) {
                return;
            }

            // Create logout button for desktop
            var logoutBtn = document.createElement('button');
            logoutBtn.textContent = 'Logout';
            logoutBtn.className = 'custom-desktop-logout-btn';
            logoutBtn.style.cssText = `background: ${CONFIG.colors.primary}; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.2s;`;

            // Logout button click handler
            logoutBtn.addEventListener('click', function() {
                // Clear all localStorage
                localStorage.clear();

                // Clear all cookies
                document.cookie.split(";").forEach(function(c) {
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });

                // Redirect to login
                window.location.href = STATIC_CONFIG.redirects.login;
            });

            // Hover effect for logout button
            logoutBtn.addEventListener('mouseenter', function() {
                this.style.background = COLORS.primaryHover;
            });
            logoutBtn.addEventListener('mouseleave', function() {
                this.style.background = CONFIG.colors.primary;
            });

            // Insert logout button after notification button
            btnNotification.parentNode.insertBefore(logoutBtn, btnNotification.nextSibling);

            console.log('Logout button added after notification button');
        });
    }

    // Add logout button
    console.log('Adding logout button...');
    addLogoutButton();

    // Function to add mobile logo and logout button
    function addMobileLogoAndLogout() {
        // Find #id-mobile-switch element
        waitforElement('#id-mobile-switch', function(mobileSwitch) {
            const parentDiv = mobileSwitch.parentElement;

            if (!parentDiv) {
                console.error('Parent div of #id-mobile-switch not found');
                return;
            }

            // Check if mobile logo already exists
            if (parentDiv.querySelector('.custom-mobile-nav-logo')) {
                return;
            }

            // Remove the mobile switch element
            mobileSwitch.remove();

            // Create container for logo and logout button
            const navContainer = document.createElement('div');
            navContainer.style.cssText = 'display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 1rem;';

            // Create logo link
            const logoLink = document.createElement('a');
            logoLink.href = CONFIG.branding.companyWebsite;
            logoLink.target = '_blank';
            logoLink.className = 'custom-mobile-nav-logo';
            logoLink.style.cssText = 'display: flex; align-items: center; text-decoration: none;';

            const logoImg = document.createElement('img');
            logoImg.src = CONFIG.branding.logoUrl;
            logoImg.alt = 'Company Logo';
            logoImg.style.cssText = 'max-height: 50px; height: auto; width: auto; max-width: 150px;';

            logoLink.appendChild(logoImg);

            // Create logout button
            const logoutBtn = document.createElement('button');
            logoutBtn.textContent = 'Logout';
            logoutBtn.className = 'custom-mobile-logout-btn';
            logoutBtn.style.cssText = `background: ${CONFIG.colors.primary}; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.2s;`;

            // Logout button click handler
            logoutBtn.addEventListener('click', function() {
                // Clear all localStorage
                localStorage.clear();

                // Clear all cookies
                document.cookie.split(";").forEach(function(c) {
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });

                // Redirect to login
                window.location.href = STATIC_CONFIG.redirects.login;
            });

            // Hover effect for logout button
            logoutBtn.addEventListener('mouseenter', function() {
                this.style.background = COLORS.primaryHover;
            });
            logoutBtn.addEventListener('mouseleave', function() {
                this.style.background = CONFIG.colors.primary;
            });

            // Append logo and logout button to container
            navContainer.appendChild(logoLink);
            navContainer.appendChild(logoutBtn);

            // Add the container to parent div
            parentDiv.appendChild(navContainer);

            console.log('Mobile logo and logout button added');
        });
    }

    // Add mobile logo and logout
    console.log('Adding mobile logo and logout...');
    addMobileLogoAndLogout();

    // Start loading data
    console.log('=== STARTING CONTACT DATA LOAD ===');
    loadContactData();

    // Mobile version - append after .flex.flex-col.mt-12.p-4
    function initializeMobileUI() {
        console.log('=== INITIALIZING MOBILE UI ===');
        console.log('Opportunities Data:', opportunitiesData);
        console.log('Current Opportunity ID:', currentOpportunityId);

        waitforElement('.flex.flex-col.mt-12.p-4', function(mobileTarget) {
            console.log('Mobile target element found, creating mobile container...');
            // Create mobile container
            var mobileContainer = document.createElement('div');
            mobileContainer.className = 'custom-mobile-container';
            mobileContainer.id = 'custom-mobile-cards-container';

            // If we have opportunity data, create dynamic dropdown
            if (opportunitiesData && opportunitiesData.length > 0) {
                // Dynamic Order Selector Dropdown for mobile
                var orderSelector = document.createElement('div');
                orderSelector.className = 'custom-order-selector';

                let dropdownHTML = '<select class="custom-order-dropdown" id="mobileOrderDropdown" style="width: 100%;">';
                opportunitiesData.forEach(opp => {
                    const selected = opp.id === currentOpportunityId ? 'selected' : '';
                    dropdownHTML += `<option value="${opp.id}" ${selected}>Order #${opp.contract_number} – ${opp.name}</option>`;
                });
                dropdownHTML += '</select>';
                orderSelector.innerHTML = dropdownHTML;
                mobileContainer.appendChild(orderSelector);

                setTimeout(() => {
                    const dropdown = document.getElementById('mobileOrderDropdown');
                    if (dropdown) {
                        dropdown.addEventListener('change', function(e) {
                            console.log('=== OPPORTUNITY CHANGED VIA MOBILE DROPDOWN ===');
                            console.log('Previous Opportunity ID:', currentOpportunityId);
                            currentOpportunityId = e.target.value;
                            console.log('New Opportunity ID:', currentOpportunityId);
                            const selectedOpp = opportunitiesData.find(opp => opp.id === currentOpportunityId);
                            console.log('Selected Opportunity Data:', selectedOpp);
                            updateCardsWithData();
                        });
                    }
                }, 100);
            }

            // Create cards using the same function
            createCards(mobileContainer);

            // Append after the target element
            mobileTarget.parentNode.insertBefore(mobileContainer, mobileTarget.nextSibling);

            // Initialize progress and gallery for mobile
            const opportunity = getCurrentOpportunity();
            if (opportunity) {
                const stageNumber = getStageNumber(opportunity.stage);
                initializeProgressTracking(stageNumber);
            } else {
                initializeProgressTracking(10);
            }
            initializeGalleryTabs();
            initializeDocumentTabs();

            // Update with current data if available
            if (opportunitiesData && opportunitiesData.length > 0) {
                updateCardsWithData();
            }
        });
    }

    // Call mobile initialization
    console.log('Scheduling mobile UI initialization in 500ms...');
    setTimeout(initializeMobileUI, 500);

    // Auto-click "Shared Files" on mobile view when page loads
    function autoClickSharedFiles() {
        // Check if we're on mobile (screen width <= 768px)
        if (window.innerWidth <= 768) {
            waitforElement('div[data-name="Shared Files"]', function(sharedFilesElement) {
                console.log('Auto-clicking Shared Files on mobile view');
                sharedFilesElement.click();
            });
        }
    }

    // Call auto-click function when page loads
    console.log('Setting up auto-click for Shared Files on mobile...');
    autoClickSharedFiles();

    // Also call on window resize (if user rotates device or resizes window)
    var resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            if (window.innerWidth <= 768) {
                const sharedFilesElement = document.querySelector('div[data-name="Shared Files"]');
                if (sharedFilesElement && !sharedFilesElement.classList.contains('auto-clicked')) {
                    console.log('Auto-clicking Shared Files after resize');
                    sharedFilesElement.classList.add('auto-clicked');
                    sharedFilesElement.click();
                }
            }
        }, 250);
    });

    console.log('=== CLIENT PORTAL SCRIPT INITIALIZATION COMPLETE ===');
    console.log('Script is now waiting for DOM elements and API responses...');






    function waitforElement(selector, callback) {
        console.log('⏳ Waiting for element:', selector);
        var attempts = 0;
        var interval = setInterval(function() {
            attempts++;
            var element = document.querySelector(selector);
            if (element) {
                console.log('✅ Element found:', selector, 'after', attempts * 100, 'ms');
                clearInterval(interval);
                callback(element);
            } else if (attempts > 100) { // 10 seconds timeout
                console.warn('⚠️ Timeout waiting for element:', selector);
                clearInterval(interval);
            }
        }, 100);
    }

    // Progress Tracking Functions
    function initializeProgressTracking(stageNumber) {
        console.log('=== INITIALIZING PROGRESS TRACKING ===');
        console.log('Stage Number:', stageNumber);

        // Update both desktop and mobile progress bars
        updateProgressContainer(stageNumber, 'customProgressSteps', 'customProgressStatus');
    }

    function updateProgressContainer(stageNumber, stepsId, statusId) {
        // Display stages shown to customers (6 stages)
        const displayStages = [
            { id: 'survey', label: 'Survey Scheduled' },
            { id: 'contract_pending', label: 'Contract To Be Signed' },
            { id: 'contract_signed', label: 'Contract Signed' },
            { id: 'items_ordered', label: 'Items Ordered' },
            { id: 'fitting', label: 'Fitting Date Scheduled' },
            { id: 'complete', label: 'Installation Complete' }
        ];

        // Map pipeline stages to display stage index and status message
        /**
         * Pipeline Stage Mapping:
         * 1. Deposit Due                    → (before visible stages)
         * 2. Survey To Be Scheduled         → (before visible stages)
         * 3. Survey Scheduled               → SHOW "Survey Scheduled"
         * 4. Get Contract Ready             → (internal - Survey Scheduled completed)
         * 5. Contract To Be Signed          → SHOW "Contract To Be Signed"
         * 6. Items To Be Ordered            → SHOW "Contract Signed"
         * 7. Items To Be Signed Off         → (internal - Contract Signed completed)
         * 8. Waiting For Delivery           → SHOW "Items Ordered"
         * 9. Fitting Date To Be Scheduled   → (internal - Items Ordered completed)
         * 10. Fitting Date Scheduled        → SHOW "Fitting Date Scheduled"
         * 11. Installation Complete         → SHOW "Installation Complete"
         * 12. Balance To Be Collected       → (internal - Installation Complete completed)
         * 13. Job Complete                  → ALL COMPLETED
         */
        function getDisplayInfo(pipelineStage) {
            const stage = parseInt(pipelineStage);

            switch(stage) {
                case 1: // Deposit Due (before visible stages)
                    return {
                        activeIndex: -1,
                        completedCount: 0,
                        status: 'Awaiting deposit payment to proceed.'
                    };
                case 2: // Survey To Be Scheduled (before visible stages)
                    return {
                        activeIndex: -1,
                        completedCount: 0,
                        status: 'We will contact you to schedule your survey.'
                    };
                case 3: // Survey Scheduled - SHOW
                    return {
                        activeIndex: 0,
                        completedCount: 0,
                        status: 'Your survey has been scheduled.'
                    };
                case 4: // Get Contract Ready (internal)
                    return {
                        activeIndex: 1,
                        completedCount: 1,
                        status: 'We are preparing your contract.'
                    };
                case 5: // Contract To Be Signed - SHOW
                    return {
                        activeIndex: 1,
                        completedCount: 1,
                        status: 'Your contract is ready to be signed.'
                    };
                case 6: // Items To Be Ordered → Portal shows "Contract Signed"
                    return {
                        activeIndex: 2,
                        completedCount: 2,
                        status: 'Your contract has been signed. Items will be ordered shortly.'
                    };
                case 7: // Items To Be Signed Off (internal - Contract Signed shows as completed)
                    return {
                        activeIndex: 3,
                        completedCount: 3,
                        status: 'Items are being signed off for ordering.'
                    };
                case 8: // Waiting For Delivery → Portal shows "Items Ordered"
                    return {
                        activeIndex: 3,
                        completedCount: 3,
                        status: 'Your items have been ordered and are awaiting delivery.'
                    };
                case 9: // Fitting Date To Be Scheduled (internal - Items Ordered shows as completed)
                    return {
                        activeIndex: 4,
                        completedCount: 4,
                        status: 'We will contact you to schedule your fitting date.'
                    };
                case 10: // Fitting Date Scheduled - SHOW AS IS
                    return {
                        activeIndex: 4,
                        completedCount: 4,
                        status: 'Your fitting date has been scheduled.'
                    };
                case 11: // Installation Complete - SHOW AS IS
                    return {
                        activeIndex: 5,
                        completedCount: 5,
                        status: 'Installation is complete!'
                    };
                case 12: // Balance To Be Collected (internal - Installation Complete shows as completed)
                    return {
                        activeIndex: 5,
                        completedCount: 6,
                        status: 'Installation complete. Please settle the remaining balance.'
                    };
                case 13: // Job Complete
                    return {
                        activeIndex: 5,
                        completedCount: 6,
                        status: 'Your order is complete. Thank you for your business!'
                    };
                default:
                    return {
                        activeIndex: 0,
                        completedCount: 0,
                        status: 'Processing your order.'
                    };
            }
        }

        // Use provided stage number or default to 1
        const pipelineStage = stageNumber || 1;

        const displayInfo = getDisplayInfo(pipelineStage);

        // Find all progress containers (desktop and mobile)
        const stepsContainers = document.querySelectorAll('#' + stepsId);
        const statusTexts = document.querySelectorAll('#' + statusId);

        console.log('Steps Containers found:', stepsContainers.length);
        console.log('Status Texts found:', statusTexts.length);

        if (stepsContainers.length === 0 || statusTexts.length === 0) {
            console.error('Progress elements not found!');
            return;
        }

        // Build steps HTML
        let stepsHTML = '';
        displayStages.forEach((stage, index) => {
            let stepClass = 'custom-progress-step';

            const checkIcon = `✓`;

            if (index < displayInfo.completedCount) {
                // Completed step
                stepClass += ' completed';
            } else if (index === displayInfo.activeIndex) {
                // Active step
                stepClass += ' active';
            }

            stepsHTML += `
                <div class="${stepClass}">
                    <span class="custom-step-indicator">${checkIcon}</span>
                    <span class="custom-step-label">${stage.label}</span>
                </div>
            `;
        });

        // Update all progress containers (both desktop and mobile)
        stepsContainers.forEach(container => {
            container.innerHTML = stepsHTML;
        });
        console.log('Progress steps HTML set:', stepsHTML);

        // Update all status texts
        statusTexts.forEach(text => {
            text.textContent = displayInfo.status;
        });
        console.log('Status text set:', displayInfo.status);
        console.log('=== PROGRESS TRACKING COMPLETE ===');
    }

    // Function to check if file is PDF
    function isPDF(url) {
        if (!url) return false;
        const urlLower = url.toLowerCase();
        return urlLower.endsWith('.pdf') || urlLower.includes('.pdf?') || urlLower.includes('pdf');
    }

    // Function to check if file is image
    function isImage(url) {
        if (!url) return false;
        const urlLower = url.toLowerCase();
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
        return imageExtensions.some(ext => urlLower.includes(ext));
    }

    // Function to open image in lightbox
    function openImageLightbox(imageUrl) {
        // Create lightbox overlay
        const lightbox = document.createElement('div');
        lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            cursor: pointer;
        `;

        const img = document.createElement('img');
        img.src = imageUrl;
        img.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            border-radius: 8px;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            z-index: 10001;
        `;

        lightbox.appendChild(img);
        lightbox.appendChild(closeBtn);
        document.body.appendChild(lightbox);

        // Close on click
        const closeLightbox = () => {
            document.body.removeChild(lightbox);
        };
        lightbox.addEventListener('click', closeLightbox);
        closeBtn.addEventListener('click', closeLightbox);
    }

    // Function to render document content based on tab type
    function renderDocumentContent(docType) {
        console.log('=== RENDERING DOCUMENT CONTENT ===');
        console.log('Document Type:', docType);

        const opportunity = getCurrentOpportunity();
        const displayAreas = document.querySelectorAll('#documentsDisplayArea');

        if (displayAreas.length === 0) {
            console.log('No document display areas found');
            return;
        }

        let contentHTML = '';

        if (docType === 'contracts') {
            const contracts = opportunity ? opportunity.contracts : null;
            console.log('Contract Data:', contracts);

            if (contracts && Array.isArray(contracts) && contracts.length > 0) {
                contracts.forEach((contract, index) => {
                    const contractName = contract.name || `Contract ${index + 1}`;
                    const contractStatus = contract.status || 'Unknown';
                    const contractPreviewUrl = contract.previewUrl || contract.url || '#';
                    const contractPdfLink = contract.pdfLink || contractPreviewUrl;

                    // Style contract status with colors
                    let statusColor = '#8a9bb5';
                    let statusBg = '#f0f4f8';

                    if (contractStatus.toLowerCase() === 'completed' || contractStatus.toLowerCase() === 'signed') {
                        statusColor = '#059669';
                        statusBg = '#d1fae5';
                    } else if (contractStatus.toLowerCase() === 'declined' || contractStatus.toLowerCase() === 'rejected') {
                        statusColor = '#dc2626';
                        statusBg = '#fee2e2';
                    } else if (contractStatus.toLowerCase() === 'sent' || contractStatus.toLowerCase() === 'pending') {
                        statusColor = '#d97706';
                        statusBg = '#fef3c7';
                    } else if (contractStatus.toLowerCase() === 'viewed') {
                        statusColor = '#2563eb';
                        statusBg = '#dbeafe';
                    }

                    contentHTML += `
                        <div style="padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 0.5rem; background: white;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 0.25rem;">${contractName}</div>
                                    <div style="display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 500; color: ${statusColor}; background: ${statusBg};">
                                        ${contractStatus}
                                    </div>
                                </div>
                                <a href="${contractPreviewUrl}" target="_blank" style="padding: 0.5rem 1rem; background: ${CONFIG.colors.primary}; color: white; border-radius: 6px; text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: background 0.2s; margin-right: 0.5rem;" onmouseover="this.style.background='${COLORS.primaryHover}'" onmouseout="this.style.background='${CONFIG.colors.primary}'">
                                    View Contract
                                </a>
                                ${contractPdfLink && contractPdfLink !== '#' ? `
                                <a href="${contractPdfLink}" target="_blank" style="padding: 0.5rem 1rem; background: ${CONFIG.colors.secondary}; color: white; border-radius: 6px; text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: background 0.2s;" onmouseover="this.style.background='${COLORS.secondaryHover}'" onmouseout="this.style.background='${CONFIG.colors.secondary}'">
                                    Download PDF
                                </a>
                                ` : ''}
                            </div>
                        </div>
                    `;
                });
            } else {
                contentHTML = `<p style="color: ${CONFIG.colors.neutral}; font-size: 0.875rem; margin-top: 0.5rem;">No contracts available</p>`;
            }
        } else if (docType === 'estimates') {
            const estimates = opportunity ? opportunity.estimates : null;
            console.log('Estimate Data:', estimates);

            if (estimates && Array.isArray(estimates) && estimates.length > 0) {
                estimates.forEach((estimate, index) => {
                    const estimateName = estimate.name || `Estimate ${estimate.number || index + 1}`;
                    const estimateNumber = estimate.number || estimate.id || 'N/A';
                    const estimateUrl = estimate.url || '#';

                    contentHTML += `
                        <div style="padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 0.5rem; background: white;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 0.25rem;">${estimateName}</div>
                                    <div style="font-size: 0.875rem; color: #64748b;">
                                        Estimate #${estimateNumber}
                                    </div>
                                </div>
                                ${estimateUrl && estimateUrl !== '#' ? `
                                <a href="${estimateUrl}" target="_blank" style="padding: 0.5rem 1rem; background: ${CONFIG.colors.primary}; color: white; border-radius: 6px; text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: background 0.2s;" onmouseover="this.style.background='${COLORS.primaryHover}'" onmouseout="this.style.background='${CONFIG.colors.primary}'">
                                    View Estimate
                                </a>
                                ` : ''}
                            </div>
                        </div>
                    `;
                });
            } else {
                contentHTML = `<p style="color: ${CONFIG.colors.neutral}; font-size: 0.875rem; margin-top: 0.5rem;">No estimates available</p>`;
            }
        } else if (docType === 'shared') {
            const sharedFiles = opportunity ? opportunity.shareFiles : null;
            console.log('Shared Files Data:', sharedFiles);

            if (sharedFiles && Array.isArray(sharedFiles) && sharedFiles.length > 0) {
                sharedFiles.forEach((file, index) => {
                    const fileName = file.name || 'Unnamed File';
                    const fileUrl = file.url || '#';

                    // Determine file type and icon
                    let fileIcon = '';
                    const fileExtension = fileName.split('.').pop().toLowerCase();

                    if (['pdf'].includes(fileExtension)) {
                        fileIcon = `
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${CONFIG.colors.secondary}" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <text x="12" y="16" text-anchor="middle" fill="${CONFIG.colors.secondary}" font-size="5" font-weight="bold">PDF</text>
                            </svg>
                        `;
                    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(fileExtension)) {
                        fileIcon = `
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                        `;
                    } else if (['doc', 'docx'].includes(fileExtension)) {
                        fileIcon = `
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                        `;
                    } else {
                        fileIcon = `
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${CONFIG.colors.neutral}" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                        `;
                    }

                    contentHTML += `
                        <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 0.5rem; background: white;">
                            <div style="flex-shrink: 0;">
                                ${fileIcon}
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-weight: 500; color: #1e293b; font-size: 0.875rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${fileName}">
                                    ${fileName}
                                </div>
                            </div>
                            <a href="${fileUrl}" target="_blank" style="flex-shrink: 0; padding: 0.5rem 1rem; background: ${CONFIG.colors.primary}; color: white; border-radius: 6px; text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: background 0.2s;" onmouseover="this.style.background='${COLORS.primaryHover}'" onmouseout="this.style.background='${CONFIG.colors.primary}'">
                                View
                            </a>
                        </div>
                    `;
                });
            } else {
                contentHTML = `<p style="color: ${CONFIG.colors.neutral}; font-size: 0.875rem; margin-top: 0.5rem;">No shared documents available</p>`;
            }
        }

        // Update all display areas
        displayAreas.forEach(area => {
            area.innerHTML = contentHTML;
        });

        console.log('Document content rendered successfully');
    }

    // Function to initialize document tabs
    function initializeDocumentTabs() {
        console.log('=== INITIALIZING DOCUMENT TABS ===');

        // Find all tab buttons with data-doc-type attribute
        const docTabButtons = document.querySelectorAll('[data-doc-type]');
        console.log('Document tab buttons found:', docTabButtons.length);

        docTabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const docType = button.getAttribute('data-doc-type');
                console.log('Document tab clicked:', docType);

                // Update active state for all buttons
                document.querySelectorAll('[data-doc-type]').forEach(btn => {
                    btn.classList.remove('tab-active');
                });
                button.classList.add('tab-active');

                // Render the selected content
                renderDocumentContent(docType);
            });
        });

        // Initialize with contracts as default (will be updated by updateCardsWithData if needed)
        setTimeout(() => renderDocumentContent('contracts'), 100);
    }

    // Gallery Tab Functions
    function initializeGalleryTabs() {
        // Function to update gallery based on current opportunity
        function updateGallery(tabType) {
            currentGalleryType = tabType;
            currentGalleryPage = 0;
            const opportunity = getCurrentOpportunity();

            if (opportunity) {
                const items = tabType === 'before' ? opportunity.BeforeImages : opportunity.AfterImages;
                currentGalleryItems = items || [];
                renderGalleryItems(items, tabType);
            } else {
                // No opportunity data - show "No images available"
                currentGalleryItems = [];
                renderGalleryItems([], tabType);
            }
            updatePhotoNavigation();
        }

        // Tab click handlers
        document.querySelectorAll('.photo-tab-btn').forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                document.querySelectorAll('.photo-tab-btn').forEach(t => t.classList.remove('tab-active'));
                tab.classList.add('tab-active');

                // Get selected tab type and update gallery
                const tabType = tab.getAttribute('data-gallery-type');
                updateGallery(tabType);
            });
        });

        // Carousel arrow handlers
        document.querySelectorAll('#photoPrevious').forEach(btn => {
            btn.addEventListener('click', () => {
                if (currentGalleryPage > 0) {
                    currentGalleryPage--;
                    renderGalleryItems(currentGalleryItems, currentGalleryType);
                    updatePhotoNavigation();
                }
            });
        });

        document.querySelectorAll('#photoNext').forEach(btn => {
            btn.addEventListener('click', () => {
                const maxPage = Math.ceil(currentGalleryItems.length / galleryItemsPerPage) - 1;
                if (currentGalleryPage < maxPage) {
                    currentGalleryPage++;
                    renderGalleryItems(currentGalleryItems, currentGalleryType);
                    updatePhotoNavigation();
                }
            });
        });

        // Initialize with "before" tab
        updateGallery('before');
    }

    function updatePhotoNavigation() {
        const maxPage = Math.ceil(currentGalleryItems.length / galleryItemsPerPage) - 1;

        document.querySelectorAll('#photoPrevious').forEach(btn => {
            if (currentGalleryPage === 0) {
                btn.classList.add('nav-disabled');
            } else {
                btn.classList.remove('nav-disabled');
            }
        });

        document.querySelectorAll('#photoNext').forEach(btn => {
            if (currentGalleryPage >= maxPage || currentGalleryItems.length <= galleryItemsPerPage) {
                btn.classList.add('nav-disabled');
            } else {
                btn.classList.remove('nav-disabled');
            }
        });
    }

})();
// --- IGNORE ---


