const puppeteer = require('puppeteer');

const logger = createLogger('pdf-generator');

/**
 * Generate PDF from HTML content using Puppeteer (headless Chrome)
 */
const generatePDF = async (htmlContent, title, versionNumber) => {
  let browser;
  
  try {
    // Launch headless browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });

    const page = await browser.newPage();

    // Create complete HTML document with styling
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${title} - Version ${versionNumber}</title>
          <style>
            @page {
              margin: 1in;
              @top-center {
                content: "${title}";
                font-size: 10pt;
                color: #666;
              }
              @bottom-center {
                content: "Version ${versionNumber} | Page " counter(page) " of " counter(pages);
                font-size: 10pt;
                color: #666;
              }
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 11pt;
              line-height: 1.6;
              color: #333;
              max-width: 100%;
            }
            h1 {
              color: #2c3e50;
              border-bottom: 3px solid #3498db;
              padding-bottom: 10px;
              font-size: 24pt;
            }
            h2 {
              color: #34495e;
              margin-top: 24px;
              font-size: 18pt;
            }
            h3 {
              color: #7f8c8d;
              font-size: 14pt;
            }
            p {
              text-align: justify;
              margin: 10px 0;
            }
            ul, ol {
              margin: 10px 0;
              padding-left: 30px;
            }
            li {
              margin: 5px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #3498db;
              color: white;
            }
            .cover-page {
              text-align: center;
              padding: 100px 0;
            }
            .cover-title {
              font-size: 32pt;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 20px;
            }
            .cover-version {
              font-size: 18pt;
              color: #7f8c8d;
              margin-bottom: 40px;
            }
            .cover-date {
              font-size: 12pt;
              color: #95a5a6;
            }
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 72pt;
              color: rgba(52, 152, 219, 0.1);
              z-index: -1;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="watermark">CONTROLLED DOCUMENT</div>
          <div class="cover-page">
            <div class="cover-title">${title}</div>
            <div class="cover-version">Version ${versionNumber}</div>
            <div class="cover-date">Generated: ${new Date().toLocaleDateString()}</div>
          </div>
          <div style="page-break-after: always;"></div>
          ${htmlContent}
        </body>
      </html>
    `;

    // Set content
    await page.setContent(fullHtml, {
      waitUntil: 'networkidle0',
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: false,
      margin: {
        top: '1in',
        right: '1in',
        bottom: '1in',
        left: '1in',
      },
    });

    await browser.close();

    logger.info(`PDF generated successfully for ${title} v${versionNumber}`);
    return pdfBuffer;
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    logger.error('Error generating PDF:', error);
    throw error;
  }
};

module.exports = {
  generatePDF,
};
