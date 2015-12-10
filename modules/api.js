'use strict';

const getArticlesFromNYTimes = () => {

  return new Promise((resolve, reject) => {

    var articles = [];
    var acceptedArticleCount = 0;

    $.getJSON('http://api.nytimes.com/svc/topstories/v1/world.json?api-key=35b802b79eac0b383a75cee4e82e605c:17:73657688', data => {

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
