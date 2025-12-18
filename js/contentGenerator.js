/**
 * Content Generator Module
 * Generates automatic comments, conclusions, and recommendations based on equipment test results
 */

const ContentGenerator = {
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
