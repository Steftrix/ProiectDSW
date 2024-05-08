document.getElementById('generator-form').addEventListener('submit', function(event) {
  event.preventDefault();
  
  const siteName = document.getElementById('site-name').value;
  const author = document.getElementById('author').value;
  const jsFolder = document.getElementById('js-folder').checked ? 'y' : 'n';
  const cssFolder = document.getElementById('css-folder').checked ? 'y' : 'n';

  generateWebsite(siteName, author, jsFolder, cssFolder);
});

function generateWebsite(siteName, author, jsFolder, cssFolder) {
  // Make an AJAX request to your Node.js server to generate the website skeleton and return it as a zip file
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/generate-website', true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.responseType = 'blob';

  xhr.onload = function() {
    if (xhr.status === 200) {
      const blob = new Blob([xhr.response], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${siteName}.zip`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } else {
      console.error('Failed to generate website:', xhr.statusText);
    }
  };

  xhr.onerror = function() {
    console.error('Network error occurred');
  };

  const data = JSON.stringify({ siteName, author, jsFolder, cssFolder });
  xhr.send(data);
}
