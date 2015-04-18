var Utils = {};

Utils.filterEmptyArrayEntries = function(arr) {
  var newArr = [];
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] !== undefined && arr[i] !== null) {
      newArr.push(arr[i]);
    }
  }
  return newArr;
};

Utils.paramsToGetQueryString = function(params) {
  var strs = [];
  for (var key in params) {
    if (params.hasOwnProperty(key)) {
      strs.push(key + '=' + encodeURIComponent(params[key]));
    }
  }
  return strs.join('&');
};