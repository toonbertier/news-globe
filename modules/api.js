'use strict';

const getArticlesFromNYTimes = () => {

  return new Promise((resolve, reject) => {

    var articles = [];
    var acceptedArticleCount = 0;

    $.getJSON('http://api.nytimes.com/svc/mostpopular/v2/mostviewed/all-sections/30.json?api-key=ecc27eb06cf46f006dc3111d9c5b7824:1:73657688', data => {

      $.each(data.results, (key, article) => {

        if(!article.geo_facet) return;
        acceptedArticleCount++;

        setTimeout(() => {
          $.getJSON(`https://maps.googleapis.com/maps/api/geocode/json?address=${article.geo_facet[0]}`, geocode => {
            article.location = geocode.results[0].geometry.location;
            articles.push(article);
            // console.log(article.geo_facet[0], '>', geocode.results[0].geometry.location.lat, geocode.results[0].geometry.location.lng);
            if(articles.length === acceptedArticleCount) return resolve(articles);
          }).fail(err => reject(err));
        }, key * 200);

      });

    });

  });

};

module.exports = {
  getArticlesFromNYTimes
};
