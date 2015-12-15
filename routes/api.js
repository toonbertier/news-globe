'use strict';

let scraper = require('../modules/scraper');

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
  }

];
