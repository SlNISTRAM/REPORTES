// ===== Image Handler Module =====
// Handles image upload, preview, and storage for HI98130 equipment reports

const ImageHandler = {
    maxImages: 20,
    maxSizePerImage: 5 * 1024 * 1024, // 5MB per image
    images: {},

    /**
     * Initialize image handler
     */
    init() {
        this.setupImageInputs();
        console.log('✅ Image Handler inicializado');
    },

    /**
     * Setup all image input listeners
     */
    setupImageInputs() {
        const imageInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
        imageInputs.forEach(input => {
            input.addEventListener('change', (e) => this.handleImageUpload(e));
        });
    },

    /**
     * Setup a single image input listener
     * @param {HTMLElement} input - The input element to setup
     */
    setupImageInput(input) {
        if (!input) return;
        input.addEventListener('change', (e) => this.handleImageUpload(e));
    },

    /**
     * Handle image upload
     * @param {Event} event - Change event from file input
     */
    async handleImageUpload(event) {
        const input = event.target;
        const files = Array.from(input.files);
        const imageType = input.dataset.imageType;
        const previewContainer = input.nextElementSibling;

        if (!imageType) {
            console.error('❌ Image type not specified');
            return;
        }

        // Validate files
        for (const file of files) {
            if (!this.validateImage(file)) {
                continue;
            }

            try {
                const imageData = await this.readImageAsBase64(file);
                this.addImage(imageType, imageData, file.name);
                this.createPreview(previewContainer, imageData, file.name, imageType);
            } catch (error) {
                console.error('❌ Error al cargar imagen:', error);
                alert(`Error al cargar ${file.name}`);
            }
        }

        // Clear input to allow re-upload of same file
        input.value = '';
    },

    /**
     * Validate image file
     * @param {File} file - Image file
     * @returns {boolean} True if valid
     */
    validateImage(file) {
        // Check if it's an image
        if (!file.type.startsWith('image/')) {
            alert(`${file.name} no es una imagen válida`);
            return false;
        }

        // Check size
        if (file.size > this.maxSizePerImage) {
            const sizeMB = (file.size / 1024 / 1024).toFixed(2);
            alert(`${file.name} es demasiado grande (${sizeMB}MB). Máximo: 5MB`);
            return false;
        }

        return true;
    },

    /**
     * Read image as base64
     * @param {File} file - Image file
     * @returns {Promise<string>} Base64 string
     */
    readImageAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    },

    /**
     * Add image to storage
     * @param {string} imageType - Type of image
     * @param {string} imageData - Base64 image data
     * @param {string} fileName - Original file name
     */
    addImage(imageType, imageData, fileName) {
        if (!this.images[imageType]) {
            this.images[imageType] = [];
        }

        const imageId = `${imageType}_${Date.now()}`;
        this.images[imageType].push({
            id: imageId,
            data: imageData,
            fileName: fileName,
            timestamp: new Date().toISOString()
        });

        console.log(`✅ Imagen agregada: ${fileName} (${imageType})`);
    },

    /**
     * Create image preview
     * @param {HTMLElement} container - Preview container
     * @param {string} imageData - Base64 image data
     * @param {string} fileName - File name
     * @param {string} imageType - Image type
     */
    createPreview(container, imageData, fileName, imageType) {
        if (!container) return;

        const imageId = `${imageType}_${Date.now()}`;
        const previewHTML = `
            <div class="image-preview" data-image-id="${imageId}">
                <img src="${imageData}" alt="${fileName}">
                <div class="image-preview-info">
                    <span class="image-name">${this.truncateFileName(fileName, 20)}</span>
                    <button type="button" class="btn-remove-image" onclick="ImageHandler.removeImage('${imageId}', '${imageType}')">
                        ✕
                    </button>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', previewHTML);
    },

    /**
     * Remove image
     * @param {string} imageId - Image ID
     * @param {string} imageType - Image type
     */
    removeImage(imageId, imageType) {
        // Remove from storage
        if (this.images[imageType]) {
            this.images[imageType] = this.images[imageType].filter(img => img.id !== imageId);
        }

        // Remove from UI
        const previewElement = document.querySelector(`[data-image-id="${imageId}"]`);
        if (previewElement) {
            previewElement.remove();
        }

        console.log(`✅ Imagen eliminada: ${imageId}`);
    },

    /**
     * Get all images for a specific type
     * @param {string} imageType - Image type
     * @returns {Array} Array of images
     */
    getImages(imageType) {
        return this.images[imageType] || [];
    },

    /**
     * Get all images
     * @returns {Object} All images
     */
    getAllImages() {
        return this.images;
    },

    /**
     * Clear all images
     */
    clearAllImages() {
        this.images = {};
        document.querySelectorAll('.image-preview-container').forEach(container => {
            container.innerHTML = '';
        });
        console.log('✅ Todas las imágenes eliminadas');
    },

    /**
     * Truncate file name
     * @param {string} fileName - File name
     * @param {number} maxLength - Max length
     * @returns {string} Truncated name
     */
    truncateFileName(fileName, maxLength) {
        if (fileName.length <= maxLength) return fileName;
        const ext = fileName.split('.').pop();
        const name = fileName.substring(0, maxLength - ext.length - 4);
        return `${name}...${ext}`;
    },

    /**
     * Load images from saved data
     * @param {Object} savedImages - Saved images object
     */
    loadImages(savedImages) {
        if (!savedImages) return;

        this.images = savedImages;

        // Recreate previews
        Object.keys(savedImages).forEach(imageType => {
            const images = savedImages[imageType];
            const input = document.querySelector(`input[data-image-type="${imageType}"]`);
            if (!input) return;

            const previewContainer = input.nextElementSibling;
            if (!previewContainer) return;

            images.forEach(image => {
                this.createPreview(previewContainer, image.data, image.fileName, imageType);
            });
        });

        console.log('✅ Imágenes cargadas desde borrador');
    },

    /**
     * Get total size of all images
     * @returns {number} Total size in bytes
     */
    getTotalSize() {
        let totalSize = 0;
        Object.values(this.images).forEach(imageArray => {
            imageArray.forEach(image => {
                // Approximate size from base64 (base64 is ~33% larger than binary)
                totalSize += (image.data.length * 0.75);
            });
        });
        return totalSize;
    },

    /**
     * Get total image count
     * @returns {number} Total number of images
     */
    getTotalCount() {
        let count = 0;
        Object.values(this.images).forEach(imageArray => {
            count += imageArray.length;
        });
        return count;
    },

    /**
     * Check if storage limit is reached
     * @returns {boolean} True if limit reached
     */
    isStorageLimitReached() {
        const totalSize = this.getTotalSize();
        const maxStorage = 10 * 1024 * 1024; // 10MB total
        return totalSize >= maxStorage;
    }
};

/**
 * Create image upload section HTML
 * @param {string} imageType - Type of image
 * @param {string} label - Label text
 * @param {boolean} multiple - Allow multiple images
 * @returns {string} HTML string
 */
function createImageUploadSection(imageType, label, multiple = false) {
    return `
        <div class="image-upload-section">
            <label class="image-upload-label">
                📷 ${label}
                ${multiple ? '<span class="multiple-hint">(Puede seleccionar múltiples)</span>' : ''}
            </label>
            <input type="file" 
                   accept="image/*" 
                   data-image-type="${imageType}"
                   ${multiple ? 'multiple' : ''}
                   class="image-upload-input">
            <div class="image-preview-container"></div>
        </div>
    `;
}
