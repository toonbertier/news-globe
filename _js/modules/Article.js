'use strict';

import {html, $} from '../helpers/util';

import articleTpl from '../../_hbs/article';

export default class Article {

  constructor(data) {
    this.data = data;
  }

  render() {
    $('.article').innerHTML = '';
    let tpl = html(articleTpl(this.data));
    $('.article').appendChild(tpl);
  }

}
