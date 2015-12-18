'use strict';

const getArticlesFromURL = url => {

  return new Promise((resolve, reject) => {

    var articles = [];
    var acceptedArticleCount = 0;
    $.getJSON(url, data => {

      $.each(data.results, (key, article) => {

        if(!article.geo_facet) return;
        acceptedArticleCount++;
        articles.push(article);

        if(articles.length === acceptedArticleCount) return resolve(articles);

        // setTimeout(() => {
        //   $.getJSON(`https://maps.googleapis.com/maps/api/geocode/json?address=${article.geo_facet[0]}`, geocode => {
        //     article.location = geocode.results[0].geometry.location;
        //     articles.push(article);
        //     // console.log(article.geo_facet[0], '>', geocode.results[0].geometry.location.lat, geocode.results[0].geometry.location.lng);
        //     if(articles.length === acceptedArticleCount) return resolve(articles);
        //   }).fail(err => reject(err));
        // }, key * 200);

      });

    });

  });

};

const getGeolocationByAddress = address => {

  return new Promise((resolve, reject) => {

    $.getJSON(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyBhyH5Lu96yJBQxcgF9XIAyj1qRlJqpSgw`, geocode => {

      if(geocode.status === 'ZERO_RESULTS') return resolve();
      if(geocode.error_message) return $('.error-google').text('Google Geocode: ' + geocode.error_message);
      return resolve(geocode.results[0].geometry.location);


    }).fail(err => reject(err));

  });

};

module.exports = {
  getArticlesFromURL,
  getGeolocationByAddress
};
