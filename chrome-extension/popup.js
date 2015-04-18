function main() {
  // Install listener for setlist extraction callback
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'setlist') {
      var setlist = request.data;
      if (setlist && setlist.songs && setlist.songs.length) {
        setMessage('Searching songs on Spotify', setlist.artist + ' - ' + setlist.songs.length + ' songs');
        addSetlistAsPlaylistToSpotify(setlist);

      } else {
        setMessage('Empty setlist', 'Playlist could not be created');
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
      setMessage('Could not connect to Spotify', 'Please try again');
      return;
    }

    spotify.findSongs(setlist.artist, setlist.songs, function(spotifyTracks, notFoundSongs) {
      if (!spotifyTracks || spotifyTracks.length == 0) {
        setMessage('No songs found on Spotify', 'Please choose another setlist');
        return;
      }

      var foundStatusStr = 'All songs found';
      if (notFoundSongs && notFoundSongs.length > 0) {
        foundStatusStr = notFoundSongs.length + (notFoundSongs.length == 1 ? ' song' : ' songs') + ' not found: "' + notFoundSongs.join('", "') + '"';
      }

      setMessage('Saving as playlist', foundStatusStr);
      spotify.createPlaylist(getPlaylistTitle(setlist), function(playlistId) {
        spotify.addSongsToPlaylist(playlistId, spotifyTracks, function(success) {
          if (success) {
            setMessage('Playlist created', foundStatusStr);
          } else {
            setMessage('Error saving playlist', 'Please try again');
          }
        })
      });
    });
  })
}

function setMessage(line1, line2) {
  document.getElementById('status-line1').textContent = line1;
  document.getElementById('status-line2').textContent = line2;
}

function getPlaylistTitle(setlist) {
  return (setlist ? setlist.artist + ' @ ' + setlist.venue + ' (' + setlist.date + ')' : 'Setlist');
}

main();