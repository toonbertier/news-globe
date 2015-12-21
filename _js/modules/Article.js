'use strict';

import {html} from '../helpers/util';

import articleTpl from '../../_hbs/article';
import tweetTpl from '../../_hbs/tweet';
import twitterFeedTpl from '../../_hbs/twitter_feed';

export default class Article {

  constructor(data) {
    this.data = data;
  }

  render() {

    this.renderArticleTemplate();

    this.getArticleContentFromNYTimes()
    .then(paragraphs => {

      let trimmedParagraphs = {};

      for (var index in paragraphs) {
        if(index < 6) {
          trimmedParagraphs[index] = paragraphs[index];
        }
      }

      this.data.paragraphs = trimmedParagraphs;

      this.renderArticleTemplate();

    });

    this.twitterHandler();

  }

  renderArticleTemplate() {

    $('.article-news').remove();
    let tpl = html(articleTpl(this.data));
    $('.article-section').prepend(tpl);

  }

  getArticleContentFromNYTimes() {

    return new Promise((resolve, reject) => {

      $.post('https://news-globe.herokuapp.com/scrape', {url: this.data.url}, content => {
        return resolve(content);
      });

    });

  }

  twitterHandler() {

    this.renderTwitterFeed();

    let splittedKeywords = this.data.adx_keywords.split(';');
    let hashtags = [];
    let queryStr = '';

    splittedKeywords.forEach(keyword => {
      if(keyword.indexOf('(') > -1) keyword = keyword.replace(/ *\([^)]*\) */g, '');
      keyword = keyword.replace(/\s+/g, '').toLowerCase();

      hashtags.push(keyword);

      if(queryStr === '') {
        queryStr = keyword;
      } else {
        queryStr = `${queryStr}%20OR%20${keyword}`;
      }
    });

    this.getTweetsByUrl('https://news-globe.herokuapp.com/twitter/words/${queryStr}')
    .then(tweets => {

      if(tweets.errors) return $('.error-twitter').text(`Twitter API: ' + ${tweets.errors[0].message}`);

      if(tweets.statuses.length > 0) {
        this.renderTweets(tweets);
      } else {
        hashtags.forEach(hashtag => {
          this.getTweetsByUrl('https://news-globe.herokuapp.com/twitter/hashtag/${hashtag}')
          .then(t => this.renderTweets(t));
        });
      }

    });


  }

  getTweetsByUrl(url) {

    return new Promise((resolve, reject) => {

      $.get(url, tweets => {
        return resolve(tweets);
      });

    });

  }

  renderTwitterFeed() {

    $('.article-tweets').remove();
    let tpl = html(twitterFeedTpl());
    $('.article-section').append(tpl);

  }

  renderTweets(tweets) {

    tweets.statuses.forEach(tweet => {
      this.renderTweet(tweet);
    });

  }

  renderTweet(tweet) {

    let date = new Date(tweet.created_at.replace('+0000 ', '') + ' UTC');
    tweet.date_formatted = [date.getDate(), date.getMonth(), date.getFullYear()].join('-');

    let tpl = html(tweetTpl(tweet));
    $('.tweets').append(tpl);

  }

}
