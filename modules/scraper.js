'use strict';

let cheerio = require('cheerio');
let request = require('request');

const scrapeFromNYTimesURL = (url) => {

  return new Promise((resolve, reject) => {

    request({

      url: url,
      jar: true

    }, (error, response, html) => {

      if(!error){

        let $ = cheerio.load(html);
        let paragraphs = {};

        $('.story').filter(function(){

          let data = $(this);
          data.find('.story-body-text').each(function(i, elem) {
            paragraphs[i] = $(this).text();
          });

          return resolve(paragraphs);

        });

      } else {

        return reject(error);

      }

    });

  });

};

module.exports = {
  scrapeFromNYTimesURL
}
