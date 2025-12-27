// ===== Form Handler Module =====
// Handles form interactions, validation, and data collection

const FormHandler = {
    form: null,
    budgetItemCounter: 0,

    /**
     * Initialize form handler
     */
    init() {
        this.form = document.getElementById('reportForm');
        this.setupEventListeners();
        this.setupValidationListeners();
        this.setupConditionalSections();
        this.addInitialBudgetItem();
        this.setDefaultDate();
    },

    /**
     * Set default date to today
     */
    setDefaultDate() {
        const dateInput = document.getElementById('reportDate');
        if (dateInput && !dateInput.value) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    },

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Add budget item button
        const addBudgetBtn = document.getElementById('addBudgetItemBtn');
        if (addBudgetBtn) {
            addBudgetBtn.addEventListener('click', () => this.addBudgetItem());
        }

        // RUC validation
        const rucInput = document.getElementById('ruc');
        if (rucInput) {
            rucInput.addEventListener('input', (e) => this.validateRUC(e.target));
        }

        // Email validation
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', (e) => this.validateEmail(e.target));
        }

        // Real-time validation for required fields
        const requiredInputs = this.form.querySelectorAll('[required]');
        requiredInputs.forEach(input => {
            input.addEventListener('blur', (e) => this.validateField(e.target));
        });
    },

    /**
     * Add a new budget item
     */
    addBudgetItem() {
        const container = document.getElementById('budgetItems');
        this.budgetItemCounter++;
        // Use current item count for sequential numbering
        const currentItems = document.querySelectorAll('.budget-item').length;
        const itemNumber = currentItems + 1;
        const itemId = this.budgetItemCounter;

        const itemHTML = `
            <div class="budget-item" data-item-id="${itemId}" data-item-number="${itemNumber}">
                <div class="budget-item-header">
                    <span class="budget-item-title">Ítem ${itemNumber}</span>
                    <button type="button" class="btn-remove" onclick="FormHandler.removeBudgetItem(${itemId})">
                        🗑️ Eliminar
                    </button>
                </div>
                <div class="budget-item-grid">
                    <div class="input-group">
                        <label for="item${itemNumber}_description">Descripción *</label>
                        <input type="text" 
                               id="item${itemNumber}_description" 
                               name="budgetItems[${itemNumber}][description]" 
                               placeholder="Servicio o repuesto"
                               required>
                    </div>
                    <div class="input-group">
                        <label for="item${itemNumber}_quantity">Cantidad *</label>
                        <input type="number" 
                               id="item${itemNumber}_quantity" 
                               name="budgetItems[${itemNumber}][quantity]" 
                               placeholder="1"
                               min="0"
                               step="1"
                               value="1"
                               required>
                    </div>
                    <div class="input-group">
                        <label for="item${itemNumber}_price">Precio Unit. *</label>
                        <input type="number" 
                               id="item${itemNumber}_price" 
                               name="budgetItems[${itemNumber}][price]" 
                               placeholder="0.00"
                               min="0"
                               step="0.01"
                               value="0"
                               required>
                    </div>
                    <div class="input-group">
                        <label>Subtotal</label>
                        <div class="budget-item-subtotal">S/ 0.00</div>
                    </div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', itemHTML);

        // Add event listeners for calculation
        const newItem = container.querySelector(`[data-item-id="${itemId}"]`);
        const quantityInput = newItem.querySelector('[name$="[quantity]"]');
        const priceInput = newItem.querySelector('[name$="[price]"]');

        [quantityInput, priceInput].forEach(input => {
            input.addEventListener('input', () => {
                updateItemSubtotal(newItem);
                this.updateTotalBudget();
            });
        });

        console.log(`✅ Ítem ${itemNumber} agregado`);
    },

    /**
     * Add initial budget item
     */
    addInitialBudgetItem() {
        this.addBudgetItem();
    },

    /**
     * Remove a budget item
     * @param {number} itemId - Item ID to remove
     */
    removeBudgetItem(itemId) {
        const item = document.querySelector(`[data-item-id="${itemId}"]`);
        if (item) {
            item.remove();
            this.renumberBudgetItems();
            this.updateTotalBudget();
            console.log(`✅ Ítem ${itemId} eliminado`);
        }
    },

    /**
     * Renumber all budget items sequentially
     */
    renumberBudgetItems() {
        const items = document.querySelectorAll('.budget-item');
        items.forEach((item, index) => {
            const newItemNumber = index + 1;
            item.dataset.itemNumber = newItemNumber;
            
            // Update the displayed item number
            const title = item.querySelector('.budget-item-title');
            if (title) {
                title.textContent = `Ítem ${newItemNumber}`;
            }
        });
        console.log('✅ Budget items renumbered');
    },

    /**
     * Update total budget display
     */
    updateTotalBudget() {
        const budgetItems = document.querySelectorAll('.budget-item');
        updateBudgetDisplay(Array.from(budgetItems));
    },

    /**
     * Validate RUC (11 digits)
     * @param {HTMLInputElement} input - RUC input element
     */
    validateRUC(input) {
        const ruc = input.value.replace(/\D/g, '');
        input.value = ruc;

        if (ruc.length > 0 && ruc.length !== 11) {
            input.setCustomValidity('El RUC debe tener exactamente 11 dígitos');
        } else {
            input.setCustomValidity('');
        }
    },

    /**
     * Validate email
     * @param {HTMLInputElement} input - Email input element
     */
    validateEmail(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (input.value && !emailRegex.test(input.value)) {
            input.setCustomValidity('Por favor ingrese un email válido');
        } else {
            input.setCustomValidity('');
        }
    },

    /**
     * Validate a single field
     * @param {HTMLInputElement} field - Field to validate
     */
    validateField(field) {
        if (field.validity.valid) {
            field.classList.remove('invalid');
            field.classList.add('valid');
        } else {
            field.classList.remove('valid');
            field.classList.add('invalid');
        }
    },

    /**
     * Validate entire form
     * @returns {boolean} True if form is valid
     */
    validateForm() {
        if (!this.form.checkValidity()) {
            this.form.reportValidity();
            return false;
        }
        return true;
    },

    /**
     * Get all form data as object
     * @returns {Object} Form data
     */
    getFormData() {
        const formData = new FormData(this.form);
        const data = {};

        // Basic fields
        for (let [key, value] of formData.entries()) {
            if (!key.includes('budgetItems')) {
                data[key] = value;
            }
        }

        // Budget items
        data.budgetItems = this.getBudgetItems();

        // Calculate totals
        const totals = Calculator.calculateTotal(data.budgetItems);
        data.total = totals.total;

        return data;
    },

    /**
     * Get budget items data
     * @returns {Array} Budget items
     */
    getBudgetItems() {
        const items = [];
        const budgetItemElements = document.querySelectorAll('.budget-item');

        budgetItemElements.forEach(item => {
            const description = item.querySelector('[name$="[description]"]')?.value || '';
            const quantity = parseFloat(item.querySelector('[name$="[quantity]"]')?.value) || 0;
            const price = parseFloat(item.querySelector('[name$="[price]"]')?.value) || 0;

            if (description && quantity > 0) {
                items.push({
                    description,
                    quantity,
                    price,
                    subtotal: Calculator.calculateItemSubtotal(quantity, price)
                });
            }
        });

        return items;
    },

    /**
     * Load data into form
     * @param {Object} data - Data to load
     */
    loadFormData(data) {
        if (!data) return;

        // Load basic fields
        Object.keys(data).forEach(key => {
            if (key !== 'budgetItems') {
                const field = this.form.elements[key];
                if (field) {
                    if (field.type === 'checkbox') {
                        field.checked = data[key];
                    } else {
                        field.value = data[key];
                    }
                }
            }
        });

        // Load budget items
        if (data.budgetItems && data.budgetItems.length > 0) {
            // Clear existing items
            document.getElementById('budgetItems').innerHTML = '';
            this.budgetItemCounter = 0;

            // Add saved items
            data.budgetItems.forEach(item => {
                this.addBudgetItem();
                const itemElement = document.querySelector(`[data-item-id="${this.budgetItemCounter}"]`);
                if (itemElement) {
                    itemElement.querySelector('[name$="[description]"]').value = item.description;
                    itemElement.querySelector('[name$="[quantity]"]').value = item.quantity;
                    itemElement.querySelector('[name$="[price]"]').value = item.price;
                    updateItemSubtotal(itemElement);
                }
            });

            this.updateTotalBudget();
        }

        console.log('✅ Datos cargados en el formulario');
    },

    /**
     * Clear form
     */
    clearForm() {
        if (confirm('¿Está seguro de que desea limpiar el formulario?')) {
            this.form.reset();
            document.getElementById('budgetItems').innerHTML = '';
            this.budgetItemCounter = 0;
            this.addInitialBudgetItem();
            this.setDefaultDate();
            this.updateTotalBudget();
            console.log('✅ Formulario limpiado');
        }
    },

    /**
     * Setup real-time validation listeners for pH and EC readings
     */
    setupValidationListeners() {
        // pH 7.01 Initial
        setupPHValidation(
            document.getElementById('ph701Initial'),
            Validators.STANDARD_PH_7,
            document.getElementById('ph701InitialValidation')
        );

        // pH 4.01 Initial
        setupPHValidation(
            document.getElementById('ph401Initial'),
            Validators.STANDARD_PH_4,
            document.getElementById('ph401InitialValidation')
        );

        // EC Initial
        setupECValidation(
            document.getElementById('ecInitial'),
            Validators.STANDARD_EC,
            document.getElementById('ecInitialValidation')
        );

        // pH 7.01 Calibration
        setupPHValidation(
            document.getElementById('ph701Calibration'),
            Validators.STANDARD_PH_7,
            document.getElementById('ph701CalibrationValidation')
        );

        // pH 4.01 Calibration
        setupPHValidation(
            document.getElementById('ph401Calibration'),
            Validators.STANDARD_PH_4,
            document.getElementById('ph401CalibrationValidation')
        );

        // EC Calibration
        setupECValidation(
            document.getElementById('ecCalibration'),
            Validators.STANDARD_EC,
            document.getElementById('ecCalibrationValidation')
        );

        // EC Post Conditioning
        setupECValidation(
            document.getElementById('ecPostConditioning'),
            Validators.STANDARD_EC,
            document.getElementById('ecPostConditioningValidation')
        );

        // pH Patron 7.01
        setupPHValidation(
            document.getElementById('ph701Patron'),
            Validators.STANDARD_PH_7,
            document.getElementById('ph701PatronValidation')
        );

        // pH Patron 4.01
        setupPHValidation(
            document.getElementById('ph401Patron'),
            Validators.STANDARD_PH_4,
            document.getElementById('ph401PatronValidation')
        );

        console.log('✅ Validadores en tiempo real configurados');
    },

    /**
     * Setup conditional sections (troubleshooting)
     */
    setupConditionalSections() {
        // Show EC troubleshooting if EC calibration is out of range
        const ecCalibrationInput = document.getElementById('ecCalibration');
        if (ecCalibrationInput) {
            ecCalibrationInput.addEventListener('input', () => {
                const value = parseFloat(ecCalibrationInput.value);
                if (!isNaN(value)) {
                    const validation = Validators.validateEC(value, Validators.STANDARD_EC);
                    const troubleshootingSection = document.getElementById('ecTroubleshootingSection');
                    if (troubleshootingSection) {
                        troubleshootingSection.style.display = validation.isValid ? 'none' : 'block';
                    }
                }
            });
        }

        // Show pH troubleshooting if pH calibration is out of range
        const ph701CalInput = document.getElementById('ph701Calibration');
        const ph401CalInput = document.getElementById('ph401Calibration');
        
        const checkPHTroubleshooting = () => {
            const ph701 = parseFloat(ph701CalInput.value);
            const ph401 = parseFloat(ph401CalInput.value);
            
            if (!isNaN(ph701) && !isNaN(ph401)) {
                const val701 = Validators.validatePH(ph701, Validators.STANDARD_PH_7);
                const val401 = Validators.validatePH(ph401, Validators.STANDARD_PH_4);
                
                const troubleshootingSection = document.getElementById('phTroubleshootingSection');
                if (troubleshootingSection) {
                    const showSection = !val701.isValid || !val401.isValid;
                    troubleshootingSection.style.display = showSection ? 'block' : 'none';
                }
            }
        };

        if (ph701CalInput) ph701CalInput.addEventListener('input', checkPHTroubleshooting);
        if (ph401CalInput) ph401CalInput.addEventListener('input', checkPHTroubleshooting);

        console.log('✅ Secciones condicionales configuradas');
    }
};
