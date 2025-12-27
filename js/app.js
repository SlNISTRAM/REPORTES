// ===== Main Application Module =====
// Initializes and orchestrates all modules

const App = {
    /**
     * Initialize the application
     */
    init() {
        console.log('🚀 Iniciando aplicación TECFRESH - HI98130...');

        // Initialize equipment manager
        EquipmentManager.init();

        // Initialize form handler
        FormHandler.init();

        // Initialize image handler
        ImageHandler.init();

        // Setup RUC auto-lookup
        setupRUCLookup();
        
        // Setup document type handler
        setupDocumentTypeHandler();
        
        // Setup currency handler
        setupCurrencyHandler();

        // Setup button event listeners
        this.setupEventListeners();

        // Check for existing draft
        this.checkForDraft();

        // Enable auto-save
        enableAutoSave(() => FormHandler.getFormData(), 30000);

        console.log('✅ Aplicación iniciada correctamente');
    },

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Save draft button
        const saveDraftBtn = document.getElementById('saveDraftBtn');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => this.handleSaveDraft());
        }

        // Load draft button
        const loadDraftBtn = document.getElementById('loadDraftBtn');
        if (loadDraftBtn) {
            loadDraftBtn.addEventListener('click', () => this.handleLoadDraft());
        }

        // Clear form button
        const clearFormBtn = document.getElementById('clearFormBtn');
        if (clearFormBtn) {
            clearFormBtn.addEventListener('click', () => FormHandler.clearForm());
        }

        // Preview button
        const previewBtn = document.getElementById('previewBtn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => showReportPreview());
        }

        // Close preview button
        const closePreviewBtn = document.getElementById('closePreviewBtn');
        if (closePreviewBtn) {
            closePreviewBtn.addEventListener('click', () => hideReportPreview());
        }

        // Export PDF button
        const exportPdfBtn = document.getElementById('exportPdfBtn');
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => handlePDFExport());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S to save draft
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.handleSaveDraft();
            }

            // Ctrl/Cmd + P to preview
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                showReportPreview();
            }
        });

        console.log('✅ Event listeners configurados');
    },

    /**
     * Check for existing draft on load
     */
    checkForDraft() {
        if (Storage.hasDraft()) {
            const timestamp = Storage.getDraftTimestamp();
            const timeStr = timestamp ? timestamp.toLocaleString('es-PE') : 'desconocida';
            
            const loadDraft = confirm(
                `Se encontró un borrador guardado el ${timeStr}.\n\n¿Desea cargarlo?`
            );

            if (loadDraft) {
                this.handleLoadDraft();
            }
        }
    },

    /**
     * Handle save draft action
     */
    handleSaveDraft() {
        const formData = FormHandler.getFormData();
        
        // Add images to form data
        formData.images = ImageHandler.getAllImages();
        
        if (Object.keys(formData).length === 0) {
            alert('⚠️ No hay datos para guardar');
            return;
        }

        const success = Storage.saveDraft(formData);
        
        if (success) {
            this.showNotification('💾 Borrador guardado exitosamente', 'success');
        } else {
            this.showNotification('❌ Error al guardar borrador', 'error');
        }
    },

    /**
     * Handle load draft action
     */
    handleLoadDraft() {
        const draftData = Storage.loadDraft();
        
        if (!draftData) {
            alert('⚠️ No se encontró ningún borrador guardado');
            return;
        }

        FormHandler.loadFormData(draftData);
        
        // Load images if present
        if (draftData.images) {
            ImageHandler.loadImages(draftData.images);
        }
        
        this.showNotification('📂 Borrador cargado exitosamente', 'success');
    },

    /**
     * Show notification to user
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info)
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            font-weight: 500;
        `;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Prevent accidental page unload if form has data
window.addEventListener('beforeunload', (e) => {
    const formData = FormHandler.getFormData();
    if (Object.keys(formData).length > 0 && !Storage.hasDraft()) {
        e.preventDefault();
        e.returnValue = '';
    }
});

console.log('📋 TECFRESH - Informe Técnico HI98130 v2.0');
