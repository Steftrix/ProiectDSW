const http = require('http');
const fs = require('fs');
const archiver = require('archiver');

const port = 3000; // Change this to your desired port

const server = http.createServer((req, res) => {
  // Allow requests from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // Allow POST and OPTIONS requests
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow Content-Type header

  if (req.method === 'OPTIONS') {
    // Handle preflight request
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/generate-website') {
    let data = '';

    req.on('data', (chunk) => {
      data += chunk;
    });

    req.on('end', () => {
      const { siteName, author, jsFolder, cssFolder } = JSON.parse(data);

      // Generate website skeleton
      const rootFolder = `./${siteName}`;
      fs.mkdirSync(rootFolder);

      const indexHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${siteName}</title>
  <meta name="author" content="${author}">
</head>
<body>
  <h1>Welcome to ${siteName}</h1>
</body>
</html>
      `;

      fs.writeFileSync(`${rootFolder}/index.html`, indexHtmlContent);

      if (jsFolder === 'y') {
        fs.mkdirSync(`${rootFolder}/js`);
      }

      if (cssFolder === 'y') {
        fs.mkdirSync(`${rootFolder}/css`);
      }

      // Create zip file
      const output = fs.createWriteStream(`${siteName}.zip`);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      output.on('close', () => {
        console.log(`Website '${siteName}' has been zipped successfully!`);
        
        // Read the created zip file and send it to the client
        fs.readFile(`${siteName}.zip`, (err, data) => {
          if (err) {
            console.error('Error reading zip file:', err);
            res.writeHead(500);
            res.end('Internal Server Error');
            return;
          }

          res.setHeader('Content-Type', 'application/zip');
          res.setHeader('Content-Disposition', `attachment; filename="${siteName}.zip"`);
          res.end(data);
          
          // Cleanup: Delete generated files and folders
          fs.unlinkSync(`${siteName}.zip`);
          fs.rmdirSync(rootFolder, { recursive: true });
        });
      });

      archive.on('error', (err) => {
        console.error('Error creating zip file:', err);
        res.writeHead(500);
        res.end('Internal Server Error');
      });

      archive.pipe(output);
      archive.directory(rootFolder, false);
      archive.finalize();
    });
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});