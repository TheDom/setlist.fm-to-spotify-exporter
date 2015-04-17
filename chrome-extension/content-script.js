function getArtist() {
  return document.querySelector('h1 .headlineArtist').textContent;
}

function getVenue() {
  return document.querySelector('h1 .headlineVenue').textContent;
}

function getDate() {
  var breadCrumbBarEls = document.querySelector('.breadCrumbBar').children;
  return breadCrumbBarEls[breadCrumbBarEls.length - 1].textContent.replace(' Setlist', '');
}

function getSongs() {
  var songs = [];
  var songLabels = document.querySelectorAll('.setlistSongs .songLabel');
  for (var i = 0; i < songLabels.length; i++) {
    songs.push(songLabels[i].textContent);
  }
  return songs;
}

chrome.extension.sendMessage({
  type: 'setlist',
  data: {
    artist: getArtist(),
    venue: getVenue(),
    date: getDate(),
    songs: getSongs()
  }
});