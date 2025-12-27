// ===== SUNAT API Module =====
// Handles RUC, DNI, and CE lookup and auto-fill functionality

const SunatAPI = {
    /**
     * Lookup RUC information from SUNAT
     * @param {string} ruc - RUC number (11 digits)
     * @returns {Promise<Object>} Company information
     */
    async lookupRUC(ruc) {
        if (!/^\d{11}$/.test(ruc)) {
            throw new Error('RUC debe tener 11 dígitos');
        }

        try {
            const response = await fetch(`https://api.apis.net.pe/v2/sunat/ruc?numero=${ruc}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.ok) {
                if (response.status === 404) throw new Error('RUC no encontrado');
                if (response.status === 429) throw new Error('Demasiadas consultas. Espere.');
                throw new Error('Error al consultar SUNAT');
            }

            const data = await response.json();
            
            if (!data || !data.razonSocial) {
                throw new Error('RUC no encontrado');
            }
            
            return {
                documentNumber: data.numeroDocumento || ruc,
                clientName: data.razonSocial || '',
                address: data.direccion || '',
                condition: data.condicion || '',
                state: data.estado || '',
                type: 'RUC'
            };
        } catch (error) {
            console.error('Error en consulta RUC:', error);
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Error de conexión. Verifique su internet.');
            }
            throw error;
        }
    },

    /**
     * Lookup DNI information
     * @param {string} dni - DNI number (8 digits)
     * @returns {Promise<Object>} Person information
     */
    async lookupDNI(dni) {
        if (!/^\d{8}$/.test(dni)) {
            throw new Error('DNI debe tener 8 dígitos');
        }

        try {
            const response = await fetch(`https://api.apis.net.pe/v2/reniec/dni?numero=${dni}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.ok) {
                if (response.status === 404) throw new Error('DNI no encontrado');
                if (response.status === 429) throw new Error('Demasiadas consultas. Espere.');
                throw new Error('Error al consultar RENIEC');
            }

            const data = await response.json();
            
            if (!data || !data.nombres) {
                throw new Error('DNI no encontrado');
            }
            
            const fullName = `${data.nombres} ${data.apellidoPaterno} ${data.apellidoMaterno}`.trim();
            
            return {
                documentNumber: dni,
                clientName: fullName,
                address: '',
                type: 'DNI'
            };
        } catch (error) {
            console.error('Error en consulta DNI:', error);
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Error de conexión. Verifique su internet.');
            }
            throw error;
        }
    },

    /**
     * Auto-fill form fields with API data
     */
    autoFillFields(data, documentType) {
        const clientNameInput = document.getElementById('clientName');
        const addressInput = document.getElementById('address');
        const contactNameInput = document.getElementById('contactName');

        if (clientNameInput && data.clientName) {
            clientNameInput.value = data.clientName;
            clientNameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        if (addressInput && data.address) {
            addressInput.value = data.address;
            addressInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // For DNI/CE, also fill contactName with the person's name
        if ((documentType === 'DNI' || documentType === 'CE') && contactNameInput && data.clientName) {
            contactNameInput.value = data.clientName;
            contactNameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        this.showStatus(data, documentType);
    },

    /**
     * Show document status message
     */
    showStatus(data, documentType) {
        const documentNumberInput = document.getElementById('documentNumber');
        if (!documentNumberInput) return;

        const existingStatus = document.getElementById('documentStatus');
        if (existingStatus) existingStatus.remove();

        const statusDiv = document.createElement('div');
        statusDiv.id = 'documentStatus';
        statusDiv.className = 'ruc-status';
        
        if (documentType === 'RUC') {
            const isActive = data.state?.toLowerCase().includes('activo');
            const statusClass = isActive ? 'status-active' : 'status-inactive';
            statusDiv.innerHTML = `
                <span class="${statusClass}">
                    ${isActive ? '✅' : '⚠️'} 
                    ${data.state || 'Estado desconocido'} - ${data.condition || ''}
                </span>
            `;
        } else {
            statusDiv.innerHTML = '<span class="status-active">✅ Datos encontrados</span>';
        }

        documentNumberInput.parentElement.appendChild(statusDiv);
    },

    /**
     * Show loading indicator
     */
    showLoading() {
        const documentNumberInput = document.getElementById('documentNumber');
        if (!documentNumberInput) return;

        const existingStatus = document.getElementById('documentStatus');
        if (existingStatus) existingStatus.remove();

        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'documentStatus';
        loadingDiv.className = 'ruc-status';
        loadingDiv.innerHTML = '<span class="status-loading">🔍 Consultando...</span>';
        
        documentNumberInput.parentElement.appendChild(loadingDiv);
    },

    /**
     * Show error message
     */
    showError(message) {
        const documentNumberInput = document.getElementById('documentNumber');
        if (!documentNumberInput) return;

        const existingStatus = document.getElementById('documentStatus');
        if (existingStatus) existingStatus.remove();

        const errorDiv = document.createElement('div');
        errorDiv.id = 'documentStatus';
        errorDiv.className = 'ruc-status';
        errorDiv.innerHTML = `<span class="status-error">❌ ${message}</span>`;
        
        documentNumberInput.parentElement.appendChild(errorDiv);
    }
};

/**
 * Setup document type change handler
 */
function setupDocumentTypeHandler() {
    const documentTypeSelect = document.getElementById('documentType');
    const documentNumberInput = document.getElementById('documentNumber');
    const documentNumberLabel = document.getElementById('documentNumberLabel');
    const documentHint = document.getElementById('documentHint');
    const clientNameLabel = document.getElementById('clientNameLabel');
    const clientNameInput = document.getElementById('clientName');
    const contactNameGroup = document.getElementById('contactNameGroup');

    if (!documentTypeSelect) return;

    documentTypeSelect.addEventListener('change', (e) => {
        const docType = e.target.value;
        
        // Clear current values
        if (documentNumberInput) documentNumberInput.value = '';
        if (clientNameInput) clientNameInput.value = '';
        
        // Remove status
        const existingStatus = document.getElementById('documentStatus');
        if (existingStatus) existingStatus.remove();

        // Update labels and validation based on document type
        if (docType === 'RUC') {
            documentNumberLabel.textContent = 'RUC *';
            documentNumberInput.placeholder = '12345678901';
            documentNumberInput.maxLength = 11;
            documentHint.textContent = '11 dígitos';
            clientNameLabel.textContent = 'Razón Social *';
            clientNameInput.placeholder = 'Nombre de la empresa';
            contactNameGroup.style.display = 'block';
            document.getElementById('contactName').required = true;
        } else if (docType === 'DNI') {
            documentNumberLabel.textContent = 'DNI *';
            documentNumberInput.placeholder = '12345678';
            documentNumberInput.maxLength = 8;
            documentHint.textContent = '8 dígitos';
            clientNameLabel.textContent = 'Nombre Completo *';
            clientNameInput.placeholder = 'Nombres y apellidos';
            contactNameGroup.style.display = 'none';
            document.getElementById('contactName').required = false;
        } else if (docType === 'CE') {
            documentNumberLabel.textContent = 'Carnet de Extranjería *';
            documentNumberInput.placeholder = '123456789';
            documentNumberInput.maxLength = 12;
            documentHint.textContent = 'Hasta 12 caracteres';
            clientNameLabel.textContent = 'Nombre Completo *';
            clientNameInput.placeholder = 'Nombres y apellidos';
            contactNameGroup.style.display = 'none';
            document.getElementById('contactName').required = false;
        }
    });
}

/**
 * Setup document number auto-lookup functionality
 */
function setupRUCLookup() {
    const documentTypeSelect = document.getElementById('documentType');
    const documentNumberInput = document.getElementById('documentNumber');
    if (!documentNumberInput) return;

    let lookupTimeout;

    documentNumberInput.addEventListener('input', (e) => {
        const docNumber = e.target.value.replace(/\D/g, '');
        e.target.value = docNumber;

        clearTimeout(lookupTimeout);

        const existingStatus = document.getElementById('documentStatus');
        if (existingStatus) existingStatus.remove();

        const docType = documentTypeSelect?.value || 'RUC';
        const requiredLength = docType === 'RUC' ? 11 : docType === 'DNI' ? 8 : 0;

        if (requiredLength > 0 && docNumber.length !== requiredLength) {
            return;
        }

        if (docType === 'CE') return; // No auto-lookup for CE

        lookupTimeout = setTimeout(async () => {
            try {
                SunatAPI.showLoading();
                let data;
                
                if (docType === 'RUC') {
                    data = await SunatAPI.lookupRUC(docNumber);
                } else if (docType === 'DNI') {
                    data = await SunatAPI.lookupDNI(docNumber);
                }
                
                SunatAPI.autoFillFields(data, docType);
                console.log(`✅ Datos obtenidos (${docType}):`, data);
            } catch (error) {
                SunatAPI.showError(error.message);
                console.error(`❌ Error al consultar ${docType}:`, error);
            }
        }, 500);
    });

    console.log('✅ Document lookup configurado');
}
