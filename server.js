const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const archiver = require('archiver');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/generate-website', (req, res) => {
  const { siteName, author, jsFolder, cssFolder } = req.body;

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
    res.download(`${siteName}.zip`, `${siteName}.zip`); // Return zip file to client
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);
  archive.directory(siteName, false);
  archive.finalize();
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
