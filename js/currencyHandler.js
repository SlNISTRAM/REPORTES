// Setup currency change handler
function setupCurrencyHandler() {
    const currencySelect = document.getElementById('currency');
    
    if (!currencySelect) return;

    currencySelect.addEventListener('change', (e) => {
        const currency = e.target.value;
        
        // Update total display
        const budgetItems = document.querySelectorAll('.budget-item');
        if (budgetItems.length > 0) {
            updateBudgetDisplay(Array.from(budgetItems));
        }
        
        console.log(`✅ Moneda cambiada a: ${currency}`);
    });
    
    console.log('✅ Currency handler configurado');
}
