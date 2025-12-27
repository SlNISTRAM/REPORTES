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
     * @param {Array} items - Array of budget items {quantity, price}
     * @returns {Object} {total} - All prices in USD
     */
    calculateTotal(items) {
        // Total is the sum of all items in USD
        const total = items.reduce((sum, item) => {
            return sum + this.calculateItemSubtotal(item.quantity, item.price);
        }, 0);

        return {
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
     * Format number as currency
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency code (USD or PEN)
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount, currency = 'USD') {
        const symbol = currency === 'PEN' ? 'S/' : '$';
        return `${symbol} ${this.roundToTwo(amount).toFixed(2)}`;
    },

    /**
     * Get currency symbol
     * @param {string} currency - Currency code (USD or PEN)
     * @returns {string} Currency symbol
     */
    getCurrencySymbol(currency = 'USD') {
        return currency === 'PEN' ? 'S/' : '$';
    },

    /**
     * Parse currency string to number
     * @param {string} currencyStr - Currency string (e.g., "$ 100.00")
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
    
    // Get selected currency
    const currencySelect = document.getElementById('currency');
    const currency = currencySelect?.value || 'USD';

    // Update display elements
    const totalDisplay = document.getElementById('totalDisplay');

    if (totalDisplay) {
        totalDisplay.textContent = Calculator.formatCurrency(totals.total, currency);
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
        
        // Get selected currency
        const currencySelect = document.getElementById('currency');
        const currency = currencySelect?.value || 'USD';
        
        subtotalDisplay.textContent = Calculator.formatCurrency(subtotal, currency);
    }
}
