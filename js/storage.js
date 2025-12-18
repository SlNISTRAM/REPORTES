// ===== Storage Module =====
// Handles localStorage operations for saving and loading drafts

const Storage = {
  DRAFT_KEY: "tecfresh_report_draft",
  HISTORY_KEY: "tecfresh_report_history",

  /**
   * Save form data as draft
   * @param {Object} formData - Form data to save
   */
  saveDraft(formData) {
    try {
      const draft = {
        data: formData,
        timestamp: new Date().toISOString(),
        version: "1.0",
      };
      localStorage.setItem(this.DRAFT_KEY, JSON.stringify(draft));
      console.log("✅ Borrador guardado exitosamente");
      return true;
    } catch (error) {
      console.error("❌ Error al guardar borrador:", error);
      return false;
    }
  },

  /**
   * Load draft from localStorage
   * @returns {Object|null} Draft data or null if not found
   */
  loadDraft() {
    try {
      const draftStr = localStorage.getItem(this.DRAFT_KEY);
      if (!draftStr) return null;

      const draft = JSON.parse(draftStr);
      console.log(
        "✅ Borrador cargado:",
        new Date(draft.timestamp).toLocaleString()
      );
      return draft.data;
    } catch (error) {
      console.error("❌ Error al cargar borrador:", error);
      return null;
    }
  },

  /**
   * Clear draft from localStorage
   */
  clearDraft() {
    try {
      localStorage.removeItem(this.DRAFT_KEY);
      console.log("✅ Borrador eliminado");
      return true;
    } catch (error) {
      console.error("❌ Error al eliminar borrador:", error);
      return false;
    }
  },

  /**
   * Check if draft exists
   * @returns {boolean}
   */
  hasDraft() {
    return localStorage.getItem(this.DRAFT_KEY) !== null;
  },

  /**
   * Get draft timestamp
   * @returns {Date|null}
   */
  getDraftTimestamp() {
    try {
      const draftStr = localStorage.getItem(this.DRAFT_KEY);
      if (!draftStr) return null;
      const draft = JSON.parse(draftStr);
      return new Date(draft.timestamp);
    } catch (error) {
      return null;
    }
  },

  /**
   * Save report to history
   * @param {Object} reportData - Complete report data
   */
  saveToHistory(reportData) {
    try {
      let history = this.getHistory();

      const reportEntry = {
        ...reportData,
        savedAt: new Date().toISOString(),
        id: `REPORT_${Date.now()}`,
      };

      history.unshift(reportEntry);

      // Keep only last 50 reports
      if (history.length > 50) {
        history = history.slice(0, 50);
      }

      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
      console.log("✅ Informe guardado en historial");
      return true;
    } catch (error) {
      console.error("❌ Error al guardar en historial:", error);
      return false;
    }
  },

  /**
   * Get report history
   * @returns {Array}
   */
  getHistory() {
    try {
      const historyStr = localStorage.getItem(this.HISTORY_KEY);
      return historyStr ? JSON.parse(historyStr) : [];
    } catch (error) {
      console.error("❌ Error al cargar historial:", error);
      return [];
    }
  },

  /**
   * Clear all history
   */
  clearHistory() {
    try {
      localStorage.removeItem(this.HISTORY_KEY);
      console.log("✅ Historial eliminado");
      return true;
    } catch (error) {
      console.error("❌ Error al eliminar historial:", error);
      return false;
    }
  },
};

// Auto-save functionality
let autoSaveTimer = null;

/**
 * Enable auto-save with specified interval
 * @param {Function} getFormDataFn - Function that returns current form data
 * @param {number} interval - Auto-save interval in milliseconds (default: 30000 = 30 seconds)
 */
function enableAutoSave(getFormDataFn, interval = 30000) {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
  }

  autoSaveTimer = setInterval(() => {
    const formData = getFormDataFn();
    if (formData && Object.keys(formData).length > 0) {
      Storage.saveDraft(formData);
    }
  }, interval);

  console.log(`✅ Auto-guardado activado (cada ${interval / 1000} segundos)`);
}

/**
 * Disable auto-save
 */
function disableAutoSave() {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
    console.log("⏹️ Auto-guardado desactivado");
  }
}
