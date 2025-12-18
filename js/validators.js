// ===== Validators Module =====
// Handles validation of pH and EC readings for HI98130

const Validators = {
    /**
     * Validate pH reading against expected value with ±0.05 margin
     * @param {number} reading - Actual pH reading
     * @param {number} expected - Expected pH value (7.01 or 4.01)
     * @returns {Object} Validation result
     */
    validatePH(reading, expected) {
        const margin = 0.05;
        const min = expected - margin;
        const max = expected + margin;
        const isValid = reading >= min && reading <= max;

        return {
            isValid,
            reading: parseFloat(reading).toFixed(2),
            expected: expected.toFixed(2),
            margin: `±${margin.toFixed(2)}`,
            range: `${min.toFixed(2)} - ${max.toFixed(2)}`,
            status: isValid ? 'Conforme' : 'No conforme',
            statusIcon: isValid ? '✅' : '❌',
            deviation: Math.abs(reading - expected).toFixed(2)
        };
    },

    /**
     * Validate EC reading against expected value with ±2% margin
     * @param {number} reading - Actual EC reading in mS/cm
     * @param {number} expected - Expected EC value (12.88 mS/cm)
     * @returns {Object} Validation result
     */
    validateEC(reading, expected) {
        const marginPercent = 0.02; // 2%
        const min = expected * (1 - marginPercent);
        const max = expected * (1 + marginPercent);
        const isValid = reading >= min && reading <= max;

        return {
            isValid,
            reading: parseFloat(reading).toFixed(2),
            expected: expected.toFixed(2),
            margin: '±2%',
            range: `${min.toFixed(2)} - ${max.toFixed(2)}`,
            status: isValid ? 'Conforme' : 'No conforme',
            statusIcon: isValid ? '✅' : '❌',
            deviation: Math.abs(reading - expected).toFixed(2),
            deviationPercent: (Math.abs(reading - expected) / expected * 100).toFixed(2) + '%'
        };
    },

    /**
     * Standard pH values for HI98130 calibration
     */
    STANDARD_PH_7: 7.01,
    STANDARD_PH_4: 4.01,
    STANDARD_EC: 12.88,

    /**
     * Get validation badge HTML
     * @param {boolean} isValid - Whether reading is valid
     * @returns {string} HTML for badge
     */
    getValidationBadge(isValid) {
        if (isValid) {
            return '<span class="validation-badge valid">✅ Conforme</span>';
        } else {
            return '<span class="validation-badge invalid">❌ No conforme</span>';
        }
    },

    /**
     * Update UI element with validation result
     * @param {HTMLElement} element - Element to update
     * @param {Object} validation - Validation result
     */
    updateValidationUI(element, validation) {
        if (!element) return;

        element.innerHTML = `
            <div class="validation-result ${validation.isValid ? 'valid' : 'invalid'}">
                <span class="validation-icon">${validation.statusIcon}</span>
                <span class="validation-status">${validation.status}</span>
                <span class="validation-range">Rango: ${validation.range}</span>
            </div>
        `;

        // Add class to parent for styling
        const parent = element.closest('.input-group');
        if (parent) {
            parent.classList.remove('valid', 'invalid');
            parent.classList.add(validation.isValid ? 'valid' : 'invalid');
        }
    },

    /**
     * Validate all pH readings
     * @param {Object} readings - Object with pH readings
     * @returns {Object} All validation results
     */
    validateAllPH(readings) {
        return {
            ph701Initial: this.validatePH(readings.ph701Initial, this.STANDARD_PH_7),
            ph401Initial: this.validatePH(readings.ph401Initial, this.STANDARD_PH_4),
            ph701Calibration: readings.ph701Calibration ? 
                this.validatePH(readings.ph701Calibration, this.STANDARD_PH_7) : null,
            ph401Calibration: readings.ph401Calibration ? 
                this.validatePH(readings.ph401Calibration, this.STANDARD_PH_4) : null,
            ph701Patron: readings.ph701Patron ? 
                this.validatePH(readings.ph701Patron, this.STANDARD_PH_7) : null,
            ph401Patron: readings.ph401Patron ? 
                this.validatePH(readings.ph401Patron, this.STANDARD_PH_4) : null
        };
    },

    /**
     * Validate all EC readings
     * @param {Object} readings - Object with EC readings
     * @returns {Object} All validation results
     */
    validateAllEC(readings) {
        return {
            ecInitial: this.validateEC(readings.ecInitial, this.STANDARD_EC),
            ecCalibration: readings.ecCalibration ? 
                this.validateEC(readings.ecCalibration, this.STANDARD_EC) : null,
            ecPostConditioning: readings.ecPostConditioning ? 
                this.validateEC(readings.ecPostConditioning, this.STANDARD_EC) : null
        };
    },

    /**
     * Determine overall equipment status
     * @param {Object} allValidations - All validation results
     * @returns {Object} Overall status
     */
    determineOverallStatus(allValidations) {
        const phValid = allValidations.ph701Calibration?.isValid && 
                       allValidations.ph401Calibration?.isValid;
        const ecValid = allValidations.ecCalibration?.isValid;

        let status = 'Conforme';
        let issues = [];

        if (!phValid) {
            status = 'No conforme';
            issues.push('pH fuera de especificación');
        }

        if (!ecValid) {
            status = 'No conforme';
            issues.push('EC fuera de especificación');
        }

        return {
            status,
            isConforme: status === 'Conforme',
            issues,
            phStatus: phValid ? 'Conforme' : 'No conforme',
            ecStatus: ecValid ? 'Conforme' : 'No conforme'
        };
    }
};

/**
 * Setup real-time validation for pH input
 * @param {HTMLInputElement} input - pH input element
 * @param {number} expectedValue - Expected pH value
 * @param {HTMLElement} resultElement - Element to show result
 */
function setupPHValidation(input, expectedValue, resultElement) {
    if (!input) return;

    input.addEventListener('input', () => {
        const value = parseFloat(input.value);
        if (!isNaN(value) && value > 0) {
            const validation = Validators.validatePH(value, expectedValue);
            if (resultElement) {
                Validators.updateValidationUI(resultElement, validation);
            }
        }
    });
}

/**
 * Setup real-time validation for EC input
 * @param {HTMLInputElement} input - EC input element
 * @param {number} expectedValue - Expected EC value
 * @param {HTMLElement} resultElement - Element to show result
 */
function setupECValidation(input, expectedValue, resultElement) {
    if (!input) return;

    input.addEventListener('input', () => {
        const value = parseFloat(input.value);
        if (!isNaN(value) && value > 0) {
            const validation = Validators.validateEC(value, expectedValue);
            if (resultElement) {
                Validators.updateValidationUI(resultElement, validation);
            }
        }
    });
}
