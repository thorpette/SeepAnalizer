import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

// Configuración de marked para mejor renderizado
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  headerPrefix: 'section-'
});

// CSS profesional para documento imprimible
const documentCSS = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap');
    
    :root {
      --primary-blue: #2563eb;
      --secondary-blue: #1d4ed8;
      --accent-blue: #1e40af;
      --text-primary: #111827;
      --text-secondary: #6b7280;
      --bg-light: #f8fafc;
      --bg-highlight: #eff6ff;
      --border-light: #e2e8f0;
      --border-medium: #d1d5db;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.7;
      color: var(--text-primary);
      font-size: 14px;
      background: white;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20mm;
    }
    
    /* Títulos principales */
    h1 {
      color: var(--primary-blue);
      font-size: 28px;
      font-weight: 700;
      border-bottom: 4px solid var(--primary-blue);
      padding-bottom: 12px;
      margin-bottom: 24px;
      page-break-after: avoid;
    }
    
    h2 {
      color: var(--secondary-blue);
      font-size: 22px;
      font-weight: 600;
      border-bottom: 2px solid var(--border-light);
      padding-bottom: 8px;
      margin-top: 40px;
      margin-bottom: 20px;
      page-break-after: avoid;
    }
    
    h3 {
      color: var(--accent-blue);
      font-size: 18px;
      font-weight: 600;
      margin-top: 32px;
      margin-bottom: 16px;
      page-break-after: avoid;
    }
    
    h4 {
      color: var(--accent-blue);
      font-size: 16px;
      font-weight: 500;
      margin-top: 24px;
      margin-bottom: 12px;
      page-break-after: avoid;
    }
    
    h5, h6 {
      color: var(--text-primary);
      font-size: 14px;
      font-weight: 500;
      margin-top: 20px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }
    
    /* Párrafos y texto */
    p {
      margin-bottom: 16px;
      text-align: justify;
      text-justify: inter-word;
      orphans: 3;
      widows: 3;
    }
    
    /* Listas */
    ul, ol {
      margin: 16px 0;
      padding-left: 24px;
    }
    
    li {
      margin: 8px 0;
      page-break-inside: avoid;
    }
    
    ul li::marker {
      color: var(--primary-blue);
    }
    
    ol li::marker {
      color: var(--primary-blue);
      font-weight: 600;
    }
    
    /* Código */
    code {
      font-family: 'Fira Code', 'Monaco', 'Cascadia Code', monospace;
      background-color: var(--bg-light);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
      border: 1px solid var(--border-light);
    }
    
    pre {
      background-color: var(--bg-light);
      border: 1px solid var(--border-medium);
      border-radius: 8px;
      padding: 16px;
      overflow-x: auto;
      margin: 20px 0;
      font-size: 12px;
      page-break-inside: avoid;
    }
    
    pre code {
      background: none;
      padding: 0;
      border: none;
      font-size: inherit;
    }
    
    /* Citas */
    blockquote {
      border-left: 4px solid var(--primary-blue);
      margin: 20px 0;
      padding: 16px 24px;
      background-color: var(--bg-highlight);
      font-style: italic;
      border-radius: 0 8px 8px 0;
      page-break-inside: avoid;
    }
    
    /* Tablas */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
      font-size: 12px;
      page-break-inside: avoid;
    }
    
    th, td {
      border: 1px solid var(--border-medium);
      padding: 12px 16px;
      text-align: left;
      vertical-align: top;
    }
    
    th {
      background-color: var(--bg-light);
      font-weight: 600;
      color: var(--text-primary);
    }
    
    tr:nth-child(even) td {
      background-color: #fafafa;
    }
    
    /* Enlaces */
    a {
      color: var(--primary-blue);
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: border-color 0.2s;
    }
    
    a:hover {
      border-bottom-color: var(--primary-blue);
    }
    
    /* Elementos especiales */
    .document-header {
      text-align: center;
      margin-bottom: 40px;
      padding: 24px;
      background: linear-gradient(135deg, var(--bg-highlight) 0%, var(--bg-light) 100%);
      border-radius: 12px;
      border: 1px solid var(--border-light);
      page-break-after: avoid;
    }
    
    .document-header h1 {
      border: none;
      margin: 0;
      padding: 0;
      color: var(--primary-blue);
    }
    
    .document-header .subtitle {
      color: var(--text-secondary);
      font-size: 16px;
      margin-top: 8px;
    }
    
    .document-meta {
      background-color: var(--bg-light);
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
      border: 1px solid var(--border-light);
      page-break-inside: avoid;
    }
    
    .document-meta table {
      margin: 0;
      font-size: 13px;
    }
    
    .document-meta td, .document-meta th {
      border: none;
      padding: 6px 0;
    }
    
    .document-meta td:first-child {
      font-weight: 600;
      color: var(--text-secondary);
      width: 150px;
    }
    
    /* Tabla de contenidos */
    .toc {
      background-color: var(--bg-light);
      border: 1px solid var(--border-medium);
      border-radius: 8px;
      padding: 24px;
      margin: 32px 0;
      page-break-inside: avoid;
    }
    
    .toc h2 {
      margin-top: 0;
      margin-bottom: 20px;
      border-bottom: none;
      color: var(--primary-blue);
    }
    
    .toc ul {
      list-style: none;
      padding-left: 0;
    }
    
    .toc li {
      margin: 10px 0;
      padding-left: 20px;
      position: relative;
    }
    
    .toc li::before {
      content: "▶";
      color: var(--primary-blue);
      position: absolute;
      left: 0;
      font-size: 12px;
    }
    
    .toc a {
      color: var(--secondary-blue);
      text-decoration: none;
      font-weight: 500;
    }
    
    .toc a:hover {
      color: var(--primary-blue);
      text-decoration: underline;
    }
    
    /* Secciones especiales */
    .architecture-section {
      background-color: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
      page-break-inside: avoid;
    }
    
    .tech-spec {
      background-color: #fefce8;
      border: 1px solid #facc15;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      page-break-inside: avoid;
    }
    
    .workflow-diagram {
      text-align: center;
      background-color: var(--bg-light);
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      font-family: 'Fira Code', monospace;
      font-size: 12px;
      page-break-inside: avoid;
    }
    
    /* Separadores */
    hr {
      border: none;
      height: 2px;
      background: linear-gradient(to right, transparent, var(--border-medium), transparent);
      margin: 32px 0;
    }
    
    /* Etiquetas y badges */
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background-color: var(--primary-blue);
      color: white;
      border-radius: 16px;
      font-size: 11px;
      font-weight: 500;
      margin: 2px 4px;
    }
    
    .badge.success {
      background-color: #10b981;
    }
    
    .badge.warning {
      background-color: #f59e0b;
    }
    
    .badge.error {
      background-color: #ef4444;
    }
    
    /* Ajustes para impresión */
    @media print {
      body {
        font-size: 12px;
        padding: 15mm;
      }
      
      h1 { font-size: 24px; }
      h2 { font-size: 20px; }
      h3 { font-size: 16px; }
      h4 { font-size: 14px; }
      
      .no-print {
        display: none !important;
      }
      
      .page-break {
        page-break-before: always;
      }
      
      .page-break-after {
        page-break-after: always;
      }
      
      a {
        color: var(--text-primary) !important;
        text-decoration: none !important;
      }
      
      pre, blockquote, table {
        page-break-inside: avoid;
      }
    }
    
    @page {
      margin: 2cm;
      size: A4;
      
      @top-center {
        content: "PageSpeed Analyzer - Documento de Diseño Funcional";
        font-size: 10px;
        color: var(--text-secondary);
        padding-bottom: 5px;
        border-bottom: 1px solid var(--border-light);
      }
      
      @bottom-center {
        content: "Página " counter(page) " de " counter(pages);
        font-size: 10px;
        color: var(--text-secondary);
      }
    }
    
    /* Estilos responsivos */
    @media screen and (max-width: 768px) {
      body {
        padding: 16px;
        font-size: 16px;
      }
      
      h1 { font-size: 24px; }
      h2 { font-size: 20px; }
      h3 { font-size: 18px; }
      
      .document-header {
        padding: 16px;
      }
      
      table {
        font-size: 14px;
      }
      
      pre {
        font-size: 13px;
        overflow-x: scroll;
      }
    }
  </style>
