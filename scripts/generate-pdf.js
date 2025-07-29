import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import htmlPdf from 'html-pdf-node';

// Configuración de marked para mejor renderizado
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  headerPrefix: 'section-'
});

// CSS personalizado para el PDF
const customCSS = `
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 100%;
      margin: 0;
      padding: 20px;
      font-size: 12px;
    }
    
    h1 {
      color: #2563eb;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
      font-size: 24px;
      margin-top: 0;
    }
    
    h2 {
      color: #1d4ed8;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
      margin-top: 30px;
      font-size: 20px;
    }
    
    h3 {
      color: #1e40af;
      margin-top: 25px;
      font-size: 16px;
    }
    
    h4 {
      color: #1e3a8a;
      margin-top: 20px;
      font-size: 14px;
    }
    
    h5, h6 {
      color: #1e3a8a;
      margin-top: 15px;
      font-size: 12px;
    }
    
    p {
      margin: 10px 0;
      text-align: justify;
    }
    
    ul, ol {
      margin: 10px 0;
      padding-left: 20px;
    }
    
    li {
      margin: 5px 0;
    }
    
    code {
      background-color: #f3f4f6;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Fira Code', 'Courier New', monospace;
      font-size: 11px;
    }
    
    pre {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px;
      overflow-x: auto;
      margin: 15px 0;
    }
    
    pre code {
      background: none;
      padding: 0;
    }
    
    blockquote {
      border-left: 4px solid #3b82f6;
      margin: 15px 0;
      padding: 10px 20px;
      background-color: #eff6ff;
      font-style: italic;
    }
    
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 15px 0;
      font-size: 11px;
    }
    
    th, td {
      border: 1px solid #d1d5db;
      padding: 8px 12px;
      text-align: left;
    }
    
    th {
      background-color: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    
    .toc {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 20px;
      margin: 20px 0;
    }
    
    .toc h2 {
      margin-top: 0;
      margin-bottom: 15px;
      border-bottom: none;
    }
    
    .toc ul {
      list-style-type: none;
      padding-left: 0;
    }
    
    .toc li {
      margin: 8px 0;
    }
    
    .toc a {
      text-decoration: none;
      color: #2563eb;
    }
    
    .toc a:hover {
      text-decoration: underline;
    }
    
    .page-break {
      page-break-before: always;
    }
    
    .no-break {
      page-break-inside: avoid;
    }
    
    .header-meta {
      background-color: #f1f5f9;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
      font-size: 11px;
    }
    
    .header-meta table {
      margin: 0;
    }
    
    .header-meta td, .header-meta th {
      border: none;
      padding: 5px 0;
    }
    
    /* Estilos específicos para arquitectura */
    .architecture-diagram {
      text-align: center;
      margin: 20px 0;
      padding: 15px;
      background-color: #fafafa;
      border-radius: 6px;
    }
    
    /* Estilos para flujos de trabajo */
    .workflow-step {
      margin: 10px 0;
      padding: 10px;
      background-color: #f0f9ff;
      border-left: 4px solid #0ea5e9;
      border-radius: 0 6px 6px 0;
    }
    
    /* Estilos para especificaciones técnicas */
    .tech-spec {
      background-color: #fefce8;
      border: 1px solid #facc15;
      border-radius: 6px;
      padding: 15px;
      margin: 15px 0;
    }
    
    /* Footer con número de página */
    @page {
      margin: 1cm;
      @bottom-center {
        content: "Página " counter(page) " de " counter(pages);
        font-size: 10px;
        color: #666;
      }
      @top-center {
        content: "PageSpeed Analyzer - Documento de Diseño Funcional";
        font-size: 10px;
        color: #666;
        border-bottom: 1px solid #ccc;
        padding-bottom: 5px;
      }
    }
    
    /* Ajustes para impresión */
    @media print {
      body {
        font-size: 11px;
      }
      
      h1 {
        font-size: 22px;
      }
      
      h2 {
        font-size: 18px;
      }
      
      h3 {
        font-size: 15px;
      }
      
      h4 {
        font-size: 13px;
      }
      
      table {
        font-size: 10px;
      }
      
      pre, code {
        font-size: 10px;
      }
    }
  </style>
`;

async function generatePDF() {
  try {
    console.log('🔄 Generando PDF del documento de diseño funcional...');
    
    // Leer el archivo markdown
    const markdownPath = path.join(process.cwd(), 'functional-design-document.md');
    const markdownContent = fs.readFileSync(markdownPath, 'utf8');
    
    console.log('📄 Convirtiendo Markdown a HTML...');
    
    // Convertir markdown a HTML
    const htmlContent = marked(markdownContent);
    
    // Crear HTML completo con estilos
    const fullHTML = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PageSpeed Analyzer - Documento de Diseño Funcional</title>
      ${customCSS}
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
    `;
    
    console.log('🎨 Aplicando estilos y configurando PDF...');
    
    // Configuración del PDF
    const options = {
      format: 'A4',
      orientation: 'portrait',
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1.5cm',
        left: '1cm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div style="font-size:10px; text-align:center; width:100%; color:#666;">PageSpeed Analyzer - Documento de Diseño Funcional</div>',
      footerTemplate: '<div style="font-size:10px; text-align:center; width:100%; color:#666;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
      preferCSSPageSize: true,
      timeout: 30000
    };
    
    // Generar PDF
    const file = { content: fullHTML };
    
    console.log('🔧 Generando archivo PDF...');
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    // Guardar el archivo
    const outputPath = path.join(process.cwd(), 'PageSpeed-Analyzer-Diseno-Funcional.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log('✅ PDF generado exitosamente!');
    console.log(`📁 Archivo guardado en: ${outputPath}`);
    console.log(`📊 Tamaño del archivo: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    
    return outputPath;
    
  } catch (error) {
    console.error('❌ Error al generar el PDF:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  generatePDF()
    .then(outputPath => {
      console.log('\n🎉 ¡PDF generado correctamente!');
      console.log(`📄 Ubicación: ${outputPath}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Error fatal:', error.message);
      process.exit(1);
    });
}

export default generatePDF;