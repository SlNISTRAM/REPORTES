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

            const clientData = [
                ['Razón Social', data.businessName || 'N/A'],
                ['RUC', data.ruc || 'N/A'],
                ['Dirección', data.address || 'N/A'],
                ['Teléfono', data.phone || 'N/A'],
                ['Solicitante', data.contactName || 'N/A'],
                ['Correo Electrónico', data.email || 'N/A']
            ];

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
            checkPageBreak(40);
            this.addSectionTitle(doc, '2. DATOS DEL EQUIPO', yPosition);
            yPosition += 10;

            const equipmentData = [
                ['Marca', data.brand || 'N/A'],
                ['Modelo', data.model || 'N/A'],
                ['Serie', data.serial || 'N/A'],
                ['Estado al Ingreso', data.equipmentStatus || 'N/A'],
                ['Nivel de Batería', data.batteryLevel || 'N/A']
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

            if (data.initialObservations) {
                checkPageBreak(20);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.text('Observaciones Iniciales:', margin, yPosition);
                yPosition += 5;
                doc.setFont('helvetica', 'normal');
                const obsLines = doc.splitTextToSize(data.initialObservations, contentWidth);
                doc.text(obsLines, margin, yPosition);
                yPosition += obsLines.length * 4 + 5;
            }

            // === 3. TRABAJOS REALIZADOS ===
            checkPageBreak(40);
            this.addSectionTitle(doc, '3. TRABAJOS REALIZADOS', yPosition);
            yPosition += 10;

            const workData = [
                ['Sensor de pH', data.phSensorStatus || 'N/A'],
                ['Conductividad (EC)', data.ecSensorStatus || 'N/A'],
                ['Técnico Responsable', data.technician || 'N/A'],
                ['Resultado', data.result || 'N/A']
            ];

            doc.autoTable({
                startY: yPosition,
                head: [['Campo', 'Valor']],
                body: workData,
                theme: 'grid',
                headStyles: { fillColor: [33, 97, 140], textColor: 255, fontStyle: 'bold' },
                margin: { left: margin, right: margin },
                styles: { fontSize: 9 }
            });

            yPosition = doc.lastAutoTable.finalY + 5;

            if (data.technicalComments) {
                checkPageBreak(20);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.text('Comentarios Técnicos:', margin, yPosition);
                yPosition += 5;
                doc.setFont('helvetica', 'normal');
                const commLines = doc.splitTextToSize(data.technicalComments, contentWidth);
                doc.text(commLines, margin, yPosition);
                yPosition += commLines.length * 4 + 5;
            }

            // === 4. LECTURAS Y CALIBRACIÓN ===
            checkPageBreak(60);
            this.addSectionTitle(doc, '4. LECTURAS Y CALIBRACIÓN', yPosition);
            yPosition += 10;

            const calibrationData = [
                ['pH Inicial', data.initialPH || 'N/A', 'pH Post-Calibración', data.calibrationPH || 'N/A'],
                ['EC Inicial (mS/cm)', data.initialEC || 'N/A', 'EC Post-Calibración (mS/cm)', data.calibrationEC || 'N/A'],
                ['pH Final', data.finalPH || 'N/A', 'EC Final (mS/cm)', data.finalEC || 'N/A']
            ];

            doc.autoTable({
                startY: yPosition,
                head: [['Medición', 'Valor', 'Medición', 'Valor']],
                body: calibrationData,
                theme: 'grid',
                headStyles: { fillColor: [33, 97, 140], textColor: 255, fontStyle: 'bold' },
                margin: { left: margin, right: margin },
                styles: { fontSize: 9 }
            });

            yPosition = doc.lastAutoTable.finalY + 5;

            if (data.detectedErrors) {
                checkPageBreak(20);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.text('Errores Detectados:', margin, yPosition);
                yPosition += 5;
                doc.setFont('helvetica', 'normal');
                const errLines = doc.splitTextToSize(data.detectedErrors, contentWidth);
                doc.text(errLines, margin, yPosition);
                yPosition += errLines.length * 4 + 5;
            }

            // === 5. PRESUPUESTO ===
            checkPageBreak(60);
            this.addSectionTitle(doc, '5. PRESUPUESTO', yPosition);
            yPosition += 10;

            const budgetRows = data.budgetItems?.map(item => [
                item.description,
                item.quantity.toString(),
                Calculator.formatCurrency(item.price),
                Calculator.formatCurrency(item.subtotal)
            ]) || [];

            doc.autoTable({
                startY: yPosition,
                head: [['Descripción', 'Cant.', 'Precio Unit.', 'Subtotal']],
                body: budgetRows,
                foot: [
                    ['', '', 'Subtotal:', Calculator.formatCurrency(data.subtotal || 0)],
                    ['', '', 'IGV (18%):', Calculator.formatCurrency(data.igv || 0)],
                    ['', '', 'TOTAL:', Calculator.formatCurrency(data.total || 0)]
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

            // === 6. CONCLUSIONES ===
            checkPageBreak(30);
            this.addSectionTitle(doc, '6. CONCLUSIONES', yPosition);
            yPosition += 8;

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            const conclusions = ReportGenerator.generateAutomaticConclusions(data);
            const conclusionLines = doc.splitTextToSize(conclusions, contentWidth);
            doc.text(conclusionLines, margin, yPosition);
            yPosition += conclusionLines.length * 4 + 10;

            // === 7. RECOMENDACIONES ===
            checkPageBreak(50);
            this.addSectionTitle(doc, '7. RECOMENDACIONES', yPosition);
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

            // === FIRMA ===
            checkPageBreak(30);
            yPosition += 20;
            doc.setLineWidth(0.5);
            doc.line(pageWidth / 2 - 40, yPosition, pageWidth / 2 + 40, yPosition);
            yPosition += 5;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
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
    
    // Show loading state
    const exportBtn = document.getElementById('exportPdfBtn');
    const originalText = exportBtn.innerHTML;
    exportBtn.innerHTML = '⏳ Generando PDF...';
    exportBtn.disabled = true;

    try {
        const success = await PDFExporter.exportToPDF(formData);
        
        if (success) {
            // Save to history
            Storage.saveToHistory(formData);
            
            // Clear draft
            Storage.clearDraft();
            
            alert('✅ PDF generado exitosamente!');
        }
    } finally {
        // Restore button
        exportBtn.innerHTML = originalText;
        exportBtn.disabled = false;
    }
}
