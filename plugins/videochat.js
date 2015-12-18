'use strict';

module.exports.register = (server, options, next) => {

  let io = require('socket.io')(server.listener);

  let users = [];
  let User = require('../models/User');

  io.on('connection', socket => {

    let lat = socket.handshake.query.lat;
    let long = socket.handshake.query.long;
    let user = new User(socket.id, lat, long);
    let callingPartner;

    // 1. bestaande users doorsturen
    // 2. naar andere users nieuwe user emitten
    // 3. bij disconnect andere users notifyen en user verwijderen uit array

    socket.emit('init', users);
    socket.broadcast.emit('new_user', user);
    socket.on('disconnect', () => {
      users = users.filter(u => u.socketid !== socket.id);
      socket.broadcast.emit('user_left', user);
      if(user.calling && callingPartner) {
        io.to(callingPartner.socketid).emit('calling_disconnected');
      }
    });

    socket.on('calling', peerid => {
      callingPartner = users.find(u => u.peerid === peerid);
    });

    // 1. huidige user toevoegen aan array nadat array van bestaande users aan huidige user werd doorgestuurd

    if(!users.find(u => socket.id === u.id)) {
      users.push(user);
    }

    // 1. peerid aan huidige user toekennen

    socket.on('peerid', peerid => {
      user.peerid = peerid;
    });

    // 1. huidige user probeert een andere user te callen
    // 2. als andere user niet belt en hij geaccepteerd heeft kan men bellen
    // 3. anders is wordt huidige user genotified dat andere user niet kan bellen

    socket.on('try_calling', socketid => {
      user.calling = true;
      let otherUser = users.find(u => u.socketid === socketid);
      if(otherUser.calling) {
        socket.emit('user_already_in_call', socketid);
      } else {
        socket.emit('ready_to_call_peer', otherUser.peerid);
        otherUser.calling = true;
      }
    });

    socket.on('call_denied', peerid => {
      let otherUser = users.find(u => u.peerid === peerid);
      if(otherUser) {
        otherUser.calling = false;
      }
      user.calling = false;
      io.to(otherUser.socketid).emit('call_was_denied');
    });


    // 1. wanneer call gedaan is beide users calling property terug op false

    socket.on('call_ended', peerid => {
      let otherUser = users.find(u => u.peerid === peerid);
      if(otherUser) {
        otherUser.calling = false;
      }
      user.calling = false;
    });

  });

  next();

};

module.exports.register.attributes = {
  name: 'videochat',
  version: '1.0.0'
};
