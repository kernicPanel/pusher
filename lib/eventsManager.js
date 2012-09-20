console.log("»»»»»eventsManager load««««««".red);
var EventEmitter = require('events').EventEmitter;
var io = require('socket.io');
var util = require('util');

var EventsManager = function() {};
util.inherits(EventsManager, EventEmitter);
var eventsManager = new EventsManager();

eventsManager.sockets = {};

eventsManager.init = function(server, callback) {
  console.log("»    eventsManager init     «".green);
  io = io.listen(server);
  io.set('log level', 1);

  io.sockets.on('connection', function(socket){
    eventsManager.connect(socket, server);

    socket.on('user', function(user){
      eventsManager.sockets[socket.id] = user;
      //server.addUser(user, socket);
    });

    socket.on('ips', function(phpSessId, ips){
      console.log("incoming ips : ");
      eventsManager.sockets[socket.id] = phpSessId;
      server.addUser(phpSessId, socket, ips);
    });

    socket.on('disconnect', function(){
      console.log('Client Disconnected.');
      server.deleteUser(eventsManager.sockets[socket.id]);
      delete eventsManager.sockets[socket.id];
    });
  });

};

eventsManager.connect = function(socket, server) {
  console.log("»    eventsManager connect     «".blue);

  eventsManager.on('log', function(data){
    console.log("eventsManager log : ", data);
    socket.emit('log', data);
  });

  eventsManager.on('message', function(data){
    //console.log("eventsManager message : ", data.toString());
    console.log("data : ", data);
    var ip = data.ip;
    var message = data.message;
    console.log("ip : ", ip);
    console.log("message : ", message);
    console.log("server.ips : ", server.ips);
    if (!!server.ips[ip]) {
      var user = server.ips[ip];
      console.log("user : ", user);
      server.users[user].socket.emit('message', data);
    }
  });

};

module.exports = eventsManager;
