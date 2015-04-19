/*
 * Google Analytics
 */

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-62043254-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

/*
 * Main
 */

function main() {
  // Install listener for setlist extraction callback
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'setlist') {
      var setlist = request.data;
      if (setlist && setlist.songs && setlist.songs.length) {
        showMessage('Searching songs on Spotify', setlist.artist + ' - ' + setlist.songs.length + ' songs');
        addSetlistAsPlaylistToSpotify(setlist);

      } else {
        showMessage('Empty setlist', 'Playlist could not be created');
      }
    }
  });

  // Execute content script which extracts the setlist data
  document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.executeScript({
      file: 'content-script.js'
    });
  });
}

function addSetlistAsPlaylistToSpotify(setlist) {
  var spotify = new Spotify();
  spotify.initialize(function(success) {
    if (!success) {
      showMessage('Could not connect to Spotify', 'Please try again');
      return;
    }

    spotify.findSongs(setlist.artist, setlist.songs, function(spotifyTracks, notFoundSongs) {
      if (!spotifyTracks || spotifyTracks.length === 0) {
        showMessage('No songs found on Spotify', 'Please choose another setlist');
        return;
      }

      var foundStatusStr = 'All songs found';
      if (notFoundSongs && notFoundSongs.length > 0) {
        foundStatusStr = notFoundSongs.length + (notFoundSongs.length === 1 ? ' song' : ' songs') + ' not found: "' + notFoundSongs.join('", "') + '"';
      }

      showMessage('Saving as playlist', foundStatusStr);
      spotify.createPlaylist(getPlaylistTitle(setlist), function(playlistId, playlistUrl) {
        spotify.addSongsToPlaylist(playlistId, spotifyTracks, function(success) {
          if (success) {
            showMessage('Playlist created', foundStatusStr);
            setSpotifyLink(playlistUrl, 'Play in Spotify');
            _gaq.push(['_trackEvent', 'Setlist', setlist.artist, setlist.venue + ' (' + setlist.date + ')']);

          } else {
            showMessage('Error saving playlist', 'Please try again');
          }
        })
      });
    });
  })
}

function showMessage(line1, line2) {
  document.getElementById('status-line1').textContent = line1;
  document.getElementById('status-line2').textContent = line2;
}

function setSpotifyLink(url, text) {
  var a = document.getElementById('spotify-link');
  a.textContent = text;
  a.href = url;
  document.getElementById('spotify').style.display = 'block';
}

function getPlaylistTitle(setlist) {
  return (setlist ? setlist.artist + ' @ ' + setlist.venue + ' (' + setlist.date + ')' : 'Setlist');
}

main();