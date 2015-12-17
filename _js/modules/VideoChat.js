'use strict';

import {html} from '../helpers/util';

import callTpl from '../../_hbs/call';
import acceptCallTpl from '../../_hbs/accept_call';
import waitingCallTpl from '../../_hbs/waiting_call';
import alreadyInCallTpl from '../../_hbs/already_in_call';
import deniedCallTpl from '../../_hbs/denied_call';

export default class VideoChat {

  constructor() {
  }

  init() {

    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

    navigator.getUserMedia(
      {video: true, audio: true},
      this.setUserStream.bind(this), console.error
    );

  }

  setUserStream(stream) {
    this.userStream = stream;
  }

  displayCallTime(el) {

    this.cTime = 0;

    this.timer = setInterval(() => {

      this.cTime++;

      let h = Math.floor(this.cTime/3600);
      let m = Math.floor((this.cTime - (h * 3600))/60);
      let s = this.cTime - (h * 3600) - (m * 60);

      if(h < 10) {
        h = `0${h}`;
      }

      if(m < 10) {
        m = `0${m}`;
      }

      if(s < 10) {
        s = `0${s}`;
      }

      let str = `${h}:${m}:${s}`

      el.innerHTML = str;

    }, 1000);

  }

  clearCallTime() {
    clearInterval(this.timer);
  }

  renderCall(data) {
    return this.renderTemplate(callTpl, data);
  }

  renderDeniedCall(data) {
    return this.renderTemplate(deniedCallTpl, data);
  }

  renderAcceptCall(data) {
    return this.renderTemplate(acceptCallTpl, data);
  }

  renderWaitingCall(data) {
    return this.renderTemplate(waitingCallTpl, data);
  }

  renderAlreadyInCall(data) {
    return this.renderTemplate(alreadyInCallTpl, data);
  }

  renderTemplate(_tpl, data) {

    $('.videochat').innerHTML = '';
    let tpl = html(_tpl(data));
    $('.videochat').append(tpl);

    return tpl;

  }

}
