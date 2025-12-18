// ===== Report Generator Module - HI98130 Specific =====
// Generates HTML report from form data with images

const ReportGenerator = {
    /**
     * Generate complete HTML report
     * @param {Object} data - Form data
     * @returns {string} HTML report
     */
    generateReport(data) {
        return `
            <div class="report">
                ${this.generateHeader(data)}
                ${this.generateClientInfo(data)}
                ${this.generateEquipmentInfo(data)}
                ${this.generateInitialInspection(data)}
                ${this.generateInitialReadings(data)}
                ${this.generateCalibration(data)}
                ${this.generateTroubleshooting(data)}
                ${this.generateBudget(data)}
                ${this.generateConclusions(data)}
                ${this.generateRecommendations(data)}
                ${this.generateSignature(data)}
            </div>
        `;
    },

    /**
     * Generate report header
     */
    generateHeader(data) {
        return `
            <div class="report-header">
                <h1>INFORME TÉCNICO N° ${this.escapeHtml(data.reportNumber || 'N/A')}</h1>
                <p><strong>Equipo:</strong> ${this.escapeHtml(data.brand)} ${this.escapeHtml(data.model)}</p>
                <p><strong>Fecha:</strong> ${this.formatDate(data.reportDate)}</p>
            </div>
        `;
    },

    /**
     * Generate client information section
     */
    generateClientInfo(data) {
        return `
            <div class="report-section">
                <h2>1. Datos del Cliente</h2>
                <div class="report-grid">
                    <div class="report-field">
                        <div class="report-field-label">Razón Social</div>
                        <div class="report-field-value">${this.escapeHtml(data.businessName || 'N/A')}</div>
                    </div>
                    <div class="report-field">
                        <div class="report-field-label">RUC</div>
                        <div class="report-field-value">${this.escapeHtml(data.ruc || 'N/A')}</div>
                    </div>
                    <div class="report-field">
                        <div class="report-field-label">Dirección</div>
                        <div class="report-field-value">${this.escapeHtml(data.address || 'N/A')}</div>
                    </div>
                    <div class="report-field">
                        <div class="report-field-label">Teléfono</div>
                        <div class="report-field-value">${this.escapeHtml(data.phone || 'N/A')}</div>
                    </div>
                    <div class="report-field">
                        <div class="report-field-label">Solicitante</div>
                        <div class="report-field-value">${this.escapeHtml(data.contactName || 'N/A')}</div>
                    </div>
                    <div class="report-field">
                        <div class="report-field-label">Correo Electrónico</div>
                        <div class="report-field-value">${this.escapeHtml(data.email || 'N/A')}</div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Generate equipment information section
     */
    generateEquipmentInfo(data) {
        const intakeImages = this.getImages(data, 'equipment_intake');
        
        return `
            <div class="report-section">
                <h2>2. Datos del Equipo</h2>
                <div class="report-grid">
                    <div class="report-field">
                        <div class="report-field-label">Marca</div>
                        <div class="report-field-value">${this.escapeHtml(data.brand || 'N/A')}</div>
                    </div>
                    <div class="report-field">
                        <div class="report-field-label">Modelo</div>
                        <div class="report-field-value">${this.escapeHtml(data.model || 'N/A')}</div>
                    </div>
                    <div class="report-field">
                        <div class="report-field-label">Serie del Equipo</div>
                        <div class="report-field-value">${this.escapeHtml(data.serial || 'N/A')}</div>
                    </div>
                    <div class="report-field">
                        <div class="report-field-label">Serie del Electrodo HI73127</div>
                        <div class="report-field-value">${this.escapeHtml(data.electrodeSerial || 'N/A')}</div>
                    </div>
                </div>
                
                ${intakeImages.length > 0 ? `
                    <h3>Fotos de Ingreso</h3>
                    <div class="report-images">
                        ${intakeImages.map(img => `
                            <img src="${img.data}" alt="Foto de ingreso" style="max-width: 300px; margin: 10px;">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    },

    /**
     * Generate initial inspection section
     */
    generateInitialInspection(data) {
        return `
            <div class="report-section">
                <h2>3. Inspección Inicial</h2>
                <table class="report-table">
                    <tr>
                        <td><strong>Equipo enciende</strong></td>
                        <td>${data.powerOn === 'yes' ? '✅ Sí' : '❌ No'}</td>
                    </tr>
                    <tr>
                        <td><strong>Nivel de Batería</strong></td>
                        <td>${this.escapeHtml(data.batteryLevel || 'N/A')}</td>
                    </tr>
                    <tr>
                        <td><strong>Estado de la Pantalla</strong></td>
                        <td>${this.escapeHtml(data.screenStatus || 'N/A')}</td>
                    </tr>
                    <tr>
                        <td><strong>Estado de los Botones</strong></td>
                        <td>${this.escapeHtml(data.buttonsStatus || 'N/A')}</td>
                    </tr>
                    <tr>
                        <td><strong>Estado del Electrodo de pH</strong></td>
                        <td>${this.escapeHtml(data.phElectrodeStatus || 'N/A')}</td>
                    </tr>
                    <tr>
                        <td><strong>Estado del Sensor de EC</strong></td>
                        <td>${this.escapeHtml(data.ecSensorStatus || 'N/A')}</td>
                    </tr>
                    <tr>
                        <td><strong>Estado del Sensor de Temperatura</strong></td>
                        <td>${this.escapeHtml(data.tempSensorStatus || 'N/A')}</td>
                    </tr>
                    <tr>
                        <td><strong>Solución de almacenamiento</strong></td>
                        <td>${data.storageSolution === 'yes' ? '✅ Sí' : '❌ No'}</td>
                    </tr>
                </table>
            </div>
        `;
    },

    /**
     * Generate initial readings section
     */
    generateInitialReadings(data) {
        const ph701Validation = Validators.validatePH(parseFloat(data.ph701Initial), Validators.STANDARD_PH_7);
        const ph401Validation = Validators.validatePH(parseFloat(data.ph401Initial), Validators.STANDARD_PH_4);
        const ecValidation = Validators.validateEC(parseFloat(data.ecInitial), Validators.STANDARD_EC);

        const ph701Image = this.getFirstImage(data, 'ph_7_01_initial');
        const ph401Image = this.getFirstImage(data, 'ph_4_01_initial');
        const ecImage = this.getFirstImage(data, 'ec_12_88_initial');

        return `
            <div class="report-section">
                <h2>4. Lecturas Iniciales</h2>
                
                <h3>Lecturas de pH</h3>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Solución</th>
                            <th>Lectura</th>
                            <th>Rango Aceptable</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>pH 7.01</td>
                            <td>${data.ph701Initial || 'N/A'}</td>
                            <td>${ph701Validation.range}</td>
                            <td>${Validators.getValidationBadge(ph701Validation.isValid)}</td>
                        </tr>
                        <tr>
                            <td>pH 4.01</td>
                            <td>${data.ph401Initial || 'N/A'}</td>
                            <td>${ph401Validation.range}</td>
                            <td>${Validators.getValidationBadge(ph401Validation.isValid)}</td>
                        </tr>
                    </tbody>
                </table>

                ${ph701Image ? `
                    <div class="report-images">
                        <div>
                            <p><strong>Lectura pH 7.01:</strong></p>
                            <img src="${ph701Image.data}" alt="Lectura pH 7.01" style="max-width: 400px;">
                        </div>
                    </div>
                ` : ''}

                ${ph401Image ? `
                    <div class="report-images">
                        <div>
                            <p><strong>Lectura pH 4.01:</strong></p>
                            <img src="${ph401Image.data}" alt="Lectura pH 4.01" style="max-width: 400px;">
                        </div>
                    </div>
                ` : ''}

                <h3>Lecturas de EC</h3>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Solución</th>
                            <th>Lectura</th>
                            <th>Rango Aceptable</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>EC 12.88 mS/cm</td>
                            <td>${data.ecInitial || 'N/A'}</td>
                            <td>${ecValidation.range}</td>
                            <td>${Validators.getValidationBadge(ecValidation.isValid)}</td>
                        </tr>
                    </tbody>
                </table>

                ${ecImage ? `
                    <div class="report-images">
                        <div>
                            <p><strong>Lectura EC 12.88 mS/cm:</strong></p>
                            <img src="${ecImage.data}" alt="Lectura EC" style="max-width: 400px;">
                        </div>
                    </div>
                ` : ''}

                <h3>Temperatura</h3>
                <p><strong>Temperatura durante las pruebas:</strong> ${data.temperatureReading || 'N/A'} °C</p>
            </div>
        `;
    },

    /**
     * Generate calibration section
     */
    generateCalibration(data) {
        const ph701CalValidation = Validators.validatePH(parseFloat(data.ph701Calibration), Validators.STANDARD_PH_7);
        const ph401CalValidation = Validators.validatePH(parseFloat(data.ph401Calibration), Validators.STANDARD_PH_4);
        const ecCalValidation = Validators.validateEC(parseFloat(data.ecCalibration), Validators.STANDARD_EC);

        const ph701CalImage = this.getFirstImage(data, 'calibration_ph_7_01');
        const ph401CalImage = this.getFirstImage(data, 'calibration_ph_4_01');
        const ecCalImage = this.getFirstImage(data, 'calibration_ec_12_88');

        return `
            <div class="report-section">
                <h2>5. Limpieza y Calibración</h2>
                
                <h3>Proceso de Limpieza</h3>
                <ul>
                    <li>${data.cleaningDone === 'yes' ? '✅' : '❌'} Limpieza con solución de limpieza realizada</li>
                    <li>${data.storageSolutionApplied === 'yes' ? '✅' : '❌'} Solución de almacenamiento colocada</li>
                </ul>

                <h3>Calibración de pH</h3>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Solución</th>
                            <th>Lectura</th>
                            <th>Rango Aceptable</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>pH 7.01</td>
                            <td>${data.ph701Calibration || 'N/A'}</td>
                            <td>${ph701CalValidation.range}</td>
                            <td>${Validators.getValidationBadge(ph701CalValidation.isValid)}</td>
                        </tr>
                        <tr>
                            <td>pH 4.01</td>
                            <td>${data.ph401Calibration || 'N/A'}</td>
                            <td>${ph401CalValidation.range}</td>
                            <td>${Validators.getValidationBadge(ph401CalValidation.isValid)}</td>
                        </tr>
                    </tbody>
                </table>

                ${ph701CalImage ? `
                    <div class="report-images">
                        <div>
                            <p><strong>Calibración pH 7.01:</strong></p>
                            <img src="${ph701CalImage.data}" alt="Calibración pH 7.01" style="max-width: 400px;">
                        </div>
                    </div>
                ` : ''}

                ${ph401CalImage ? `
                    <div class="report-images">
                        <div>
                            <p><strong>Calibración pH 4.01:</strong></p>
                            <img src="${ph401CalImage.data}" alt="Calibración pH 4.01" style="max-width: 400px;">
                        </div>
                    </div>
                ` : ''}

                <h3>Calibración de EC</h3>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Solución</th>
                            <th>Lectura</th>
                            <th>Rango Aceptable</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>EC 12.88 mS/cm</td>
                            <td>${data.ecCalibration || 'N/A'}</td>
                            <td>${ecCalValidation.range}</td>
                            <td>${Validators.getValidationBadge(ecCalValidation.isValid)}</td>
                        </tr>
                    </tbody>
                </table>

                ${ecCalImage ? `
                    <div class="report-images">
                        <div>
                            <p><strong>Calibración EC 12.88 mS/cm:</strong></p>
                            <img src="${ecCalImage.data}" alt="Calibración EC" style="max-width: 400px;">
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    /**
     * Generate troubleshooting section (if applicable)
     */
    generateTroubleshooting(data) {
        let html = '';

        // EC Troubleshooting
        if (data.ecConditioningDone || data.ecPostConditioning || data.ecFinalStatus) {
            const ecPostImage = this.getFirstImage(data, 'ec_post_conditioning');
            
            html += `
                <div class="report-section">
                    <h2>6. Troubleshooting - Conductividad (EC)</h2>
                    <p><strong>Acondicionamiento del sensor realizado:</strong> ${data.ecConditioningDone === 'yes' ? 'Sí' : 'No'}</p>
                    
                    ${data.ecPostConditioning ? `
                        <p><strong>Lectura post-acondicionamiento:</strong> ${data.ecPostConditioning} mS/cm</p>
                        ${ecPostImage ? `
                            <div class="report-images">
                                <img src="${ecPostImage.data}" alt="EC Post-acondicionamiento" style="max-width: 400px;">
                            </div>
                        ` : ''}
                    ` : ''}
                    
                    <p><strong>Estado final:</strong> ${this.escapeHtml(data.ecFinalStatus || 'N/A')}</p>
                </div>
            `;
        }

        // pH Troubleshooting
        if (data.phJuntaAdjusted || data.patronElectrodeTested || data.phFinalStatus) {
            const patronImage = this.getFirstImage(data, 'patron_electrode');
            
            html += `
                <div class="report-section">
                    <h2>7. Troubleshooting - pH</h2>
                    
                    ${data.phJuntaAdjusted === 'yes' ? `
                        <h3>Ajuste de Junta de Tela</h3>
                        <p>✅ Junta de tela ajustada</p>
                        <p><strong>Resultado:</strong> ${this.escapeHtml(data.phPostJuntaStatus || 'N/A')}</p>
                    ` : ''}
                    
                    ${data.patronElectrodeTested === 'yes' ? `
                        <h3>Prueba con Electrodo Patrón</h3>
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>Solución</th>
                                    <th>Lectura</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.ph701Patron ? `
                                    <tr>
                                        <td>pH 7.01</td>
                                        <td>${data.ph701Patron}</td>
                                        <td>${Validators.getValidationBadge(Validators.validatePH(parseFloat(data.ph701Patron), Validators.STANDARD_PH_7).isValid)}</td>
                                    </tr>
                                ` : ''}
                                ${data.ph401Patron ? `
                                    <tr>
                                        <td>pH 4.01</td>
                                        <td>${data.ph401Patron}</td>
                                        <td>${Validators.getValidationBadge(Validators.validatePH(parseFloat(data.ph401Patron), Validators.STANDARD_PH_4).isValid)}</td>
                                    </tr>
                                ` : ''}
                            </tbody>
                        </table>
                        
                        ${patronImage ? `
                            <div class="report-images">
                                <img src="${patronImage.data}" alt="Prueba con electrodo patrón" style="max-width: 400px;">
                            </div>
                        ` : ''}
                    ` : ''}
                    
                    <p><strong>Diagnóstico final:</strong> ${this.escapeHtml(data.phFinalStatus || 'N/A')}</p>
                </div>
            `;
        }

        return html;
    },

    /**
     * Generate budget section
     */
    generateBudget(data) {
        const budgetRows = data.budgetItems?.map(item => `
            <tr>
                <td>${this.escapeHtml(item.description)}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${Calculator.formatCurrency(item.price)}</td>
                <td style="text-align: right;">${Calculator.formatCurrency(item.subtotal)}</td>
            </tr>
        `).join('') || '<tr><td colspan="4" style="text-align: center;">No hay ítems en el presupuesto</td></tr>';

        const warrantyText = data.warranty ? '✅ Sujeto a Garantía' : '❌ No sujeto a Garantía';

        return `
            <div class="report-section">
                <h2>8. Presupuesto</h2>
                <p class="info-note"><strong>Nota:</strong> Los precios incluyen IGV (18%)</p>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Descripción</th>
                            <th style="text-align: center;">Cantidad</th>
                            <th style="text-align: right;">Precio Unit. (inc. IGV)</th>
                            <th style="text-align: right;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${budgetRows}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" style="text-align: right; font-weight: bold;">Total (inc. IGV):</td>
                            <td style="text-align: right; font-weight: bold;">${Calculator.formatCurrency(data.total || 0)}</td>
                        </tr>
                        <tr>
                            <td colspan="3" style="text-align: right; font-weight: bold;">IGV (18%):</td>
                            <td style="text-align: right; font-weight: bold;">${Calculator.formatCurrency(data.igv || 0)}</td>
                        </tr>
                        <tr style="background: var(--primary-50);">
                            <td colspan="3" style="text-align: right; font-weight: bold; font-size: 1.1em;">Subtotal:</td>
                            <td style="text-align: right; font-weight: bold; font-size: 1.1em; color: var(--primary-700);">${Calculator.formatCurrency(data.subtotal || 0)}</td>
                        </tr>
                    </tfoot>
                </table>
                <p style="margin-top: 1rem;"><strong>${warrantyText}</strong></p>
            </div>
        `;
    },

    /**
     * Generate conclusions section with intelligent logic
     */
    generateConclusions(data) {
        const conclusions = this.generateAutomaticConclusions(data);
        return `
            <div class="report-section">
                <h2>9. Conclusiones</h2>
                <p>${conclusions}</p>
            </div>
        `;
    },

    /**
     * Generate automatic conclusions based on test results
     */
    generateAutomaticConclusions(data) {
        const ph701Cal = parseFloat(data.ph701Calibration);
        const ph401Cal = parseFloat(data.ph401Calibration);
        const ecCal = parseFloat(data.ecCalibration);

        const phValid = Validators.validatePH(ph701Cal, Validators.STANDARD_PH_7).isValid &&
                       Validators.validatePH(ph401Cal, Validators.STANDARD_PH_4).isValid;
        const ecValid = Validators.validateEC(ecCal, Validators.STANDARD_EC).isValid;

        // Caso 1: Todo conforme
        if (phValid && ecValid) {
            return `El equipo ${this.escapeHtml(data.brand)} ${this.escapeHtml(data.model)} serie ${this.escapeHtml(data.serial)} con electrodo HI73127 serie ${this.escapeHtml(data.electrodeSerial)} ha sido evaluado y calibrado satisfactoriamente. Todas las lecturas de pH y conductividad (EC) están dentro de los márgenes de precisión establecidos (±0.05 pH y ±2% EC). El equipo está listo para su uso en mediciones precisas.`;
        }

        // Caso 2: pH no conforme - requiere electrodo nuevo
        if (!phValid && data.phFinalStatus === 'Requiere electrodo nuevo') {
            return `El equipo ${this.escapeHtml(data.brand)} ${this.escapeHtml(data.model)} serie ${this.escapeHtml(data.serial)} presenta lecturas de pH fuera del margen de precisión (±0.05). Se realizó prueba con electrodo patrón confirmando que el problema es del electrodo HI73127 serie ${this.escapeHtml(data.electrodeSerial)}. Se requiere reemplazo del electrodo de pH para obtener mediciones precisas.`;
        }

        // Caso 3: pH no conforme - fallo interno
        if (!phValid && data.phFinalStatus === 'Fallo interno') {
            return `El equipo ${this.escapeHtml(data.brand)} ${this.escapeHtml(data.model)} serie ${this.escapeHtml(data.serial)} presenta lecturas de pH fuera del margen de precisión (±0.05). Se realizó prueba con electrodo patrón sin resultados satisfactorios, indicando posible fallo interno del equipo. No es posible obtener lecturas de pH precisas ni con electrodo nuevo. Se recomienda enviar a servicio técnico autorizado.`;
        }

        // Caso 4: EC no conforme
        if (!ecValid && data.ecFinalStatus === 'No resuelto') {
            return `El equipo ${this.escapeHtml(data.brand)} ${this.escapeHtml(data.model)} serie ${this.escapeHtml(data.serial)} presenta lecturas de conductividad (EC) fuera del margen de precisión (±2%). Se realizó proceso de acondicionamiento del sensor sin resultados satisfactorios. El equipo no logra tomar lecturas de EC correctamente. ${phValid ? 'Las mediciones de pH funcionan correctamente.' : ''}`;
        }

        // Caso 5: Problemas mixtos
        if (!phValid && !ecValid) {
            return `El equipo ${this.escapeHtml(data.brand)} ${this.escapeHtml(data.model)} serie ${this.escapeHtml(data.serial)} presenta observaciones tanto en las mediciones de pH como de conductividad (EC). Se requiere atención técnica especializada para resolver los problemas detectados.`;
        }

        // Caso 6: Solo EC conforme, pH con problemas
        if (!phValid && ecValid) {
            return `El equipo ${this.escapeHtml(data.brand)} ${this.escapeHtml(data.model)} serie ${this.escapeHtml(data.serial)} presenta lecturas de pH fuera del margen de precisión. Las mediciones de conductividad (EC) funcionan correctamente. ${data.phFinalStatus ? 'Estado: ' + this.escapeHtml(data.phFinalStatus) : ''}`;
        }

        // Caso 7: Solo pH conforme, EC con problemas
        if (phValid && !ecValid) {
            return `El equipo ${this.escapeHtml(data.brand)} ${this.escapeHtml(data.model)} serie ${this.escapeHtml(data.serial)} presenta lecturas de conductividad (EC) fuera del margen de precisión. Las mediciones de pH funcionan correctamente. ${data.ecFinalStatus ? 'Estado: ' + this.escapeHtml(data.ecFinalStatus) : ''}`;
        }

        return `El equipo ha sido evaluado. Ver detalles en las secciones anteriores.`;
    },

    /**
     * Generate recommendations section
     */
    generateRecommendations(data) {
        const ph701Cal = parseFloat(data.ph701Calibration);
        const ph401Cal = parseFloat(data.ph401Calibration);
        const ecCal = parseFloat(data.ecCalibration);

        const phValid = Validators.validatePH(ph701Cal, Validators.STANDARD_PH_7).isValid &&
                       Validators.validatePH(ph401Cal, Validators.STANDARD_PH_4).isValid;
        const ecValid = Validators.validateEC(ecCal, Validators.STANDARD_EC).isValid;

        let recommendations = `
            <div class="report-section">
                <h2>10. Recomendaciones</h2>
                <ul>
                    <li><strong>Mantenimiento Preventivo:</strong> Realizar limpieza de electrodos después de cada uso con agua destilada.</li>
                    <li><strong>Almacenamiento:</strong> Mantener el electrodo de pH en solución de almacenamiento KCl 3M cuando no esté en uso.</li>
                    <li><strong>Calibración:</strong> Calibrar el equipo antes de cada jornada de mediciones con soluciones buffer certificadas.</li>
        `;

        // Recomendaciones específicas según problemas
        if (!phValid && data.phFinalStatus === 'Requiere electrodo nuevo') {
            recommendations += `
                    <li><strong style="color: var(--error);">⚠️ ACCIÓN REQUERIDA:</strong> Adquirir electrodo de pH HI73127 nuevo. El electrodo actual no proporciona lecturas dentro del margen de precisión.</li>
            `;
        }

        if (!phValid && data.phFinalStatus === 'Fallo interno') {
            recommendations += `
                    <li><strong style="color: var(--error);">⚠️ ACCIÓN CRÍTICA:</strong> Enviar equipo a servicio técnico autorizado de Hanna Instruments para diagnóstico y reparación. Posible fallo interno detectado.</li>
            `;
        }

        if (!ecValid && data.ecFinalStatus === 'No resuelto') {
            recommendations += `
                    <li><strong style="color: var(--warning);">⚠️ LIMITACIÓN:</strong> Evitar uso del equipo para mediciones de conductividad hasta reparación. El sensor de EC no proporciona lecturas confiables.</li>
            `;
        }

        recommendations += `
                </ul>
            </div>
        `;

        return recommendations;
    },

    /**
     * Generate signature section
     */
    generateSignature(data) {
        return `
            <div class="signature-area">
                <div class="signature-line">
                    <div class="signature-name">${this.escapeHtml(data.technician || 'Técnico Responsable')}</div>
                    <div class="signature-title">Técnico Responsable</div>
                </div>
            </div>
        `;
    },

    /**
     * Get images of a specific type
     * @param {Object} data - Form data
     * @param {string} imageType - Type of image
     * @returns {Array} Array of images
     */
    getImages(data, imageType) {
        if (!data.images || !data.images[imageType]) return [];
        return data.images[imageType];
    },

    /**
     * Get first image of a specific type
     * @param {Object} data - Form data
     * @param {string} imageType - Type of image
     * @returns {Object|null} First image or null
     */
    getFirstImage(data, imageType) {
        const images = this.getImages(data, imageType);
        return images.length > 0 ? images[0] : null;
    },

    /**
     * Format date to readable format
     * @param {string} dateStr - Date string
     * @returns {string} Formatted date
     */
    formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr + 'T00:00:00');
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('es-PE', options);
    },

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

/**
 * Show report preview
 */
function showReportPreview() {
    if (!FormHandler.validateForm()) {
        alert('⚠️ Por favor complete todos los campos obligatorios antes de generar la vista previa.');
        return;
    }

    const formData = FormHandler.getFormData();
    formData.images = ImageHandler.getAllImages();
    
    const reportHTML = ReportGenerator.generateReport(formData);
    
    const previewContainer = document.getElementById('previewContainer');
    const previewContent = document.getElementById('previewContent');
    
    previewContent.innerHTML = reportHTML;
    previewContainer.style.display = 'block';
    
    // Scroll to preview
    previewContainer.scrollIntoView({ behavior: 'smooth' });
    
    console.log('✅ Vista previa generada');
}

/**
 * Hide report preview
 */
function hideReportPreview() {
    const previewContainer = document.getElementById('previewContainer');
    previewContainer.style.display = 'none';
}