`;

async function generateHTMLDocument() {
  try {
    console.log('🔄 Generando documento HTML del diseño funcional...');
    
    // Leer el archivo markdown
    const markdownPath = path.join(process.cwd(), 'functional-design-document.md');
    const markdownContent = fs.readFileSync(markdownPath, 'utf8');
    
    console.log('📄 Convirtiendo Markdown a HTML...');
    
    // Convertir markdown a HTML
    const htmlContent = marked(markdownContent);
    
    // Agregar metadatos del documento
    const documentHeader = `
      <div class="document-header">
        <h1>Documento de Diseño Funcional</h1>
        <div class="subtitle">PageSpeed Analyzer con Agente Ruby Integrado</div>
      </div>
      
      <div class="document-meta">
        <table>
          <tr>
            <td><strong>Versión:</strong></td>
            <td>1.0</td>
          </tr>
          <tr>
            <td><strong>Fecha:</strong></td>
            <td>29 de Julio, 2025</td>
          </tr>
          <tr>
            <td><strong>Estado:</strong></td>
            <td><span class="badge success">Implementado y Funcional</span></td>
          </tr>
          <tr>
            <td><strong>Tecnologías:</strong></td>
            <td>React, Node.js, PostgreSQL, Ruby, Docker</td>
          </tr>
          <tr>
            <td><strong>Tipo:</strong></td>
            <td>Aplicación Web de Análisis de Rendimiento</td>
          </tr>
        </table>
      </div>
    `;
    
    // Crear HTML completo
    const fullHTML = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="description" content="Documento de diseño funcional completo para PageSpeed Analyzer">
      <meta name="author" content="Sistema de Desarrollo">
      <title>PageSpeed Analyzer - Documento de Diseño Funcional</title>
      ${documentCSS}
    </head>
    <body>
      ${documentHeader}
      ${htmlContent}
      
      <hr class="page-break">
      
      <div class="document-footer" style="text-align: center; margin-top: 40px; padding: 20px; background-color: var(--bg-light); border-radius: 8px;">
        <p><strong>Documento generado automáticamente</strong><br>
        Sistema PageSpeed Analyzer v1.0<br>
        Julio 2025</p>
      </div>
    </body>
    </html>
    `;
    
    console.log('💾 Guardando documento HTML...');
    
    // Guardar el archivo HTML
    const outputPath = path.join(process.cwd(), 'PageSpeed-Analyzer-Diseno-Funcional.html');
    fs.writeFileSync(outputPath, fullHTML, 'utf8');
    
    console.log('✅ Documento HTML generado exitosamente!');
    console.log(`📁 Archivo guardado en: ${outputPath}`);
    console.log(`📊 Tamaño del archivo: ${(Buffer.byteLength(fullHTML, 'utf8') / 1024).toFixed(2)} KB`);
    
    // Crear también una versión para impresión directa
    const printVersion = fullHTML.replace(
      '<body>',
      '<body class="print-ready">'
    );
    
    const printPath = path.join(process.cwd(), 'PageSpeed-Analyzer-Diseno-Funcional-Print.html');
    fs.writeFileSync(printPath, printVersion, 'utf8');
    
    console.log(`📄 Versión para impresión: ${printPath}`);
    
    return { htmlPath: outputPath, printPath };
    
  } catch (error) {
    console.error('❌ Error al generar el documento HTML:', error);
    throw error;
  }
}

