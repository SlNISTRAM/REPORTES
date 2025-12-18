// ===== Calculator Module =====
// Handles all budget calculations

const Calculator = {
    /**
     * Calculate subtotal for a single budget item
     * @param {number} quantity - Item quantity
     * @param {number} price - Unit price
     * @returns {number} Subtotal
     */
    calculateItemSubtotal(quantity, price) {
        const qty = parseFloat(quantity) || 0;
        const prc = parseFloat(price) || 0;
        return qty * prc;
    },

    /**
     * Calculate total budget from all items
     * IMPORTANT: Prices already include IGV (18%)
     * @param {Array} items - Array of budget items {quantity, price}
     * @returns {Object} {subtotal, igv, total}
     */
    calculateTotal(items) {
        // Total is the sum of all items (prices already include IGV)
        const total = items.reduce((sum, item) => {
            return sum + this.calculateItemSubtotal(item.quantity, item.price);
        }, 0);

        // Calculate implicit IGV and subtotal
        // If total includes 18% IGV: total = subtotal * 1.18
        // Therefore: subtotal = total / 1.18
        const subtotal = total / 1.18;
        const igv = total - subtotal;

        return {
            subtotal: this.roundToTwo(subtotal),
            igv: this.roundToTwo(igv),
            total: this.roundToTwo(total)
        };
    },

    /**
     * Round number to 2 decimal places
     * @param {number} num - Number to round
     * @returns {number} Rounded number
     */
    roundToTwo(num) {
        return Math.round((num + Number.EPSILON) * 100) / 100;
    },

    /**
     * Format number as currency (Peruvian Soles)
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount) {
        return `S/ ${this.roundToTwo(amount).toFixed(2)}`;
    },

    /**
     * Parse currency string to number
     * @param {string} currencyStr - Currency string (e.g., "S/ 100.00")
     * @returns {number} Parsed number
     */
    parseCurrency(currencyStr) {
        if (typeof currencyStr === 'number') return currencyStr;
        const cleaned = currencyStr.replace(/[^\d.-]/g, '');
        return parseFloat(cleaned) || 0;
    },

    /**
     * Validate numeric input
     * @param {string|number} value - Value to validate
     * @returns {boolean} True if valid number
     */
    isValidNumber(value) {
        const num = parseFloat(value);
        return !isNaN(num) && isFinite(num) && num >= 0;
    },

    /**
     * Calculate percentage
     * @param {number} value - Value
     * @param {number} percentage - Percentage (e.g., 18 for 18%)
     * @returns {number} Calculated percentage
     */
    calculatePercentage(value, percentage) {
        return this.roundToTwo(value * (percentage / 100));
    }
};

/**
 * Update budget display in the UI
 * @param {Array} budgetItems - Array of budget item elements
 */
function updateBudgetDisplay(budgetItems) {
    const items = budgetItems.map(item => ({
        quantity: item.querySelector('[name$="[quantity]"]')?.value || 0,
        price: item.querySelector('[name$="[price]"]')?.value || 0
    }));

    const totals = Calculator.calculateTotal(items);

    // Update display elements
    const subtotalDisplay = document.getElementById('subtotalDisplay');
    const igvDisplay = document.getElementById('igvDisplay');
    const totalDisplay = document.getElementById('totalDisplay');

    if (subtotalDisplay) {
        subtotalDisplay.textContent = Calculator.formatCurrency(totals.subtotal);
    }
    if (igvDisplay) {
        igvDisplay.textContent = Calculator.formatCurrency(totals.igv);
    }
    if (totalDisplay) {
        totalDisplay.textContent = Calculator.formatCurrency(totals.total);
    }

    return totals;
}

/**
 * Update individual item subtotal
 * @param {HTMLElement} itemElement - Budget item element
 */
function updateItemSubtotal(itemElement) {
    const quantityInput = itemElement.querySelector('[name$="[quantity]"]');
    const priceInput = itemElement.querySelector('[name$="[price]"]');
    const subtotalDisplay = itemElement.querySelector('.budget-item-subtotal');

    if (quantityInput && priceInput && subtotalDisplay) {
        const quantity = parseFloat(quantityInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const subtotal = Calculator.calculateItemSubtotal(quantity, price);
        
        subtotalDisplay.textContent = Calculator.formatCurrency(subtotal);
    }
}
