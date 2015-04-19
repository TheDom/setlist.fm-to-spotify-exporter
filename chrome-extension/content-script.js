var SetlistFmExtractor = {
  getArtist: function() {
    return document.querySelector('h1 .headlineArtist').textContent;
  },

  getVenue: function() {
    return document.querySelector('h1 .headlineVenue').textContent;
  },

  getDate: function() {
    var breadCrumbBarEls = document.querySelector('.breadCrumbBar').children;
    return breadCrumbBarEls[breadCrumbBarEls.length - 1].textContent.replace(' Setlist', '');
  },

  getSongs: function() {
    var songs = [];

    // Walk through list elements
    var listItems = document.querySelectorAll('.setlistSongs ol > li');
    for (var i = 0; i < listItems.length; i++) {
      // Find song
      var songEl = listItems[i].querySelector(':scope .songPart .songLabel');
      var song = (songEl ? songEl.textContent : null);

      // Find tape
      if (!song) {
        var tape = listItems[i].querySelector(':scope.tape .songPart span');
        song = (tape ? tape.textContent : song);
      }

      // Split medley, e.g. 'Song A / Song B', into its songs
      if (song) {
        songs.push.apply(songs, song.split(' / '));
      }
    }

    return songs;
  }
};

chrome.runtime.sendMessage({
  type: 'setlist',
  data: {
    artist: SetlistFmExtractor.getArtist(),
    venue: SetlistFmExtractor.getVenue(),
    date: SetlistFmExtractor.getDate(),
    songs: SetlistFmExtractor.getSongs()
  }
});