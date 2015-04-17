// Listener for content script response
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type == 'setlist') {
    console.log(request.data);
  }
});

// Execute content script which extracts the data
document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.executeScript({
    file: 'content-script.js'
  });
});