// Función adicional para crear PDF usando navegador (si está disponible)
async function createPDFInstructions() {
  const instructions = `
# Instrucciones para Generar PDF

## Método 1: Usando el Navegador (Recomendado)

1. Abre el archivo "PageSpeed-Analyzer-Diseno-Funcional.html" en tu navegador
2. Presiona Ctrl+P (Cmd+P en Mac) para abrir el diálogo de impresión
3. Selecciona "Guardar como PDF" como destino
4. En configuración avanzada:
   - Papel: A4
   - Márgenes: Predeterminados
   - Marcar "Más configuraciones" > "Gráficos de fondo"
5. Haz clic en "Guardar"

## Método 2: Usando herramientas en línea

1. Ve a https://html-pdf-converter.com/ o similar
2. Sube el archivo HTML generado
3. Configura opciones de PDF (A4, márgenes normales)
4. Descarga el PDF resultante

## Método 3: Usando wkhtmltopdf (Linux/Mac)

\`\`\`bash
# Instalar wkhtmltopdf
sudo apt-get install wkhtmltopdf  # Ubuntu/Debian
brew install wkhtmltopdf         # macOS

# Convertir a PDF
wkhtmltopdf --page-size A4 --margin-top 20mm --margin-bottom 20mm --margin-left 15mm --margin-right 15mm PageSpeed-Analyzer-Diseno-Funcional.html PageSpeed-Analyzer-Diseno-Funcional.pdf
\`\`\`

## Método 4: Usando Puppeteer (Para desarrolladores)

\`\`\`javascript
const puppeteer = require('puppeteer');
const fs = require('fs');

async function generatePDF() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const html = fs.readFileSync('PageSpeed-Analyzer-Diseno-Funcional.html', 'utf8');
  
  await page.setContent(html);
  await page.pdf({
    path: 'PageSpeed-Analyzer-Diseno-Funcional.pdf',
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
  });
  
  await browser.close();
}

generatePDF();
\`\`\`

El documento HTML está completamente estilizado y optimizado para conversión a PDF.
`;

  const instructionsPath = path.join(process.cwd(), 'INSTRUCCIONES-PDF.md');
  fs.writeFileSync(instructionsPath, instructions, 'utf8');
  
  return instructionsPath;
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  generateHTMLDocument()
    .then(async (paths) => {
      console.log('\n🎉 ¡Documento HTML generado correctamente!');
      console.log(`📄 Documento principal: ${paths.htmlPath}`);
      console.log(`🖨️  Versión para impresión: ${paths.printPath}`);
      
      const instructionsPath = await createPDFInstructions();
      console.log(`📋 Instrucciones para PDF: ${instructionsPath}`);
      
      console.log('\n💡 Para generar PDF:');
      console.log('   1. Abre el archivo HTML en tu navegador');
      console.log('   2. Usa Ctrl+P > Guardar como PDF');
      console.log('   3. O consulta INSTRUCCIONES-PDF.md para más opciones');
      
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Error fatal:', error.message);
      process.exit(1);
    });
}

export default generateHTMLDocument;