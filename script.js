document.getElementById('generator-form').addEventListener('submit', function(event) {
  event.preventDefault();
  
  const siteName = document.getElementById('site-name').value;
  const author = document.getElementById('author').value;
  const jsFolder = document.getElementById('js-folder').checked ? 'y' : 'n';
  const cssFolder = document.getElementById('css-folder').checked ? 'y' : 'n';

  generateWebsite(siteName, author, jsFolder, cssFolder);
});

function generateWebsite(siteName, author, jsFolder, cssFolder) {
  const formData = {
    siteName: siteName,
    author: author,
    jsFolder: jsFolder,
    cssFolder: cssFolder
  };

  fetch('http://localhost:3000/generate-website', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(response => {
    if (response.ok) {
      // Successful response, initiate download
      return response.blob();
    } else {
      // Handle error
      throw new Error('Failed to generate website: ' + response.statusText);
    }
  })
  .then(blob => {
    // Create a temporary URL for the blob
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
  })
  .catch(error => {
    console.error(error);
    alert(error.message); // Display error message to the user
  });
}
