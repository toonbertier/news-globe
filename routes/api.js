'use strict';

let scraper = require('../modules/scraper');
let twitter = require('../modules/twitter');

module.exports = [

  {
    method: 'POST',
    path: '/scrape',
    handler: (request, reply) => {

      scraper.scrapeFromNYTimesURL(request.payload.url)
      .then(data => {
        return reply(data);
      });

    }
  },

  {
    method: 'GET',
    path: '/twitter/hashtag/{query}',
    handler: (request, reply) => {

      twitter.getTweetsByHashtag(request.params.query)
      .then(tweets => {
        return reply(tweets);
      });

    }
  },

  {
    method: 'GET',
    path: '/twitter/words/{query}',
    handler: (request, reply) => {

      twitter.getTweetsByWords(request.params.query)
      .then(tweets => {
        return reply(tweets);
      });

    }
  }

];
