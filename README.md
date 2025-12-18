# 📋 TECFRESH - Generador de Informes Técnicos

Sistema web para generar automáticamente informes técnicos de evaluación y calibración de equipos de medición (pH y Conductividad).

## 🎯 Características

✅ **Formularios Intuitivos**: Interfaz clara y organizada por secciones  
✅ **Validación en Tiempo Real**: Verificación automática de campos obligatorios  
✅ **Cálculos Automáticos**: Subtotales, IGV (18%) y totales calculados automáticamente  
✅ **Vista Previa**: Visualiza el informe antes de exportar  
✅ **Exportación a PDF**: Genera PDFs profesionales con formato corporativo  
✅ **Guardado Automático**: Auto-guardado cada 30 segundos  
✅ **Gestión de Borradores**: Guarda y recupera borradores de informes  
✅ **Diseño Responsive**: Funciona en desktop, tablet y móvil  
✅ **Sin Backend**: Funciona completamente en el navegador

## 🚀 Inicio Rápido

### Opción 1: Abrir Directamente

1. Navega a la carpeta del proyecto
2. Abre el archivo `index.html` en tu navegador
3. ¡Listo! La aplicación está funcionando

### Opción 2: Servidor Local (Recomendado)

Si tienes Python instalado:

```bash
# Python 3
python -m http.server 8000

# Luego abre en el navegador:
# http://localhost:8000
```

Si tienes Node.js instalado:

```bash
# Instalar servidor simple
npm install -g http-server

# Ejecutar
http-server

# Luego abre en el navegador:
# http://localhost:8080
```

## 📁 Estructura del Proyecto

```
TECFRESH/
├── index.html              # Página principal
├── css/
│   ├── variables.css       # Variables de diseño (colores, espaciados)
│   ├── base.css           # Estilos base y reset
│   ├── components.css     # Componentes (formularios, botones, etc.)
│   └── print.css          # Estilos para impresión
├── js/
│   ├── app.js             # Inicialización de la aplicación
│   ├── storage.js         # Gestión de localStorage
│   ├── calculator.js      # Cálculos de presupuesto
│   ├── formHandler.js     # Manejo de formularios
│   ├── reportGenerator.js # Generación de informes HTML
│   └── pdfExporter.js     # Exportación a PDF
└── README.md              # Este archivo
```

## 📝 Uso de la Aplicación

### 1. Completar el Formulario

El formulario está dividido en 6 secciones:

1. **Encabezado del Informe**: Número de informe y fecha
2. **Datos del Cliente**: Razón social, RUC, dirección, contacto
3. **Datos del Equipo**: Marca, modelo, serie, estado
4. **Trabajos Realizados**: Estado de sensores, comentarios técnicos
5. **Lecturas y Calibración**: Mediciones de pH y EC
6. **Presupuesto**: Servicios y repuestos con cálculo automático

### 2. Agregar Ítems de Presupuesto

- Haz clic en "➕ Agregar Ítem" para añadir servicios o repuestos
- Los subtotales se calculan automáticamente
- El IGV (18%) y total se actualizan en tiempo real
- Puedes eliminar ítems con el botón "🗑️ Eliminar"

### 3. Guardar Borrador

- **Manual**: Haz clic en "💾 Guardar Borrador"
- **Automático**: Se guarda cada 30 segundos automáticamente
- **Atajo**: Presiona `Ctrl + S` (Windows/Linux) o `Cmd + S` (Mac)

### 4. Vista Previa

- Haz clic en "👁️ Vista Previa" para ver el informe formateado
- Verifica que toda la información sea correcta
- **Atajo**: Presiona `Ctrl + P` o `Cmd + P`

### 5. Exportar a PDF

- Haz clic en "📄 Exportar PDF"
- El PDF se descargará automáticamente
- Nombre del archivo: `Informe_[NÚMERO]_[FECHA].pdf`

## 🔧 Funcionalidades Técnicas

### Validación de Campos

- **RUC**: Debe tener exactamente 11 dígitos
- **Email**: Formato válido de correo electrónico
- **Campos numéricos**: Solo acepta números positivos
- **Campos obligatorios**: Marcados con asterisco (\*)

### Cálculos Automáticos

```javascript
Subtotal = Suma de (Cantidad × Precio Unitario)
IGV = Subtotal × 18%
Total = Subtotal + IGV
```

### Almacenamiento Local

- Los borradores se guardan en `localStorage` del navegador
- Los datos persisten incluso si cierras el navegador
- Historial de hasta 50 informes generados

### Generación de PDF

- Formato A4 profesional
- Encabezado con colores corporativos
- Tablas formateadas con jsPDF-AutoTable
- Saltos de página automáticos
- Numeración de páginas
- Área de firma

## 🎨 Personalización

### Cambiar Colores Corporativos

Edita `css/variables.css`:

```css
:root {
  --primary-500: hsl(210, 100%, 45%); /* Color principal */
  --secondary-600: hsl(200, 20%, 30%); /* Color secundario */
}
```

### Modificar IGV

Edita `js/calculator.js`:

```javascript
const igv = subtotal * 0.18; // Cambiar 0.18 por el porcentaje deseado
```

### Personalizar Recomendaciones

Edita `js/reportGenerator.js` en la función `generateRecommendations()`.

## 🌐 Compatibilidad

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+
- ✅ Opera 76+

## 📱 Responsive

La aplicación se adapta a:

- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Pantallas grandes (1440px+)

## 🔒 Privacidad y Seguridad

- ✅ **Sin servidor**: Todos los datos se procesan localmente
- ✅ **Sin envío de datos**: Ninguna información sale de tu navegador
- ✅ **Control total**: Tú decides cuándo guardar o eliminar datos
- ✅ **Offline**: Funciona sin conexión a internet

## ⌨️ Atajos de Teclado

- `Ctrl/Cmd + S`: Guardar borrador
- `Ctrl/Cmd + P`: Vista previa

## 🐛 Solución de Problemas

### El PDF no se genera

1. Verifica que todos los campos obligatorios estén completos
2. Asegúrate de tener una conexión a internet (para cargar jsPDF desde CDN)
3. Intenta con otro navegador

### Los datos no se guardan

1. Verifica que el navegador permita localStorage
2. Comprueba que no estés en modo incógnito/privado
3. Limpia la caché del navegador

### El formulario no se carga

1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Verifica que todos los archivos CSS y JS estén presentes

## 📚 Librerías Utilizadas

- [jsPDF](https://github.com/parallax/jsPDF) - Generación de PDFs
- [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) - Tablas en PDF
- [Google Fonts](https://fonts.google.com/) - Tipografías (Inter, Roboto)

## 🚀 Próximas Mejoras (Opcional)

- [ ] Firma digital con canvas
- [ ] Adjuntar fotos del equipo
- [ ] Exportar a Word (.docx)
- [ ] Plantillas personalizables
- [ ] Backend para múltiples usuarios
- [ ] Dashboard con estadísticas
- [ ] Envío automático por email

## 📄 Licencia

Este proyecto es de uso libre para TECFRESH.

## 👨‍💻 Soporte

Para soporte o consultas, contacta al equipo de desarrollo.

---

**Versión**: 1.0  
**Última actualización**: Diciembre 2024  
**Desarrollado para**: TECFRESH
