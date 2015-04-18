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
    var songLabels = document.querySelectorAll('.setlistSongs .songLabel');
    for (var i = 0; i < songLabels.length; i++) {
      songs.push(songLabels[i].textContent);
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