/**
 * Equipment Manager Module
 * Handles dynamic creation and management of multiple equipment entries
 */

const EquipmentManager = {
    equipmentCount: 0,
    equipments: [],

    /**
     * Initialize equipment manager
     */
    init() {
        const addEquipmentBtn = document.getElementById('addEquipmentBtn');
        if (addEquipmentBtn) {
            addEquipmentBtn.addEventListener('click', () => this.addEquipment());
        }

        // Add first equipment by default
        this.addEquipment();
        
        console.log('✅ Equipment Manager initialized');
    },

    /**
     * Add a new equipment entry
     * @param {Object} data - Optional pre-filled data for the equipment
     */
    addEquipment(data = null) {
        this.equipmentCount++;
        const equipmentId = `equipment_${this.equipmentCount}`;
        // Use array length + 1 for item number to ensure sequential numbering
        const itemNumber = this.equipments.length + 1;

        const container = document.getElementById('equipmentsContainer');
        if (!container) {
            console.error('Equipment container not found');
            return;
        }

        const equipmentHtml = this.generateEquipmentHTML(equipmentId, itemNumber, data);
        container.insertAdjacentHTML('beforeend', equipmentHtml);

        // Initialize validators for this equipment
        this.initializeEquipmentValidators(equipmentId);

        // Initialize image handlers for this equipment
        this.initializeEquipmentImageHandlers(equipmentId);

        // Add to equipments array
        this.equipments.push({
            id: equipmentId,
            itemNumber: itemNumber
        });

        // Setup collapse functionality
        this.setupCollapse(equipmentId);

        // Setup remove button
        this.setupRemoveButton(equipmentId);

        console.log(`✅ Equipment ${itemNumber} added`);
    },

    /**
     * Generate HTML for equipment entry
     */
    generateEquipmentHTML(equipmentId, itemNumber, data) {
        const brand = data?.brand || 'Hanna Instruments';
        const model = data?.model || 'HI98130';
        
        return `
            <div class="equipment-entry" id="${equipmentId}" data-item-number="${itemNumber}">
                <div class="equipment-header">
                    <h4 class="equipment-title">
                        <span class="equipment-icon">📦</span>
                        <span class="equipment-label">ITEM ${String(itemNumber).padStart(2, '0')}</span>
                    </h4>
                    <button type="button" class="btn-collapse" data-equipment-id="${equipmentId}">
                        <span class="collapse-icon">▼</span>
                    </button>
                    <button type="button" class="btn-remove-equipment" data-equipment-id="${equipmentId}" title="Eliminar equipo">
                        🗑️ Eliminar
                    </button>
                </div>

                <div class="equipment-content" id="${equipmentId}_content">
                    <!-- Datos del Equipo -->
                    <div class="equipment-subsection">
                        <h5 class="subsection-title">Datos del Equipo</h5>
                        <div class="form-grid">
                            <div class="input-group">
                                <label for="${equipmentId}_brand">Marca *</label>
                                <input type="text" id="${equipmentId}_brand" name="${equipmentId}_brand" 
                                       value="${brand}" placeholder="Marca del equipo" required>
                            </div>
                            <div class="input-group">
                                <label for="${equipmentId}_model">Modelo *</label>
                                <input type="text" id="${equipmentId}_model" name="${equipmentId}_model" 
                                       value="${model}" placeholder="Modelo del equipo" required>
                            </div>
                            <div class="input-group">
                                <label for="${equipmentId}_serial">Serie del Equipo *</label>
                                <input type="text" id="${equipmentId}_serial" name="${equipmentId}_serial" 
                                       value="${data?.serial || ''}" placeholder="Número de serie del equipo" required>
                            </div>
                            <div class="input-group">
                                <label for="${equipmentId}_electrodeSerial">Serie del Electrodo HI73127 *</label>
                                <input type="text" id="${equipmentId}_electrodeSerial" name="${equipmentId}_electrodeSerial" 
                                       value="${data?.electrodeSerial || ''}" placeholder="Número de serie del electrodo de pH" required>
                            </div>
                        </div>

                        <!-- Imágenes de Ingreso -->
                        <div class="image-upload-section">
                            <label class="image-upload-label">
                                📷 Fotos de Ingreso del Equipo
                                <span class="multiple-hint">(Puede seleccionar múltiples)</span>
                            </label>
                            <input type="file" 
                                   accept="image/*" 
                                   data-image-type="equipment_intake"
                                   data-equipment-id="${equipmentId}"
                                   multiple
                                   class="image-upload-input">
                            <div class="image-preview-container"></div>
                        </div>
                    </div>

                    <!-- Inspección Inicial -->
                    <div class="equipment-subsection">
                        <h5 class="subsection-title">Inspección Inicial</h5>
                        
                        <ul class="checklist">
                            <li class="checklist-item">
                                <input type="checkbox" id="${equipmentId}_powerOn" name="${equipmentId}_powerOn" value="yes">
                                <label for="${equipmentId}_powerOn">⚡ Equipo enciende correctamente</label>
                            </li>
                        </ul>

                        <div class="form-grid">
                            <div class="input-group">
                                <label for="${equipmentId}_batteryLevel">🔋 Nivel de Batería *</label>
                                <select id="${equipmentId}_batteryLevel" name="${equipmentId}_batteryLevel" required>
                                    <option value="">Seleccionar...</option>
                                    <option value="Alto (>70%)">Alto (>70%)</option>
                                    <option value="Medio (30-70%)">Medio (30-70%)</option>
                                    <option value="Bajo (<30%)">Bajo (<30%)</option>
                                    <option value="Descargado">Descargado</option>
                                </select>
                            </div>
                            <div class="input-group">
                                <label for="${equipmentId}_screenStatus">📺 Estado de la Pantalla *</label>
                                <select id="${equipmentId}_screenStatus" name="${equipmentId}_screenStatus" required>
                                    <option value="">Seleccionar...</option>
                                    <option value="Bueno">Bueno</option>
                                    <option value="Rayado">Rayado</option>
                                    <option value="Roto">Roto</option>
                                    <option value="No funciona">No funciona</option>
                                </select>
                            </div>
                            <div class="input-group">
                                <label for="${equipmentId}_buttonsStatus">🔘 Estado de los Botones *</label>
                                <select id="${equipmentId}_buttonsStatus" name="${equipmentId}_buttonsStatus" required>
                                    <option value="">Seleccionar...</option>
                                    <option value="Todos funcionan">Todos funcionan</option>
                                    <option value="Algunos no responden">Algunos no responden</option>
                                    <option value="Ninguno funciona">Ninguno funciona</option>
                                </select>
                            </div>
                            <div class="input-group">
                                <label for="${equipmentId}_phElectrodeStatus">🧪 Estado del Electrodo de pH *</label>
                                <select id="${equipmentId}_phElectrodeStatus" name="${equipmentId}_phElectrodeStatus" required>
                                    <option value="">Seleccionar...</option>
                                    <option value="Bueno">Bueno</option>
                                    <option value="Sucio">Sucio</option>
                                    <option value="Roto">Roto</option>
                                    <option value="Requiere reemplazo">Requiere reemplazo</option>
                                </select>
                            </div>
                            <div class="input-group">
                                <label for="${equipmentId}_ecSensorStatus">🧪 Estado del Sensor de EC *</label>
                                <select id="${equipmentId}_ecSensorStatus" name="${equipmentId}_ecSensorStatus" required>
                                    <option value="">Seleccionar...</option>
                                    <option value="Bueno">Bueno</option>
                                    <option value="Sucio">Sucio</option>
                                    <option value="Dañado">Dañado</option>
                                </select>
                            </div>
                            <div class="input-group">
                                <label for="${equipmentId}_tempSensorStatus">🌡️ Estado del Sensor de Temperatura *</label>
                                <select id="${equipmentId}_tempSensorStatus" name="${equipmentId}_tempSensorStatus" required>
                                    <option value="">Seleccionar...</option>
                                    <option value="Conforme">Conforme</option>
                                    <option value="No conforme">No conforme</option>
                                </select>
                            </div>
                        </div>

                        <ul class="checklist">
                            <li class="checklist-item">
                                <input type="checkbox" id="${equipmentId}_storageSolution" name="${equipmentId}_storageSolution" value="yes">
                                <label for="${equipmentId}_storageSolution">💧 Electrodo llegó con solución de almacenamiento</label>
                            </li>
                        </ul>
                    </div>

                    <!-- Lecturas Iniciales -->
                    <div class="equipment-subsection">
                        <h5 class="subsection-title">Lecturas Iniciales</h5>
                        
                        <h6 class="reading-subtitle">Lecturas de pH</h6>
                        
                        <!-- pH 7.01 -->
                        <div class="reading-input-group">
                            <div class="reading-input-wrapper">
                                <div class="input-group">
                                    <label for="${equipmentId}_ph701Initial">Lectura pH 7.01 *</label>
                                    <input type="number" id="${equipmentId}_ph701Initial" name="${equipmentId}_ph701Initial" 
                                           step="0.01" placeholder="Ej: 7.03" required>
                                    <small>Rango aceptable: 6.96 - 7.06 (±0.05)</small>
                                </div>
                            </div>
                            <div class="reading-validation" id="${equipmentId}_ph701InitialValidation"></div>
                        </div>

                        <!-- Imagen pH 7.01 -->
                        <div class="image-upload-section">
                            <label class="image-upload-label">📷 Imagen de Lectura pH 7.01</label>
                            <input type="file" accept="image/*" data-image-type="ph_7_01_initial" data-equipment-id="${equipmentId}" class="image-upload-input">
                            <div class="image-preview-container"></div>
                        </div>

                        <!-- pH 4.01 -->
                        <div class="reading-input-group">
                            <div class="reading-input-wrapper">
                                <div class="input-group">
                                    <label for="${equipmentId}_ph401Initial">Lectura pH 4.01 *</label>
                                    <input type="number" id="${equipmentId}_ph401Initial" name="${equipmentId}_ph401Initial" 
                                           step="0.01" placeholder="Ej: 4.02" required>
                                    <small>Rango aceptable: 3.96 - 4.06 (±0.05)</small>
                                </div>
                            </div>
                            <div class="reading-validation" id="${equipmentId}_ph401InitialValidation"></div>
                        </div>

                        <!-- Imagen pH 4.01 -->
                        <div class="image-upload-section">
                            <label class="image-upload-label">📷 Imagen de Lectura pH 4.01</label>
                            <input type="file" accept="image/*" data-image-type="ph_4_01_initial" data-equipment-id="${equipmentId}" class="image-upload-input">
                            <div class="image-preview-container"></div>
                        </div>

                        <h6 class="reading-subtitle">Lecturas de EC</h6>
                        
                        <!-- EC 12.88 -->
                        <div class="reading-input-group">
                            <div class="reading-input-wrapper">
                                <div class="input-group">
                                    <label for="${equipmentId}_ecInitial">Lectura EC 12.88 mS/cm *</label>
                                    <input type="number" id="${equipmentId}_ecInitial" name="${equipmentId}_ecInitial" 
                                           step="0.01" placeholder="Ej: 12.85" required>
                                    <small>Rango aceptable: 12.62 - 13.14 mS/cm (±2%)</small>
                                </div>
                            </div>
                            <div class="reading-validation" id="${equipmentId}_ecInitialValidation"></div>
                        </div>

                        <!-- Imagen EC -->
                        <div class="image-upload-section">
                            <label class="image-upload-label">📷 Imagen de Lectura EC 12.88 mS/cm</label>
                            <input type="file" accept="image/*" data-image-type="ec_12_88_initial" data-equipment-id="${equipmentId}" class="image-upload-input">
                            <div class="image-preview-container"></div>
                        </div>

                        <h6 class="reading-subtitle">Temperatura</h6>
                        <div class="input-group">
                            <label for="${equipmentId}_temperatureReading">Temperatura durante las pruebas (°C) *</label>
                            <input type="number" id="${equipmentId}_temperatureReading" name="${equipmentId}_temperatureReading" 
                                   step="0.1" placeholder="Ej: 25.0" required>
                        </div>
                    </div>

                    <!-- Limpieza y Calibración -->
                    <div class="equipment-subsection">
                        <h5 class="subsection-title">Limpieza y Calibración</h5>
                        
                        <h6 class="reading-subtitle">Proceso de Limpieza</h6>
                        <ul class="checklist">
                            <li class="checklist-item">
                                <input type="checkbox" id="${equipmentId}_cleaningDone" name="${equipmentId}_cleaningDone" value="yes">
                                <label for="${equipmentId}_cleaningDone">🧼 Limpieza con solución de limpieza realizada</label>
                            </li>
                            <li class="checklist-item">
                                <input type="checkbox" id="${equipmentId}_storageSolutionApplied" name="${equipmentId}_storageSolutionApplied" value="yes">
                                <label for="${equipmentId}_storageSolutionApplied">💧 Solución de almacenamiento colocada</label>
                            </li>
                        </ul>

                        <h6 class="reading-subtitle">Calibración de pH</h6>
                        
                        <!-- Calibración pH 7.01 -->
                        <div class="reading-input-group">
                            <div class="reading-input-wrapper">
                                <div class="input-group">
                                    <label for="${equipmentId}_ph701Calibration">Calibración pH 7.01 *</label>
                                    <input type="number" id="${equipmentId}_ph701Calibration" name="${equipmentId}_ph701Calibration" 
                                           step="0.01" placeholder="Ej: 7.00" required>
                                    <small>Rango aceptable: 6.96 - 7.06 (±0.05)</small>
                                </div>
                            </div>
                            <div class="reading-validation" id="${equipmentId}_ph701CalibrationValidation"></div>
                        </div>

                        <!-- Calibración pH 4.01 -->
                        <div class="reading-input-group">
                            <div class="reading-input-wrapper">
                                <div class="input-group">
                                    <label for="${equipmentId}_ph401Calibration">Calibración pH 4.01 *</label>
                                    <input type="number" id="${equipmentId}_ph401Calibration" name="${equipmentId}_ph401Calibration" 
                                           step="0.01" placeholder="Ej: 4.01" required>
                                    <small>Rango aceptable: 3.96 - 4.06 (±0.05)</small>
                                </div>
                            </div>
                            <div class="reading-validation" id="${equipmentId}_ph401CalibrationValidation"></div>
                        </div>

                        <!-- Imagen Calibración pH 7.01 -->
                        <div class="image-upload-section">
                            <label class="image-upload-label">📷 Imagen de Calibración pH 7.01</label>
                            <input type="file" accept="image/*" data-image-type="calibration_ph_7_01" data-equipment-id="${equipmentId}" class="image-upload-input">
                            <div class="image-preview-container"></div>
                        </div>

                        <!-- Imagen Calibración pH 4.01 -->
                        <div class="image-upload-section">
                            <label class="image-upload-label">📷 Imagen de Calibración pH 4.01</label>
                            <input type="file" accept="image/*" data-image-type="calibration_ph_4_01" data-equipment-id="${equipmentId}" class="image-upload-input">
                            <div class="image-preview-container"></div>
                        </div>

                        <h6 class="reading-subtitle">Calibración de EC</h6>
                        
                        <!-- Calibración EC -->
                        <div class="reading-input-group">
                            <div class="reading-input-wrapper">
                                <div class="input-group">
                                    <label for="${equipmentId}_ecCalibration">Calibración EC 12.88 mS/cm *</label>
                                    <input type="number" id="${equipmentId}_ecCalibration" name="${equipmentId}_ecCalibration" 
                                           step="0.01" placeholder="Ej: 12.88" required>
                                    <small>Rango aceptable: 12.62 - 13.14 mS/cm (±2%)</small>
                                </div>
                            </div>
                            <div class="reading-validation" id="${equipmentId}_ecCalibrationValidation"></div>
                        </div>

                        <!-- Imagen Calibración EC 12.88 -->
                        <div class="image-upload-section">
                            <label class="image-upload-label">📷 Imagen de Calibración EC 12.88 mS/cm</label>
                            <input type="file" accept="image/*" data-image-type="calibration_ec_12_88" data-equipment-id="${equipmentId}" class="image-upload-input">
                            <div class="image-preview-container"></div>
                        </div>
                    </div>

                    <!-- Troubleshooting sections will be added dynamically if needed -->
                    <div id="${equipmentId}_troubleshooting_container"></div>
                </div>
            </div>
        `;
    },

    /**
     * Initialize validators for equipment
     */
    initializeEquipmentValidators(equipmentId) {
        // pH 7.01 Initial
        const ph701Initial = document.getElementById(`${equipmentId}_ph701Initial`);
        if (ph701Initial) {
            ph701Initial.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                const validation = document.getElementById(`${equipmentId}_ph701InitialValidation`);
                Validators.validatePh(value, 7.01, validation);
            });
        }

        // pH 4.01 Initial
        const ph401Initial = document.getElementById(`${equipmentId}_ph401Initial`);
        if (ph401Initial) {
            ph401Initial.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                const validation = document.getElementById(`${equipmentId}_ph401InitialValidation`);
                Validators.validatePh(value, 4.01, validation);
            });
        }

        // EC Initial
        const ecInitial = document.getElementById(`${equipmentId}_ecInitial`);
        if (ecInitial) {
            ecInitial.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                const validation = document.getElementById(`${equipmentId}_ecInitialValidation`);
                Validators.validateEc(value, validation);
            });
        }

        // Calibration validators
        const ph701Cal = document.getElementById(`${equipmentId}_ph701Calibration`);
        if (ph701Cal) {
            ph701Cal.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                const validation = document.getElementById(`${equipmentId}_ph701CalibrationValidation`);
                Validators.validatePh(value, 7.01, validation);
            });
        }

        const ph401Cal = document.getElementById(`${equipmentId}_ph401Calibration`);
        if (ph401Cal) {
            ph401Cal.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                const validation = document.getElementById(`${equipmentId}_ph401CalibrationValidation`);
                Validators.validatePh(value, 4.01, validation);
            });
        }

        const ecCal = document.getElementById(`${equipmentId}_ecCalibration`);
        if (ecCal) {
            ecCal.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                const validation = document.getElementById(`${equipmentId}_ecCalibrationValidation`);
                Validators.validateEc(value, validation);
            });
        }
    },

    /**
     * Initialize image handlers for equipment
     */
    initializeEquipmentImageHandlers(equipmentId) {
        const equipmentElement = document.getElementById(equipmentId);
        if (!equipmentElement) return;

        const imageInputs = equipmentElement.querySelectorAll('.image-upload-input');
        imageInputs.forEach(input => {
            ImageHandler.setupImageInput(input);
        });
    },

    /**
     * Setup collapse functionality
     */
    setupCollapse(equipmentId) {
        // Use setTimeout to ensure DOM is fully ready
        setTimeout(() => {
            const collapseBtn = document.querySelector(`[data-equipment-id="${equipmentId}"].btn-collapse`);
            const content = document.getElementById(`${equipmentId}_content`);
            
            if (collapseBtn && content) {
                collapseBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent event bubbling
                    const icon = collapseBtn.querySelector('.collapse-icon');
                    if (content.style.display === 'none') {
                        content.style.display = 'block';
                        icon.textContent = '▼';
                    } else {
                        content.style.display = 'none';
                        icon.textContent = '▶';
                    }
                });
                console.log(`✅ Collapse button setup for ${equipmentId}`);
            } else {
                console.error(`❌ Collapse button or content not found for ${equipmentId}`);
            }
        }, 100);
    },

    /**
     * Setup remove button
     */
    setupRemoveButton(equipmentId) {
        // Use setTimeout to ensure DOM is fully ready
        setTimeout(() => {
            const removeBtn = document.querySelector(`[data-equipment-id="${equipmentId}"].btn-remove-equipment`);
            
            if (removeBtn) {
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent event bubbling
                    
                    // Don't allow removing the last equipment
                    if (this.equipments.length <= 1) {
                        alert('⚠️ Debe haber al menos un equipo en el reporte');
                        return;
                    }

                    const confirmed = confirm('¿Está seguro de eliminar este equipo?');
                    if (confirmed) {
                        this.removeEquipment(equipmentId);
                    }
                });
                console.log(`✅ Remove button setup for ${equipmentId}`);
            } else {
                console.error(`❌ Remove button not found for ${equipmentId}`);
            }
        }, 100);
    },

    /**
     * Remove equipment entry
     */
    removeEquipment(equipmentId) {
        const element = document.getElementById(equipmentId);
        if (element) {
            element.remove();
            this.equipments = this.equipments.filter(eq => eq.id !== equipmentId);
            console.log(`✅ Equipment ${equipmentId} removed`);
            
            // Renumber remaining equipment to maintain sequential order
            this.renumberEquipments();
        }
    },

    /**
     * Renumber all equipment items sequentially
     */
    renumberEquipments() {
        this.equipments.forEach((eq, index) => {
            const newItemNumber = index + 1;
            eq.itemNumber = newItemNumber;
            
            // Update the displayed item number in the UI
            const element = document.getElementById(eq.id);
            if (element) {
                const label = element.querySelector('.equipment-label');
                if (label) {
                    label.textContent = `ITEM ${String(newItemNumber).padStart(2, '0')}`;
                }
                // Update data attribute
                element.dataset.itemNumber = newItemNumber;
            }
        });
        console.log('✅ Equipment items renumbered');
    },

    /**
     * Get all equipment data
     */
    getAllEquipmentData() {
        const equipmentData = [];

        this.equipments.forEach(eq => {
            const data = this.getEquipmentData(eq.id);
            if (data) {
                equipmentData.push(data);
            }
        });

        return equipmentData;
    },

    /**
     * Get data for a specific equipment
     */
    getEquipmentData(equipmentId) {
        const element = document.getElementById(equipmentId);
        if (!element) return null;

        const getData = (fieldName) => {
            const el = document.getElementById(`${equipmentId}_${fieldName}`);
            if (!el) return null;
            
            if (el.type === 'checkbox') {
                return el.checked;
            } else if (el.type === 'number') {
                return el.value ? parseFloat(el.value) : null;
            } else {
                return el.value || null;
            }
        };

        return {
            id: equipmentId,
            itemNumber: element.dataset.itemNumber,
            brand: getData('brand'),
            model: getData('model'),
            serial: getData('serial'),
            electrodeSerial: getData('electrodeSerial'),
            powerOn: getData('powerOn'),
            batteryLevel: getData('batteryLevel'),
            screenStatus: getData('screenStatus'),
            buttonsStatus: getData('buttonsStatus'),
            phElectrodeStatus: getData('phElectrodeStatus'),
            ecSensorStatus: getData('ecSensorStatus'),
            tempSensorStatus: getData('tempSensorStatus'),
            storageSolution: getData('storageSolution'),
            ph701Initial: getData('ph701Initial'),
            ph401Initial: getData('ph401Initial'),
            ecInitial: getData('ecInitial'),
            temperatureReading: getData('temperatureReading'),
            cleaningDone: getData('cleaningDone'),
            storageSolutionApplied: getData('storageSolutionApplied'),
            ph701Calibration: getData('ph701Calibration'),
            ph401Calibration: getData('ph401Calibration'),
            ecCalibration: getData('ecCalibration')
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EquipmentManager;
}
