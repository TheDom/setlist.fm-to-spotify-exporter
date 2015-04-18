// Only show icon on setlist pages on setlist.fm
chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostEquals: 'www.setlist.fm',
              pathContains: '/setlist/'
            }
          })
        ],
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type === 'spotify-request-access-token') {
    var clientId = 'f1babeb0559945ff9045e6d24e5256df';
    var redirectUri = chrome.identity.getRedirectURL();
    var scopes = [
      'playlist-read-private',
      'playlist-modify-public',
      'playlist-modify-private',
      'user-read-private'           // Needed to filter tracks by the user's country
    ];
    var url = 'https://accounts.spotify.com/authorize' +
      '?client_id=' + clientId +
      '&response_type=token' +
      '&redirect_uri=' + encodeURIComponent(redirectUri) +
      '&scope=' + encodeURIComponent(scopes.join(' '));

    chrome.identity.launchWebAuthFlow({
        'url': url,
        'interactive': true
      },
      function(responseUrl) {
        // e.g. https://pnbomokgkbofpeomjhjoifahplhhnjbn.chromiumapp.org/?token=Xx-Yy-Zz&token_type=Bearer&expires_in=3600
        var matches = (responseUrl ? responseUrl.match(/token=([^&]+)/) : null);
        var token = (matches ? matches[1] : null);

        // The callback sendResponse does not work at this point anymore
        chrome.runtime.sendMessage(sender.id, {
          type: 'spotify-access-token',
          data: token
        });
      }
    );
  }
});