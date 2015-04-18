var Spotify = function() {
  this.accessToken = null;
  this.userId = null;
};

Spotify.prototype.initialize = function(callback) {
  var that = this;

  // Install listener to receive access token from background script
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'spotify-access-token') {
      that.accessToken = request.data;
      if (!that.accessToken) {
        callback(false);
        return;
      }

      that.getUserId(function(id) {
        that.userId = id;
        callback(!!that.userId);
      });
    }
  });

  this.requestAccessToken();
};

Spotify.prototype.requestAccessToken = function() {
  // Request access token from background script
  chrome.runtime.sendMessage({ type: 'spotify-request-access-token' });
};

Spotify.prototype.sendApiRequest = function(method, endpoint, params, callback) {
  var that = this;
  var url = 'https://api.spotify.com' + endpoint;
  if (method === 'GET') {
    url += '?' + Utils.paramsToGetQueryString(params);
  }

  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  if (this.accessToken) {
    xhr.setRequestHeader('Authorization', 'Bearer ' + this.accessToken);
  }
  if (method === 'POST' || method === 'PUT') {
    xhr.setRequestHeader('Content-Type', 'application/json');
  }
  xhr.onreadystatechange = function() {
    if (xhr.status === 401 && that.accessToken) {
      chrome.identity.removeCachedAuthToken({ token: that.accessToken }, function() {
        that.requestAccessToken();
      });
      that.accessToken = null;
      that.userId = null;
      return;
    }

    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        callback(JSON.parse(xhr.responseText));
      } else {
        callback(false);
      }
    }
  };
  xhr.send(method !== 'GET' ? JSON.stringify(params) : null);
};

Spotify.prototype.getUserId = function(callback) {
  this.sendApiRequest('GET', '/v1/me', {}, function(data) {
    callback(data ? data.id : null);
  })
};

Spotify.prototype.findSongs = function(artist, songs, callback) {
  var songData = [];
  var notFoundSongs = [];
  var foundCnt = 0;
  var notFoundCnt = 0;

  var checkIfComplete = function() {
    if (foundCnt + notFoundCnt === songs.length) {
      callback(Utils.filterEmptyArrayEntries(songData), Utils.filterEmptyArrayEntries(notFoundSongs));
    }
  };

  // Search for all songs
  for (var i = 0; i < songs.length; i++) {
    this.findSong(artist, songs[i], (function(ii) {
      return function(track) {
        if (track) {
          songData[ii] = track;
          foundCnt++;
        } else {
          notFoundSongs[ii] = songs[ii];
          notFoundCnt++;
        }
        checkIfComplete();
      };
    })(i));
  }
};

Spotify.prototype.findSong = function(artist, song, callback) {
  this.sendApiRequest('GET', '/v1/search', {
    q: 'artist:' + artist + ' track:' + song,
    type: 'track',
    market: 'from_token',
    limit: 1
  }, function(data) {
    callback(data && data.tracks.items.length ? data.tracks.items[0] : null);
  });
};

Spotify.prototype.createPlaylist = function(title, callback) {
  this.sendApiRequest('POST', '/v1/users/' + this.userId + '/playlists', {
    name: title,
    'public': false
  }, function(data) {
    callback(data ? data.id : null);
  });
};

Spotify.prototype.addSongsToPlaylist = function(playlistId, spotifyTracks, callback) {
  var uris = [];
  for (var i = 0; i < spotifyTracks.length; i++) {
    if (spotifyTracks[i]) {
      uris.push('spotify:track:' + spotifyTracks[i].id);
    }
  }

  if (uris.length === 0) {
    callback(false);
    return;
  }

  this.sendApiRequest('POST', '/v1/users/' + this.userId + '/playlists/' + playlistId + '/tracks', {
    uris: uris
  }, function(data) {
    callback(!!data);
  });
};