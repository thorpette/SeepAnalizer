import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar marked para mejor parsing
marked.setOptions({
  gfm: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
});

// CSS profesional para el manual de usuario
const userManualCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap');
  
  :root {
    --primary-color: #1f2937;
    --secondary-color: #3b82f6;
    --accent-color: #10b981;
    --danger-color: #ef4444;
    --warning-color: #f59e0b;
    --success-color: #22c55e;
    --background-color: #ffffff;
    --surface-color: #f8fafc;
    --border-color: #e2e8f0;
    --text-primary: #111827;
    --text-secondary: #6b7280;
    --text-muted: #9ca3af;
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
    color: var(--text-primary);
    background: var(--background-color);
    font-size: 14px;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }
  
  /* Header */
  .manual-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 3rem 0;
    text-align: center;
    margin-bottom: 0;
  }
  
  .manual-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .manual-subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    margin-bottom: 1rem;
  }
  
  .manual-meta {
    display: flex;
    justify-content: center;
    gap: 2rem;
    font-size: 0.9rem;
    opacity: 0.8;
    flex-wrap: wrap;
  }
  
  /* Table of Contents */
  .toc {
    background: var(--surface-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 2rem;
    margin: 2rem 0;
  }
  
  .toc h2 {
    color: var(--primary-color);
    margin-bottom: 1rem;
    font-size: 1.3rem;
    border-bottom: 2px solid var(--secondary-color);
    padding-bottom: 0.5rem;
  }
  
  .toc ol {
    list-style: none;
    counter-reset: section;
  }
  
  .toc li {
    counter-increment: section;
    margin: 0.5rem 0;
  }
  
  .toc li::before {
    content: counter(section) ". ";
    color: var(--secondary-color);
    font-weight: 600;
  }
  
  .toc a {
    color: var(--text-primary);
    text-decoration: none;
    transition: color 0.2s;
  }
  
  .toc a:hover {
    color: var(--secondary-color);
  }
  
  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.3;
    margin-top: 2rem;
    margin-bottom: 1rem;
    color: var(--primary-color);
  }
  
  h1 {
    font-size: 2.5rem;
    border-bottom: 3px solid var(--secondary-color);
    padding-bottom: 0.5rem;
    margin-top: 3rem;
  }
  
  h2 {
    font-size: 1.8rem;
    color: var(--secondary-color);
    border-left: 4px solid var(--secondary-color);
    padding-left: 1rem;
    margin-top: 2.5rem;
  }
  
  h3 {
    font-size: 1.4rem;
    color: var(--primary-color);
    margin-top: 2rem;
  }
  
  h4 {
    font-size: 1.2rem;
    color: var(--accent-color);
    margin-top: 1.5rem;
  }
  
  h5 {
    font-size: 1.1rem;
    color: var(--text-primary);
    margin-top: 1rem;
  }
  
  p {
    margin-bottom: 1rem;
    line-height: 1.7;
  }
  
  /* Lists */
  ul, ol {
    margin-left: 2rem;
    margin-bottom: 1rem;
  }
  
  li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }
  
  /* Emphasis and inline elements */
  strong, **bold** {
    font-weight: 600;
    color: var(--primary-color);
  }
  
  em {
    font-style: italic;
    color: var(--text-secondary);
  }
  
  /* Code */
  code {
    font-family: 'Fira Code', monospace;
    background: var(--surface-color);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 0.2rem 0.4rem;
    font-size: 0.9em;
    color: var(--primary-color);
  }
  
  pre {
    background: var(--primary-color);
    color: #e2e8f0;
    border-radius: 8px;
    padding: 1.5rem;
    margin: 1.5rem 0;
    overflow-x: auto;
    line-height: 1.5;
  }
  
  pre code {
    background: none;
    border: none;
    padding: 0;
    color: inherit;
    font-size: 0.9rem;
  }
  
  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }
  
  th {
    background: var(--surface-color);
    font-weight: 600;
    color: var(--primary-color);
  }
  
  tr:hover {
    background: var(--surface-color);
  }
  
  /* Alert boxes */
  .alert {
    padding: 1rem 1.5rem;
    border-radius: 8px;
    margin: 1.5rem 0;
    border-left: 4px solid;
  }
  
  .alert-info {
    background: #eff6ff;
    border-color: var(--secondary-color);
    color: #1e40af;
  }
  
  .alert-success {
    background: #f0fdf4;
    border-color: var(--success-color);
    color: #166534;
  }
  
  .alert-warning {
    background: #fffbeb;
    border-color: var(--warning-color);
    color: #92400e;
  }
  
  .alert-danger {
    background: #fef2f2;
    border-color: var(--danger-color);
    color: #991b1b;
  }
  
  /* Status indicators */
  .status {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.8rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .status-excellent {
    background: #dcfce7;
    color: #166534;
  }
  
  .status-good {
    background: #dbeafe;
    color: #1e40af;
  }
  
  .status-needs-improvement {
    background: #fef3c7;
    color: #92400e;
  }
  
  .status-poor {
    background: #fee2e2;
    color: #991b1b;
  }
  
  /* Metrics visualization */
  .metric-card {
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1.5rem;
    margin: 1rem 0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  
  .metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .metric-name {
    font-weight: 600;
    color: var(--primary-color);
  }
  
  .metric-value {
    font-size: 1.2rem;
    font-weight: 700;
  }
  
  /* Progress indicators */
  .progress-bar {
    background: var(--border-color);
    border-radius: 4px;
    height: 8px;
    margin: 0.5rem 0;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s ease;
  }
  
  .progress-excellent {
    background: var(--success-color);
  }
  
  .progress-good {
    background: var(--secondary-color);
  }
  
  .progress-warning {
    background: var(--warning-color);
  }
  
  .progress-poor {
    background: var(--danger-color);
  }
  
  /* Blockquotes */
  blockquote {
    border-left: 4px solid var(--secondary-color);
    background: var(--surface-color);
    padding: 1rem 1.5rem;
    margin: 1.5rem 0;
    font-style: italic;
    color: var(--text-secondary);
  }
  
  /* Links */
  a {
    color: var(--secondary-color);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;
  }
  
  a:hover {
    border-bottom-color: var(--secondary-color);
  }
  
  /* Section dividers */
  hr {
    border: none;
    height: 2px;
    background: linear-gradient(to right, var(--secondary-color), transparent);
    margin: 3rem 0;
  }
  
  /* Footer */
  .manual-footer {
    background: var(--surface-color);
    border-top: 1px solid var(--border-color);
    padding: 2rem 0;
    margin-top: 4rem;
    text-align: center;
    color: var(--text-muted);
  }
  
  /* Print styles */
  @media print {
    body {
      font-size: 12px;
      line-height: 1.4;
    }
    
    .manual-header {
      background: none !important;
      color: var(--text-primary) !important;
      padding: 1rem 0;
    }
    
    h1, h2, h3, h4 {
      page-break-after: avoid;
    }
    
    .toc {
      page-break-after: always;
    }
    
    pre, .metric-card {
      page-break-inside: avoid;
    }
    
    a {
      color: var(--text-primary) !important;
      text-decoration: none !important;
      border-bottom: none !important;
    }
    
    .alert {
      border: 1px solid var(--border-color) !important;
      page-break-inside: avoid;
    }
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .container {
      padding: 0 1rem;
    }
    
    .manual-header h1 {
      font-size: 2rem;
    }
    
    .manual-meta {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    h1 {
      font-size: 2rem;
    }
    
    h2 {
      font-size: 1.5rem;
    }
    
    pre {
      padding: 1rem;
      font-size: 0.8rem;
    }
  }
`;

function processMarkdownContent(content) {
  // Convertir emojis de texto a HTML
  const emojiMap = {
    '🟢': '<span style="color: #22c55e;">●</span>',
    '🟡': '<span style="color: #f59e0b;">●</span>',
    '🔴': '<span style="color: #ef4444;">●</span>',
    '📄': '<span style="color: #3b82f6;">📄</span>',
    '✓': '<span style="color: #22c55e;">✓</span>',
    '⚠️': '<span style="color: #f59e0b;">⚠</span>'
  };
  
  // Reemplazar emojis
  Object.entries(emojiMap).forEach(([emoji, html]) => {
    content = content.replace(new RegExp(emoji, 'g'), html);
  });
  
  // Procesar alertas especiales
  content = content.replace(/\*\*Síntomas\*\*/g, '<div class="alert alert-info"><strong>Síntomas</strong>');
  content = content.replace(/\*\*Posibles causas y soluciones\*\*/g, '</div><div class="alert alert-warning"><strong>Posibles causas y soluciones</strong>');
  content = content.replace(/\*\*Impacto\*\*/g, '</div><div class="alert alert-danger"><strong>Impacto</strong>');
  content = content.replace(/\*\*Soluciones\*\*/g, '</div><div class="alert alert-success"><strong>Soluciones</strong>');
  
  return content;
}

function generateUserManualHTML() {
  try {
    // Leer el archivo markdown del manual
    const markdownPath = path.join(process.cwd(), 'user-manual.md');
    const markdownContent = fs.readFileSync(markdownPath, 'utf8');
    
    // Procesar contenido especial
    const processedContent = processMarkdownContent(markdownContent);
    
    // Convertir markdown a HTML
    const htmlContent = marked(processedContent);
    
    // Crear el HTML completo
    const fullHTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manual de Usuario - PageSpeed Analyzer</title>
    <meta name="description" content="Manual completo de usuario para PageSpeed Analyzer con Agente Ruby Integrado">
    <meta name="author" content="Equipo PageSpeed Analyzer">
    <meta name="keywords" content="PageSpeed, Performance, Web, Ruby, Manual, Usuario">
    <style>
        ${userManualCSS}
    </style>
</head>
<body>
    <header class="manual-header">
        <div class="container">
            <h1>Manual de Usuario</h1>
            <div class="manual-subtitle">PageSpeed Analyzer con Agente Ruby Integrado</div>
            <div class="manual-meta">
                <span>📅 Versión 1.0</span>
                <span>📆 29 de Julio, 2025</span>
                <span>👥 Para usuarios finales y desarrolladores</span>
                <span>📊 Principiante a Intermedio</span>
            </div>
        </div>
    </header>

    <main class="container">
        ${htmlContent}
    </main>

    <footer class="manual-footer">
        <div class="container">
            <p><strong>Manual de Usuario Generado Automáticamente</strong></p>
            <p>PageSpeed Analyzer con Agente Ruby Integrado v1.0</p>
            <p>© 2025 - Equipo de Desarrollo</p>
        </div>
    </footer>

    <script>
        // Mejorar experiencia de usuario
        document.addEventListener('DOMContentLoaded', function() {
            // Añadir smooth scrolling para enlaces internos
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
            
            // Añadir indicadores de progreso de lectura
            const progressBar = document.createElement('div');
            progressBar.style.cssText = \`
                position: fixed;
                top: 0;
                left: 0;
                width: 0%;
                height: 3px;
                background: linear-gradient(to right, #667eea, #764ba2);
                z-index: 9999;
                transition: width 0.1s;
            \`;
            document.body.appendChild(progressBar);
            
            window.addEventListener('scroll', function() {
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;
                const scrollTop = window.pageYOffset;
                const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
                progressBar.style.width = Math.min(progress, 100) + '%';
            });
        });
    </script>
</body>
</html>`;

    // Guardar el archivo HTML
    const outputPath = path.join(process.cwd(), 'Manual-Usuario-PageSpeed-Analyzer.html');
    fs.writeFileSync(outputPath, fullHTML, 'utf8');
    
    console.log('✅ Manual de usuario HTML generado exitosamente');
    console.log('📄 Archivo: Manual-Usuario-PageSpeed-Analyzer.html');
    console.log('📏 Tamaño:', Math.round(fullHTML.length / 1024), 'KB');
    
    // También crear versión optimizada para impresión
    const printHTML = fullHTML.replace('<style>', '<style>@page { margin: 2cm; size: A4; }');
    const printOutputPath = path.join(process.cwd(), 'Manual-Usuario-PageSpeed-Analyzer-Print.html');
    fs.writeFileSync(printOutputPath, printHTML, 'utf8');
    
    console.log('🖨️  Versión para impresión creada: Manual-Usuario-PageSpeed-Analyzer-Print.html');
    console.log('');
    console.log('📋 Para convertir a PDF:');
    console.log('   1. Abrir el archivo HTML en Chrome/Edge');
    console.log('   2. Presionar Ctrl+P (Cmd+P en Mac)');
    console.log('   3. Seleccionar "Guardar como PDF"');
    console.log('   4. Configurar márgenes mínimos para mejor aprovechamiento');
    console.log('');
    console.log('🌐 También disponible via web en: /user-manual');
    
    return {
      htmlPath: outputPath,
      printPath: printOutputPath,
      size: fullHTML.length
    };
    
  } catch (error) {
    console.error('❌ Error generando manual de usuario:', error.message);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  generateUserManualHTML();
}

export { generateUserManualHTML };