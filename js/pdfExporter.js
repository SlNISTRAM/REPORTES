// ===== PDF Exporter Module =====
// Handles PDF generation using jsPDF

const PDFExporter = {
    /**
     * Export report to PDF
     * @param {Object} data - Form data
     */
    async exportToPDF(data) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Configuration
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pageWidth - (margin * 2);
            let yPosition = margin;

            // Helper function to check page break
            const checkPageBreak = (neededSpace) => {
                if (yPosition + neededSpace > pageHeight - margin) {
                    doc.addPage();
                    yPosition = margin;
                    return true;
                }
                return false;
            };

            // Helper function to add text with word wrap
            const addText = (text, fontSize = 10, isBold = false) => {
                doc.setFontSize(fontSize);
                doc.setFont('helvetica', isBold ? 'bold' : 'normal');
                const lines = doc.splitTextToSize(text, contentWidth);
                const lineHeight = fontSize * 0.5;
                
                checkPageBreak(lines.length * lineHeight);
                doc.text(lines, margin, yPosition);
                yPosition += lines.length * lineHeight;
            };

            // === HEADER ===
            doc.setFillColor(33, 97, 140); // Primary color
            doc.rect(0, 0, pageWidth, 40, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text(`INFORME TÉCNICO N° ${data.reportNumber || 'N/A'}`, pageWidth / 2, 20, { align: 'center' });
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Fecha: ${ReportGenerator.formatDate(data.reportDate)}`, pageWidth / 2, 30, { align: 'center' });
            
            doc.setTextColor(0, 0, 0);
            yPosition = 50;

            // === 1. DATOS DEL CLIENTE ===
            this.addSectionTitle(doc, '1. DATOS DEL CLIENTE', yPosition);
            yPosition += 10;

            const docTypeLabel = data.documentType === 'RUC' ? 'RUC' : 
                                data.documentType === 'DNI' ? 'DNI' : 'CE';
            const clientLabel = data.documentType === 'RUC' ? 'Razón Social' : 'Nombre Completo';
            
            const clientData = [
                [clientLabel, data.clientName || 'N/A'],
                [docTypeLabel, data.documentNumber || 'N/A'],
                ['Dirección', data.address || 'N/A'],
                ['Correo Electrónico', data.email || 'N/A']
            ];
            
            // Add Solicitante only for RUC
            if (data.documentType === 'RUC') {
                clientData.splice(3, 0, ['Solicitante', data.contactName || 'N/A']);
            }

            doc.autoTable({
                startY: yPosition,
                head: [['Campo', 'Valor']],
                body: clientData,
                theme: 'grid',
                headStyles: { fillColor: [33, 97, 140], textColor: 255, fontStyle: 'bold' },
                margin: { left: margin, right: margin },
                styles: { fontSize: 9 }
            });

            yPosition = doc.lastAutoTable.finalY + 10;

            // === 2. DATOS DEL EQUIPO ===
            // Get equipment data (support multiple equipments, take first one for now)
            const equipment = data.equipments && data.equipments.length > 0 ? data.equipments[0] : data;

            checkPageBreak(40);
            this.addSectionTitle(doc, '2. DATOS DEL EQUIPO', yPosition);
            yPosition += 10;

            const equipmentData = [
                ['Marca', equipment.brand || 'N/A'],
                ['Modelo', equipment.model || 'N/A'],
                ['Serie', equipment.serial || 'N/A'],
                ['Estado al Ingreso', equipment.screenStatus || 'N/A'], // Using screen status as proxy for general status if not specific
                ['Nivel de Batería', equipment.batteryLevel || 'N/A']
            ];

            doc.autoTable({
                startY: yPosition,
                head: [['Campo', 'Valor']],
                body: equipmentData,
                theme: 'grid',
                headStyles: { fillColor: [33, 97, 140], textColor: 255, fontStyle: 'bold' },
                margin: { left: margin, right: margin },
                styles: { fontSize: 9 }
            });

            yPosition = doc.lastAutoTable.finalY + 5;

            if (equipment.intakeDescription) {
                checkPageBreak(20);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.text('Observaciones Iniciales:', margin, yPosition);
                yPosition += 5;
                doc.setFont('helvetica', 'normal');
                const obsLines = doc.splitTextToSize(equipment.intakeDescription, contentWidth);
                doc.text(obsLines, margin, yPosition);
                yPosition += obsLines.length * 4 + 5;
            }

            // === 3. TRABAJOS REALIZADOS ===
            checkPageBreak(40);
            this.addSectionTitle(doc, '3. TRABAJOS REALIZADOS', yPosition);
            yPosition += 10;

            const workData = [
                ['Sensor de pH', equipment.phElectrodeStatus || 'N/A'],
                ['Conductividad (EC)', equipment.ecSensorStatus || 'N/A'],
                ['Sensor Temp.', equipment.tempSensorStatus || 'N/A'],
                ['Botones', equipment.buttonsStatus || 'N/A']
            ];

            doc.autoTable({
                startY: yPosition,
                head: [['Componente', 'Estado']],
                body: workData,
                theme: 'grid',
                headStyles: { fillColor: [33, 97, 140], textColor: 255, fontStyle: 'bold' },
                margin: { left: margin, right: margin },
                styles: { fontSize: 9 }
            });

            yPosition = doc.lastAutoTable.finalY + 5;

            if (equipment.comprehensiveComments) {
                checkPageBreak(20);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.text('Comentarios Generales:', margin, yPosition);
                yPosition += 5;
                doc.setFont('helvetica', 'normal');
                const commLines = doc.splitTextToSize(equipment.comprehensiveComments, contentWidth);
                doc.text(commLines, margin, yPosition);
                yPosition += commLines.length * 4 + 5;
            }

            // === 4. LECTURAS Y CALIBRACIÓN ===
            checkPageBreak(60);
            this.addSectionTitle(doc, '4. LECTURAS Y CALIBRACIÓN', yPosition);
            yPosition += 10;

            const calibrationData = [
                ['pH 7.01', equipment.ph701Initial || 'N/A', 'pH 7.01', equipment.ph701Calibration || 'N/A'],
                ['pH 4.01', equipment.ph401Initial || 'N/A', 'pH 4.01', equipment.ph401Calibration || 'N/A'],
                ['EC 12.88', equipment.ecInitial || 'N/A', 'EC 12.88', equipment.ecCalibration || 'N/A'],
                ['Temperatura', `${equipment.temperatureReading || 'N/A'} °C`, '', '']
            ];

            doc.autoTable({
                startY: yPosition,
                head: [['Lectura Inicial', 'Valor', 'Calibración', 'Valor']],
                body: calibrationData,
                theme: 'grid',
                headStyles: { fillColor: [33, 97, 140], textColor: 255, fontStyle: 'bold' },
                margin: { left: margin, right: margin },
                styles: { fontSize: 9 }
            });

            yPosition = doc.lastAutoTable.finalY + 10;

            // === 5. CONCLUSIONES ===
            checkPageBreak(30);
            this.addSectionTitle(doc, '5. CONCLUSIONES', yPosition);
            yPosition += 8;

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            // We pass the equipment object directly to generateAutomaticConclusions if possible, 
            // but ReportGenerator expects the full data object structure in some places. 
            // Let's create a temporary object that mimics the structure expected by ReportGenerator for this specific equipment.
            const tempEquipmentData = { ...data, ...equipment };
            const conclusions = ReportGenerator.generateAutomaticConclusions(tempEquipmentData);
            const conclusionLines = doc.splitTextToSize(conclusions, contentWidth);
            doc.text(conclusionLines, margin, yPosition);
            yPosition += conclusionLines.length * 4 + 10;

            // === 6. RECOMENDACIONES ===
            checkPageBreak(50);
            this.addSectionTitle(doc, '6. RECOMENDACIONES', yPosition);
            yPosition += 8;

            const recommendations = [
                'Mantenimiento Preventivo: Realizar mantenimiento cada 3-6 meses según la frecuencia de uso.',
                'Calibración Periódica: Calibrar el equipo regularmente con soluciones buffer certificadas.',
                'Almacenamiento del Electrodo: Mantener el electrodo de pH en solución de almacenamiento KCl 3M.',
                'Limpieza: Limpiar los electrodos después de cada uso con agua destilada.',
                'Precauciones: Evitar golpes y caídas. No sumergir el equipo más allá del nivel indicado.'
            ];

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            recommendations.forEach(rec => {
                checkPageBreak(10);
                const recLines = doc.splitTextToSize(`• ${rec}`, contentWidth - 5);
                doc.text(recLines, margin + 2, yPosition);
                yPosition += recLines.length * 4 + 2;
            });

            yPosition += 10;

            // === 7. PRESUPUESTO ===
            checkPageBreak(60);
            this.addSectionTitle(doc, '7. PRESUPUESTO', yPosition);
            yPosition += 10;

            const currency = data.currency || 'USD';
            
            const budgetRows = data.budgetItems?.map(item => [
                item.description,
                item.quantity.toString(),
                Calculator.formatCurrency(item.price, currency),
                Calculator.formatCurrency(item.subtotal, currency)
            ]) || [];

            doc.autoTable({
                startY: yPosition,
                head: [['Descripción', 'Cant.', 'Precio Unit.', 'Subtotal']],
                body: budgetRows,
                foot: [
                    ['', '', 'TOTAL:', Calculator.formatCurrency(data.total || 0, currency)]
                ],
                theme: 'grid',
                headStyles: { fillColor: [33, 97, 140], textColor: 255, fontStyle: 'bold' },
                footStyles: { fillColor: [240, 240, 240], fontStyle: 'bold' },
                margin: { left: margin, right: margin },
                styles: { fontSize: 9 },
                columnStyles: {
                    1: { halign: 'center', cellWidth: 20 },
                    2: { halign: 'right', cellWidth: 30 },
                    3: { halign: 'right', cellWidth: 30 }
                }
            });

            yPosition = doc.lastAutoTable.finalY + 5;

            const warrantyText = data.warranty ? '✓ Sujeto a Garantía' : '✗ No sujeto a Garantía';
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(warrantyText, margin, yPosition);
            yPosition += 10;

            // === 8. EVIDENCIAS FOTOGRÁFICAS ===
            const allImages = ImageHandler.getAllImages();
            const hasImages = Object.keys(allImages).some(type => allImages[type].length > 0);
            
            if (hasImages) {
                doc.addPage();
                yPosition = margin;
                this.addSectionTitle(doc, '8. EVIDENCIAS FOTOGRÁFICAS', yPosition);
                yPosition += 10;

                // Helper to add standard grid images
                const addStandardImageGrid = (imageType, customTitle = null) => {
                    const images = allImages[imageType];
                    if (!images || images.length === 0) return;

                    checkPageBreak(15);
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    const title = customTitle || this.getImageTypeLabel(imageType);
                    doc.text(title, margin, yPosition);
                    yPosition += 7;

                    const imageWidth = 80;
                    const imageHeight = 60;
                    const imageSpacing = 10;
                    const imagesPerRow = 2;
                    let imageCount = 0;
                    
                    for (const image of images) {
                        if (imageCount > 0 && imageCount % imagesPerRow === 0) {
                            yPosition += imageHeight + imageSpacing;
                            checkPageBreak(imageHeight + 20);
                        }
                        
                        const xPos = margin + (imageCount % imagesPerRow) * (imageWidth + imageSpacing);
                        
                        try {
                            doc.addImage(image.data, 'JPEG', xPos, yPosition, imageWidth, imageHeight);
                        } catch (error) {
                            console.error(`Error adding image ${image.fileName}:`, error);
                        }
                        imageCount++;
                    }
                    
                    if (imageCount > 0) {
                         yPosition += imageHeight + 10;
                    }
                };

                // Helper to add specific row of images with labels ABOVE
                const addLabeledImageRow = (title, items) => {
                    // items: array of { type: string, label: string }
                    // Filter items that have images
                    const validItems = items.filter(item => allImages[item.type] && allImages[item.type].length > 0);
                    
                    if (validItems.length === 0) return;

                    checkPageBreak(70);
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.text(title, margin, yPosition);
                    yPosition += 8;

                    const rowImageWidth = 55;
                    const rowImageHeight = 55;
                    const spacing = 5;
                    let xPos = margin;

                    validItems.forEach(item => {
                        const img = allImages[item.type][0]; // Take first image
                        
                        // Print Label
                        doc.setFontSize(9);
                        doc.setFont('helvetica', 'bold');
                        doc.text(item.label, xPos + (rowImageWidth/2), yPosition, { align: 'center' });
                        
                        try {
                            // Print Image below label
                            doc.addImage(img.data, 'JPEG', xPos, yPosition + 2, rowImageWidth, rowImageHeight);
                            xPos += rowImageWidth + spacing;
                        } catch (e) {
                            console.error('Error creating image row:', e);
                        }
                    });
                    
                    yPosition += rowImageHeight + 15;
                };

                // 1. INGRESO DEL EQUIPO (First priority)
                addStandardImageGrid('equipment_intake');

                // 2. LECTURAS INICIALES (Row with labels)
                addLabeledImageRow('Lecturas Iniciales', [
                    { type: 'ph_7_01_initial', label: 'pH 7.01' },
                    { type: 'ph_4_01_initial', label: 'pH 4.01' },
                    { type: 'ec_12_88_initial', label: 'EC 12.88' }
                ]);

                // 3. CALIBRACIÓN (Row with labels)
                addLabeledImageRow('Calibración', [
                    { type: 'calibration_ph_7_01', label: 'pH 7.01' },
                    { type: 'calibration_ph_4_01', label: 'pH 4.01' },
                    { type: 'calibration_ec_12_88', label: 'EC 12.88' }
                ]);

                // 4. OTHER IMAGES
                const processedTypes = [
                    'equipment_intake',
                    'ph_7_01_initial', 'ph_4_01_initial', 'ec_12_88_initial',
                    'calibration_ph_7_01', 'calibration_ph_4_01', 'calibration_ec_12_88'
                ];

                const remainingTypes = Object.keys(allImages).filter(type => !processedTypes.includes(type));
                
                for (const imageType of remainingTypes) {
                    addStandardImageGrid(imageType);
                }
            }

            // === 9. FIRMA DEL TÉCNICO RESPONSABLE ===
            // Add signature on a new page or at the end
            checkPageBreak(40);
            yPosition += 20;
            
            doc.setLineWidth(0.5);
            doc.line(pageWidth / 2 - 40, yPosition, pageWidth / 2 + 40, yPosition);
            yPosition += 5;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(data.technician || 'Técnico Responsable', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 5;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text('Técnico Responsable', pageWidth / 2, yPosition, { align: 'center' });

            // === FOOTER (Page numbers) ===
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(128);
                doc.text(
                    `Página ${i} de ${pageCount}`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: 'center' }
                );
            }

            // Save PDF
            const fileName = `Informe_${data.reportNumber || 'TECFRESH'}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

            console.log(`✅ PDF generado: ${fileName}`);
            return true;

        } catch (error) {
            console.error('❌ Error al generar PDF:', error);
            alert('Error al generar el PDF. Por favor intente nuevamente.');
            return false;
        }
    },

    /**
     * Add section title to PDF
     */
    addSectionTitle(doc, title, yPosition) {
        doc.setFillColor(33, 97, 140);
        doc.rect(15, yPosition - 5, doc.internal.pageSize.getWidth() - 30, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 17, yPosition);
        doc.setTextColor(0, 0, 0);
    },

    /**
     * Get human-readable label for image type
     */
    getImageTypeLabel(imageType) {
        const labels = {
            'equipment_intake': 'Ingreso del Equipo',
            'equipment_readings': 'Lecturas del Equipo',
            'calibration': 'Calibración',
            'troubleshooting': 'Resolución de Problemas',
            'final_state': 'Estado Final',
            'ec_post_conditioning': 'EC Post Acondicionamiento',
            'patron_electrode': 'Prueba con Electrodo Patrón'
        };
        return labels[imageType] || imageType;
    },

    /**
     * Truncate text to specified length
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }
};

/**
 * Handle PDF export button click
 */
