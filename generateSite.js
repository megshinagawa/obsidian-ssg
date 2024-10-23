const fs = require('fs-extra');
const path = require('path');
const { processMarkdown } = require('./parseMarkdown');

const inputDir = 'content';
const outputDir = 'public';

// Ensure output directory is clean
fs.emptyDirSync(outputDir);

// Recursively read all markdown files
function generateSite() {
  const files = fs.readdirSync(inputDir);

  files.forEach(file => {
    const filePath = path.join(inputDir, file);

    // Only handle Markdown files
    if (file.endsWith('.md')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const { html, metadata } = processMarkdown(content);

      // Define output file
      const outputFilePath = path.join(outputDir, file.replace('.md', '.html'));

      // Generate HTML with optional metadata (title, etc.)
      const finalHtml = `
        <html>
          <head>
            <title>${metadata.title || 'Untitled'}</title>
          </head>
          <body>
            ${html}
          </body>
        </html>
      `;

      // Write the HTML file to the output directory
      fs.writeFileSync(outputFilePath, finalHtml);
      console.log(`Generated ${outputFilePath}`);
    }
  });
}

generateSite();
