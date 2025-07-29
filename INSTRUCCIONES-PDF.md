
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

```bash
# Instalar wkhtmltopdf
sudo apt-get install wkhtmltopdf  # Ubuntu/Debian
brew install wkhtmltopdf         # macOS

# Convertir a PDF
wkhtmltopdf --page-size A4 --margin-top 20mm --margin-bottom 20mm --margin-left 15mm --margin-right 15mm PageSpeed-Analyzer-Diseno-Funcional.html PageSpeed-Analyzer-Diseno-Funcional.pdf
```

## Método 4: Usando Puppeteer (Para desarrolladores)

```javascript
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
```

El documento HTML está completamente estilizado y optimizado para conversión a PDF.