async function handlePDFExport() {
    if (!FormHandler.validateForm()) {
        alert('⚠️ Por favor complete todos los campos obligatorios antes de exportar.');
        return;
    }

    const formData = FormHandler.getFormData();
    
    // Check if equipment data is present and merge it if necessary
    // EquipmentManager handles the equipment data, so we need to ensure it's included
    if (typeof EquipmentManager !== 'undefined') {
        formData.equipments = EquipmentManager.getAllEquipmentData();
    }
    
    // Add images
    if (typeof ImageHandler !== 'undefined') {
        formData.images = ImageHandler.getAllImages();
    } else {
        formData.images = {};
    }
    
    // Show loading state
    const exportBtn = document.getElementById('exportPdfBtn');
    const originalText = exportBtn.innerHTML;
    exportBtn.innerHTML = '⏳ Generando PDF...';
    exportBtn.disabled = true;

    try {
        const success = await PDFExporter.exportToPDF(formData);
        
        if (success) {
            // Save to history if Storage module exists
            if (typeof Storage !== 'undefined' && Storage.saveToHistory) {
                Storage.saveToHistory(formData);
            }
            
            // Clear draft if Storage module exists
            if (typeof Storage !== 'undefined' && Storage.clearDraft) {
                Storage.clearDraft();
            }
            
            alert('✅ PDF generado exitosamente!');
        }
    } finally {
        // Restore button
        exportBtn.innerHTML = originalText;
        exportBtn.disabled = false;
    }
}
