'use strict';

class User {

  constructor(socketid, lat, long) {
    this.socketid = socketid;
    this.lat = lat;
    this.long = long;
    this.calling = false;
    this.peerid = false;
  }

}

module.exports = User;
