'use strict';

import {html} from '../helpers/util';

import articleTpl from '../../_hbs/article';

export default class Article {

  constructor(data) {
    this.data = data;
  }

  render() {

    this.getArticleContentFromNYTimes()
    .then(paragraphs => {

      this.data.paragraphs = paragraphs;

      $('.article').innerHTML = '';
      let tpl = html(articleTpl(this.data));
      $('.article').append(tpl);

    });

  }

  getArticleContentFromNYTimes() {

    /* NOTE: nu enkel bij NY Times artikels */

    return new Promise((resolve, reject) => {

      $.post('http://localhost:3000/scrape/', {url: this.data.url}, content => {
        return resolve(content);
      })

    });

  }

}
