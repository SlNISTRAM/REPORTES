/**
 * Content Generator Module
 * Generates automatic comments, conclusions, and recommendations based on equipment test results
 */

const ContentGenerator = {
    /**
     * Generate natural equipment intake description
     * @param {Object} equipmentData - Equipment data including brand, model, serial, and inspection status
     * @returns {string} Natural description of equipment intake
     */
    generateEquipmentIntakeDescription(equipmentData) {
        const parts = [];
        
        // Introduction
        const brand = equipmentData.brand || 'Hanna Instruments';
        const model = equipmentData.model || 'HI98130';
        const serial = equipmentData.serial || '[N/S]';
        const electrodeSerial = equipmentData.electrodeSerial || '[N/S]';
        
        parts.push(`Se recibió el equipo ${brand} modelo ${model} con número de serie ${serial}, acompañado del electrodo de pH HI73127 con serie ${electrodeSerial}.`);
        
        // Power status
        if (equipmentData.powerOn) {
            parts.push(`Al momento del ingreso, el equipo encendió correctamente`);
            if (equipmentData.batteryLevel) {
                const batteryDesc = equipmentData.batteryLevel.toLowerCase();
                parts[parts.length - 1] += ` mostrando un nivel de batería ${batteryDesc}`;
            }
            parts[parts.length - 1] += `.`;
        } else {
            parts.push(`El equipo no encendió al momento del ingreso.`);
        }
        
        // Physical condition
        const conditions = [];
        if (equipmentData.screenStatus && equipmentData.screenStatus !== 'Bueno') {
            conditions.push(`pantalla en estado ${equipmentData.screenStatus.toLowerCase()}`);
        }
        if (equipmentData.buttonsStatus && equipmentData.buttonsStatus !== 'Todos funcionan') {
            conditions.push(`botones con ${equipmentData.buttonsStatus.toLowerCase()}`);
        }
        
        if (conditions.length > 0) {
            parts.push(`Se observó ${conditions.join(' y ')}.`);
        }
        
        // Electrode and sensor status
        const sensorIssues = [];
        if (equipmentData.phElectrodeStatus && equipmentData.phElectrodeStatus !== 'Bueno') {
            sensorIssues.push(`el electrodo de pH se encontraba ${equipmentData.phElectrodeStatus.toLowerCase()}`);
        }
        if (equipmentData.ecSensorStatus && equipmentData.ecSensorStatus !== 'Bueno') {
            sensorIssues.push(`el sensor de EC presentaba estado ${equipmentData.ecSensorStatus.toLowerCase()}`);
        }
        
        if (sensorIssues.length > 0) {
            parts.push(`Durante la inspección inicial se detectó que ${sensorIssues.join(' y ')}.`);
        }
        
        // Storage solution
        if (equipmentData.storageSolution === false || equipmentData.storageSolution === 'no') {
            parts.push(`El electrodo de pH no se encontraba hidratado con solución de almacenamiento al momento del ingreso.`);
        } else if (equipmentData.storageSolution === true || equipmentData.storageSolution === 'yes') {
            parts.push(`El electrodo llegó correctamente hidratado con solución de almacenamiento.`);
        }
        
        // Temperature sensor
        if (equipmentData.tempSensorStatus === 'Conforme') {
            parts.push(`El sensor de temperatura se encontró conforme.`);
        } else if (equipmentData.tempSensorStatus === 'No conforme') {
            parts.push(`Se detectó que el sensor de temperatura no se encuentra conforme.`);
        }
        
        return parts.join(' ');
    },

    /**
     * Generate natural description for initial readings
     * @param {Object} equipmentData - Equipment data including readings
     * @returns {string} Natural description of initial readings
     */
    generateInitialReadingsDescription(equipmentData) {
        const parts = [];
        
        // pH readings
        const ph701 = parseFloat(equipmentData.ph701Initial);
        const ph401 = parseFloat(equipmentData.ph401Initial);
        
        if (!isNaN(ph701) && !isNaN(ph401)) {
            const ph701InRange = this.isPhInRange(ph701, 7.01);
            const ph401InRange = this.isPhInRange(ph401, 4.01);
            
            if (ph701InRange && ph401InRange) {
                parts.push(`Las lecturas iniciales de pH mostraron valores de ${ph701} para el buffer de pH 7.01 y ${ph401} para el buffer de pH 4.01, ambos dentro del rango aceptable de ±0.05.`);
            } else if (!ph701InRange && !ph401InRange) {
                parts.push(`Las lecturas iniciales de pH mostraron valores de ${ph701} para el buffer de pH 7.01 y ${ph401} para el buffer de pH 4.01, ambos fuera del rango aceptable de ±0.05, indicando la necesidad de calibración.`);
            } else if (!ph701InRange) {
                parts.push(`La lectura inicial de pH 7.01 mostró un valor de ${ph701}, fuera del rango aceptable, mientras que el pH 4.01 registró ${ph401} dentro del rango esperado.`);
            } else {
                parts.push(`La lectura inicial de pH 4.01 mostró un valor de ${ph401}, fuera del rango aceptable, mientras que el pH 7.01 registró ${ph701} dentro del rango esperado.`);
            }
        }
        
        // EC reading
        const ec = parseFloat(equipmentData.ecInitial);
        if (!isNaN(ec)) {
            const ecInRange = this.isEcInRange(ec);
            if (ecInRange) {
                parts.push(`La conductividad eléctrica (EC) registró ${ec} mS/cm, dentro del margen de precisión del ±2% (12.62 - 13.14 mS/cm).`);
            } else {
                parts.push(`La conductividad eléctrica (EC) registró ${ec} mS/cm, fuera del margen de precisión del ±2%, lo que sugiere la necesidad de acondicionamiento del sensor.`);
            }
        }
        
        // Temperature
        const temp = parseFloat(equipmentData.temperatureReading);
        if (!isNaN(temp)) {
            parts.push(`La temperatura ambiente durante las pruebas fue de ${temp}°C.`);
        }
        
        return parts.join(' ');
    },

    /**
     * Generate natural description for calibration process
     * @param {Object} equipmentData - Equipment data including calibration results
     * @returns {string} Natural description of calibration
     */
    generateCalibrationDescription(equipmentData) {
        const parts = [];
        
        // Cleaning process
        if (equipmentData.cleaningDone) {
            parts.push(`Se realizó el proceso de limpieza del electrodo de pH utilizando solución de limpieza especializada.`);
        }
        
        if (equipmentData.storageSolutionApplied) {
            parts.push(`Se aplicó solución de almacenamiento KCl 3M para mantener el electrodo hidratado.`);
        }
        
        // pH calibration
        const ph701Cal = parseFloat(equipmentData.ph701Calibration);
        const ph401Cal = parseFloat(equipmentData.ph401Calibration);
        
        if (!isNaN(ph701Cal) && !isNaN(ph401Cal)) {
            const ph701InRange = this.isPhInRange(ph701Cal, 7.01);
            const ph401InRange = this.isPhInRange(ph401Cal, 4.01);
            
            if (ph701InRange && ph401InRange) {
                parts.push(`Después de la limpieza, se procedió con la calibración de pH en dos puntos. El equipo calibró exitosamente en ${ph701Cal} para el buffer de pH 7.01 y ${ph401Cal} para el buffer de pH 4.01, ambos valores dentro del rango de precisión requerido.`);
            } else if (ph701InRange && !ph401InRange) {
                parts.push(`La calibración de pH mostró que el equipo logró calibrar en el punto de 7.01 pH con un valor de ${ph701Cal}, sin embargo, no logró calibrar correctamente en el punto de 4.01 pH (${ph401Cal}), lo que indica posibles problemas con el electrodo.`);
            } else if (!ph701InRange && ph401InRange) {
                parts.push(`La calibración de pH mostró que el equipo logró calibrar en el punto de 4.01 pH con un valor de ${ph401Cal}, sin embargo, no logró calibrar correctamente en el punto de 7.01 pH (${ph701Cal}).`);
            } else {
                parts.push(`El equipo no logró calibrar correctamente en ninguno de los dos puntos de pH, registrando ${ph701Cal} para pH 7.01 y ${ph401Cal} para pH 4.01, ambos fuera del rango aceptable.`);
            }
        }
        
        // EC calibration
        const ecCal = parseFloat(equipmentData.ecCalibration);
        if (!isNaN(ecCal)) {
            const ecInRange = this.isEcInRange(ecCal);
            if (ecInRange) {
                parts.push(`La calibración de conductividad eléctrica (EC) fue exitosa, registrando ${ecCal} mS/cm dentro del margen de precisión del ±2%.`);
            } else {
                parts.push(`La calibración de conductividad eléctrica (EC) registró ${ecCal} mS/cm, fuera del margen de precisión, lo que requiere troubleshooting adicional.`);
            }
        }
        
        return parts.join(' ');
    },

    /**
     * Generate natural description for troubleshooting/maintenance
     * @param {Object} equipmentData - Equipment data including troubleshooting info
     * @returns {string} Natural description of troubleshooting
     */
    generateTroubleshootingDescription(equipmentData) {
        const parts = [];
        
        // EC troubleshooting
        if (equipmentData.ecConditioningDone) {
            parts.push(`Se realizó el acondicionamiento del sensor de conductividad eléctrica, dejándolo sumergido en solución de calibración durante 1 hora.`);
            
            const ecPost = parseFloat(equipmentData.ecPostConditioning);
            if (!isNaN(ecPost)) {
                const ecInRange = this.isEcInRange(ecPost);
                if (ecInRange) {
                    parts.push(`Después del acondicionamiento, la lectura de EC mejoró a ${ecPost} mS/cm, dentro del rango aceptable.`);
                } else {
                    parts.push(`Después del acondicionamiento, la lectura de EC fue de ${ecPost} mS/cm, sin lograr entrar en el rango de precisión requerido.`);
                }
            }
            
            if (equipmentData.ecFinalStatus) {
                if (equipmentData.ecFinalStatus === 'Resuelto') {
                    parts.push(`El problema de conductividad fue resuelto satisfactoriamente.`);
                } else {
                    parts.push(`El problema de conductividad no pudo ser resuelto, indicando posible daño en el sensor.`);
                }
            }
        }
        
        // pH troubleshooting
        if (equipmentData.patronElectrodeTested) {
            parts.push(`Se realizó prueba con electrodo patrón de pH para determinar si el problema era del electrodo o del equipo.`);
            
            const ph701Patron = parseFloat(equipmentData.ph701Patron);
            const ph401Patron = parseFloat(equipmentData.ph401Patron);
            
            if (!isNaN(ph701Patron) && !isNaN(ph401Patron)) {
                const ph701InRange = this.isPhInRange(ph701Patron, 7.01);
                const ph401InRange = this.isPhInRange(ph401Patron, 4.01);
                
                if (ph701InRange && ph401InRange) {
                    parts.push(`Con el electrodo patrón, el equipo calibró correctamente en ambos puntos (${ph701Patron} y ${ph401Patron}), confirmando que el electrodo original requiere reemplazo.`);
                } else if (ph701InRange && !ph401InRange) {
                    parts.push(`Con el electrodo patrón, el equipo solo logró calibrar en el punto de 7.01 pH (${ph701Patron}), lo que indica un posible fallo interno del equipo.`);
                } else {
                    parts.push(`Incluso con el electrodo patrón, el equipo no logró calibrar correctamente, indicando un fallo interno del equipo que requiere servicio técnico especializado.`);
                }
            }
        }
        
        if (equipmentData.phJuntaAdjusted) {
            parts.push(`Se realizó el ajuste de la junta de tela del electrodo de pH como parte del proceso de troubleshooting.`);
        }
        
        return parts.join(' ');
    },

    /**
     * Generate comprehensive comments covering all procedures
     * @param {Object} equipmentData - Complete equipment data
     * @returns {string} Comprehensive comments about all procedures
     */
    generateComprehensiveComments(equipmentData) {
        const sections = [];
        
        // === LECTURAS INICIALES ===
        const ph701 = parseFloat(equipmentData.ph701Initial);
        const ph401 = parseFloat(equipmentData.ph401Initial);
        const ec = parseFloat(equipmentData.ecInitial);
        
        if (!isNaN(ph701) && !isNaN(ph401)) {
            const ph701InRange = this.isPhInRange(ph701, 7.01);
            const ph401InRange = this.isPhInRange(ph401, 4.01);
            
            let readingsText = "**Lecturas Iniciales:** ";
            if (ph701InRange && ph401InRange) {
                readingsText += `Las lecturas de pH mostraron valores de ${ph701} (pH 7.01) y ${ph401} (pH 4.01), ambos dentro del rango aceptable de ±0.05.`;
            } else {
                readingsText += `Las lecturas de pH mostraron valores de ${ph701} (pH 7.01) y ${ph401} (pH 4.01), ${!ph701InRange || !ph401InRange ? 'fuera del rango aceptable, indicando la necesidad de calibración' : ''}.`;
            }
            
            if (!isNaN(ec)) {
                const ecInRange = this.isEcInRange(ec);
                readingsText += ` La conductividad eléctrica registró ${ec} mS/cm, ${ecInRange ? 'dentro' : 'fuera'} del margen de precisión del ±2%.`;
            }
            
            sections.push(readingsText);
        }
        
        // === LIMPIEZA Y CALIBRACIÓN ===
        const ph701Cal = parseFloat(equipmentData.ph701Calibration);
        const ph401Cal = parseFloat(equipmentData.ph401Calibration);
        const ecCal = parseFloat(equipmentData.ecCalibration);
        
        if (!isNaN(ph701Cal) && !isNaN(ph401Cal)) {
            let calibrationText = "**Proceso de Calibración:** ";
            
            if (equipmentData.cleaningDone) {
                calibrationText += "Se realizó la limpieza del electrodo de pH con solución especializada. ";
            }
            
            const ph701CalInRange = this.isPhInRange(ph701Cal, 7.01);
            const ph401CalInRange = this.isPhInRange(ph401Cal, 4.01);
            
            if (ph701CalInRange && ph401CalInRange) {
                calibrationText += `El equipo calibró exitosamente en ambos puntos de pH (${ph701Cal} y ${ph401Cal}), dentro del rango de precisión requerido.`;
            } else if (ph701CalInRange && !ph401CalInRange) {
                calibrationText += `El equipo logró calibrar en el punto de 7.01 pH (${ph701Cal}), pero no en el punto de 4.01 pH (${ph401Cal}), indicando posibles problemas con el electrodo.`;
            } else {
                calibrationText += `El equipo presentó dificultades en la calibración de pH.`;
            }
            
            if (!isNaN(ecCal)) {
                const ecCalInRange = this.isEcInRange(ecCal);
                calibrationText += ` La calibración de EC registró ${ecCal} mS/cm, ${ecCalInRange ? 'dentro del margen aceptable' : 'requiriendo troubleshooting adicional'}.`;
            }
            
            sections.push(calibrationText);
        }
        
        // === TROUBLESHOOTING/MANTENIMIENTO ===
        const troubleshootingParts = [];
        
        if (equipmentData.ecConditioningDone) {
            const ecPost = parseFloat(equipmentData.ecPostConditioning);
            let ecText = "**Acondicionamiento de EC:** Se realizó el acondicionamiento del sensor de conductividad durante 1 hora.";
            
            if (!isNaN(ecPost)) {
                const ecInRange = this.isEcInRange(ecPost);
                ecText += ` Después del acondicionamiento, la lectura ${ecInRange ? 'mejoró a' : 'fue de'} ${ecPost} mS/cm${ecInRange ? ', dentro del rango aceptable' : ', sin lograr entrar en el rango de precisión'}.`;
            }
            
            troubleshootingParts.push(ecText);
        }
        
        if (equipmentData.patronElectrodeTested) {
            const ph701Patron = parseFloat(equipmentData.ph701Patron);
            const ph401Patron = parseFloat(equipmentData.ph401Patron);
            
            let patronText = "**Prueba con Electrodo Patrón:** Se realizó prueba con electrodo patrón de pH.";
            
            if (!isNaN(ph701Patron) && !isNaN(ph401Patron)) {
                const ph701InRange = this.isPhInRange(ph701Patron, 7.01);
                const ph401InRange = this.isPhInRange(ph401Patron, 4.01);
                
                if (ph701InRange && ph401InRange) {
                    patronText += ` El equipo calibró correctamente con el electrodo patrón (${ph701Patron} y ${ph401Patron}), confirmando que el electrodo original requiere reemplazo.`;
                } else {
                    patronText += ` El equipo no logró calibrar correctamente incluso con electrodo patrón, indicando un posible fallo interno.`;
                }
            }
            
            troubleshootingParts.push(patronText);
        }
        
        if (troubleshootingParts.length > 0) {
            sections.push(troubleshootingParts.join(' '));
        }
        
        // === CONCLUSIÓN ===
        if (equipmentData.storageSolutionApplied) {
            sections.push("**Mantenimiento:** Se aplicó solución de almacenamiento KCl 3M para mantener el electrodo hidratado.");
        }
        
        return sections.join('\n\n');
    },

    /**
     * Generate comments for equipment based on test results
     * @param {Object} equipmentData - Equipment data including readings and status
     * @returns {string} Generated comments
     */
    generateComments(equipmentData) {

        const comments = [];
        
        // Check initial pH readings
        const ph701Initial = parseFloat(equipmentData.ph701Initial);
        const ph401Initial = parseFloat(equipmentData.ph401Initial);
        const ph701InRange = this.isPhInRange(ph701Initial, 7.01);
        const ph401InRange = this.isPhInRange(ph401Initial, 4.01);
        
        // Check initial EC reading
        const ecInitial = parseFloat(equipmentData.ecInitial);
        const ecInRange = this.isEcInRange(ecInitial);
        
        // Comment on initial state
        if (!ph701InRange || !ph401InRange) {
            comments.push("Durante la inspección inicial se observó que el electrodo de pH se encontraba con restos de impureza y roto.");
        }
        
        if (!ecInRange) {
            comments.push("El electrodo de pH no se encontraba hidratado con solución de almacenamiento al momento del ingreso. Se realizó el proceso de limpieza.");
        }
        
        // Comment on calibration
        const ph701Cal = parseFloat(equipmentData.ph701Calibration);
        const ph401Cal = parseFloat(equipmentData.ph401Calibration);
        const ecCal = parseFloat(equipmentData.ecCalibration);
        
        const ph701CalInRange = this.isPhInRange(ph701Cal, 7.01);
        const ph401CalInRange = this.isPhInRange(ph401Cal, 4.01);
        const ecCalInRange = this.isEcInRange(ecCal);
        
        if (ph701CalInRange && ph401CalInRange && ecCalInRange) {
            comments.push("Después de la limpieza y calibración, el equipo logró calibrar en el punto de 7.01 pH.");
        }
        
        // EC specific comments
        if (ecCalInRange) {
            comments.push("El equipo se encuentra operativo para lecturas de EC.");
            comments.push("Muestra 100% de batería.");
        } else if (equipmentData.ecTroubleshooting) {
            if (equipmentData.ecFinalStatus === 'Resuelto') {
                comments.push("Después del acondicionamiento del sensor de EC, el equipo logró lecturas correctas.");
            } else {
                comments.push("El sensor de EC no logró tomar lecturas confiables incluso después del acondicionamiento.");
            }
        }
        
        // pH troubleshooting comments
        if (equipmentData.phTroubleshooting) {
            if (equipmentData.phFinalStatus === 'Resuelto') {
                comments.push("Pudo haber algún daño menor al utilizar el equipo con un electrodo sin o-ring.");
            } else if (equipmentData.phFinalStatus === 'Requiere electrodo nuevo') {
                comments.push("En cuanto a la conductividad (EC), inicialmente el equipo mostró lecturas superiores al margen de error establecido (±2% de valor de la lectura). Posteriormente, se realizó el acondicionamiento (dejando el sensor sumergido en solución de calibración durante 1 hora), sin embargo, la lectura no mejoró.");
                comments.push("Posteriormente, se realizó la calibración con un electrodo patrón de pH, con el cual el equipo solo logra calibrar en el punto de 7.01 pH.");
            } else if (equipmentData.phFinalStatus === 'Fallo interno') {
                comments.push("El equipo no logra calibrar incluso con electrodo patrón, lo que indica un posible fallo interno del equipo.");
            }
        }
        
        // Temperature sensor
        if (equipmentData.tempSensorStatus === 'Conforme') {
            comments.push("El sensor de temperatura se encuentra conforme.");
        }
        
        // Storage solution
        if (!equipmentData.storageSolution) {
            comments.push("Evitar exponer el equipo a temperaturas extremas y condiciones adversas que puedan afectar su funcionamiento como la luz directa del sol.");
        }
        
        return comments.join('\n\n');
    },
    
    /**
     * Generate conclusions based on equipment status
     * @param {Object} equipmentData - Equipment data
     * @returns {Array} Array of conclusion strings
     */
    generateConclusions(equipmentData) {
        const conclusions = [];
        
        const ph701Cal = parseFloat(equipmentData.ph701Calibration);
        const ph401Cal = parseFloat(equipmentData.ph401Calibration);
        const ecCal = parseFloat(equipmentData.ecCalibration);
        
        const ph701CalInRange = this.isPhInRange(ph701Cal, 7.01);
        const ph401CalInRange = this.isPhInRange(ph401Cal, 4.01);
        const ecCalInRange = this.isEcInRange(ecCal);
        
        // Main conclusion about pH
        if (ph701CalInRange && !ph401CalInRange) {
            conclusions.push("El equipo se encuentra operativo para lecturas de EC.");
            conclusions.push("El electrodo de pH se encuentra roto e inoperativo.");
            conclusions.push("Al utilizar un electrodo nuevo el pH del equipo solo logra calibrar en el punto de 7.01 pH.");
        } else if (ph701CalInRange && ph401CalInRange) {
            conclusions.push("El equipo se encuentra operativo para lecturas de EC.");
            if (equipmentData.phTroubleshooting && equipmentData.phFinalStatus === 'Requiere electrodo nuevo') {
                conclusions.push("El electrodo de pH requiere reemplazo.");
            } else {
                conclusions.push("El equipo se encuentra operativo para lecturas de pH.");
            }
        } else {
            conclusions.push("El equipo no se encuentra operativo para lecturas de pH.");
        }
        
        // EC conclusion
        if (!ecCalInRange) {
            if (equipmentData.ecFinalStatus === 'No resuelto') {
                conclusions.push("El equipo no logra tomar lecturas confiables de EC.");
            }
        }
        
        return conclusions;
    },
    
    /**
     * Generate recommendations based on equipment issues
     * @param {Object} equipmentData - Equipment data
     * @returns {Array} Array of recommendation strings
     */
    generateRecommendations(equipmentData) {
        const recommendations = [];
        
        const ph701Cal = parseFloat(equipmentData.ph701Calibration);
        const ph401Cal = parseFloat(equipmentData.ph401Calibration);
        const ecCal = parseFloat(equipmentData.ecCalibration);
        
        const ph701CalInRange = this.isPhInRange(ph701Cal, 7.01);
        const ph401CalInRange = this.isPhInRange(ph401Cal, 4.01);
        const ecCalInRange = this.isEcInRange(ecCal);
        
        // pH electrode recommendations
        if (!ph401CalInRange || (equipmentData.phFinalStatus === 'Requiere electrodo nuevo')) {
            recommendations.push("Se recomienda reemplazar el equipo o, en su defecto, adquirir un nuevo electrodo de pH, considerando que actualmente solo es posible obtener lecturas confiables en valores cercanos al punto de 7.01 pH.");
            recommendations.push("Debido a las condiciones en las que se encontraba el equipo, debe ser verificado constantemente para asegurar su correcto desempeño.");
        }
        
        // General maintenance
        if (ph701CalInRange && ph401CalInRange && ecCalInRange) {
            recommendations.push("Siempre mantener el electrodo de pH hidratado con solución de almacenamiento cuando no esté en uso.");
        }
        
        recommendations.push("Limpiar equipo después de cada jornada de uso.");
        
        // Storage recommendations
        if (!equipmentData.storageSolution) {
            recommendations.push("Evitar exponer el equipo a temperaturas extremas y condiciones adversas que puedan afectar su funcionamiento como la luz directa del sol.");
        }
        
        return recommendations;
    },
    
    /**
     * Check if pH reading is within acceptable range
     * @param {number} reading - pH reading
     * @param {number} target - Target pH value (4.01 or 7.01)
     * @returns {boolean} True if within range
     */
    isPhInRange(reading, target) {
        const margin = 0.05;
        return reading >= (target - margin) && reading <= (target + margin);
    },
    
    /**
     * Check if EC reading is within acceptable range
     * @param {number} reading - EC reading in mS/cm
     * @returns {boolean} True if within range
     */
    isEcInRange(reading) {
        const target = 12.88;
        const margin = target * 0.02; // 2%
        return reading >= (target - margin) && reading <= (target + margin);
    },
    
    /**
     * Generate complete analysis for an equipment
     * @param {Object} equipmentData - Equipment data
     * @returns {Object} Object with comments, conclusions, and recommendations
     */
    generateCompleteAnalysis(equipmentData) {
        return {
            comments: this.generateComments(equipmentData),
            conclusions: this.generateConclusions(equipmentData),
            recommendations: this.generateRecommendations(equipmentData)
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentGenerator;
}
