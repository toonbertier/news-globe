'use strict';

let OAuth = require('oauth');

const getTweetsByHashtag = (hashtag) => {

  return new Promise((resolve, reject) => {

    let oauth = new OAuth.OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      process.env.TWITTERKEY,
      process.env.TWITTERSECRET,
      '1.0A',
      null,
      'HMAC-SHA1'
    );

    oauth.get(
      `https://api.twitter.com/1.1/search/tweets.json?q=%23${hashtag}%20-RT&result_type=recent&count=5&lang=en`,
      process.env.TOKEN,
      process.env.SECRET,
      function (error, data, response){
        if (error) {
          error = JSON.parse(data);
          return resolve(error);
        }
        data = JSON.parse(data);
        return resolve(data);
    });

  });

};

const getTweetsByWords = (words) => {

  return new Promise((resolve, reject) => {

    let oauth = new OAuth.OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      process.env.TWITTERKEY,
      process.env.TWITTERSECRET,
      '1.0A',
      null,
      'HMAC-SHA1'
    );

    oauth.get(
      `https://api.twitter.com/1.1/search/tweets.json?q=${words}%20-RT&result_type=recent&count=5&lang=en`,
      process.env.TOKEN,
      process.env.SECRET,
      function (error, data, response){
        if (error) {
          error = JSON.parse(data);
          return resolve(error);
        }
        data = JSON.parse(data);
        return resolve(data);
    });

  });

};

module.exports = {
  getTweetsByHashtag,
  getTweetsByWords
}
