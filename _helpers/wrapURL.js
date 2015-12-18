'use strict';

module.exports = str => {

  //a tag from url
  var matches = str.match(/http\S+/);
  if(matches !== null) {

    var wrapped = matches.map((v) => `<a href=${v}>${v}</a>`);

    for (var i = 0; i < matches.length; i++) {
      str = str.replace(matches[i], wrapped[i]);
    }

  }

  //a tag from hashtag
  matches = str.match(/#(\S*)/g);
  if(matches !== null) {

    var wrapped = matches.map((v) => `<a href="http://twitter.com/hashtag/${v.slice(1)}>${v}</a>`);

    for (var i = 0; i < matches.length; i++) {
      str = str.replace(matches[i], wrapped[i]);
    }

  }

  return str;

};
