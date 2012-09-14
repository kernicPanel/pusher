console.log("»»»»»eventsManager load««««««".verbose);
var EventEmitter = require('events').EventEmitter;
//var eventsManager = new EventEmitter();
var io = require('socket.io');
var util = require('util');
var connect = require('connect');
var parseCookie = connect.utils.parseCookie;

var EventsManager = function() {};
util.inherits(EventsManager, EventEmitter);
var eventsManager = new EventsManager();

//Setup Socket.IO
eventsManager.init = function(server, callback) {
  console.log("»    eventsManager init     «".green);
  io = io.listen(server);
  io.set('log level', 1);

  /*
   *eventsManager.on('log', function(data){
   *    console.log("data : ", data);
   *});
   */
/*
 *  io.set('authorization', function (data, accept) {
 *    if (!data.headers.cookie) 
 *    return accept('No cookie transmitted.', false);
 *
 *    data.cookie = parseCookie(data.headers.cookie);
 *    data.sessionID = data.cookie['express.sid'];
 *
 *  });
 */

  io.sockets.on('connection', function(socket){
    var sess = socket.handshake.session;
    //console.log("sess : ", sess);
    console.log(
      'a socket with sessionID',
      socket.handshake.sessionID,
      'connected'
    );
    eventsManager.connect(socket);

    socket.on('disconnect', function(){
      console.log('Client Disconnected.');
    });
  });

};

eventsManager.connect = function(socket) {
  console.log("»    eventsManager connect     «".blue);
  //console.log("socket : ", socket);

  //console.log("socket.handshake.session.username: ", socket.handshake.session.username);
  //console.log("server.users : ", server.users);
  //var username = socket.handshake.session.username;
  //console.log("username : ", username);

  //server.addUser( username, function(){} );

  //console.log("eventsManager.connect : ");
  socket.emit('connect', 'socket.io connected');

  eventsManager.on('log', function(data){
    console.log("eventsManager log : ", data);
    socket.emit('log', data);
  });

};

module.exports = eventsManager;
