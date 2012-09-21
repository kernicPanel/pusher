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
    //eventsManager.connect(socket, server);

    socket.on('auth', function(cookie){
      console.log("AUTH : ".yellow.inverse);
      server.auth(cookie, function(err, token, ips){
        eventsManager.sockets[socket.id] = token;
        server.addUser(token, socket, ips);
      });
    });

    socket.on('disconnect', function(){
      console.log('Client Disconnected.');
      server.deleteUser(eventsManager.sockets[socket.id]);
      delete eventsManager.sockets[socket.id];
    });
  });

  eventsManager.on('log', function(data){
    socket.emit('log', data);
  });

  eventsManager.on('message', function(data){
    console.log("Message : ".yellow.inverse, data);
    console.log("server.users : ", server.users);
    console.log("server.ips : ", server.ips);
    console.log("eventsManager.sockets : ", eventsManager.sockets);

    var ip = data.ip;
    var message = data.message;
    if (!!server.ips[ip]) {
      var user = server.ips[ip];
      server.users[user].socket.emit('message', data);
    }
  });

};

eventsManager.connect = function(socket, server) {
  console.log("»    eventsManager connect     «".blue);

  eventsManager.on('log', function(data){
    socket.emit('log', data);
  });

  eventsManager.on('message', function(data){
    console.log("Message : ".yellow.inverse, data);
    console.log("server.users : ", server.users);
    console.log("server.ips : ", server.ips);
    console.log("eventsManager.sockets : ", eventsManager.sockets);

    var ip = data.ip;
    var message = data.message;
    if (!!server.ips[ip]) {
      var user = server.ips[ip];
      server.users[user].socket.emit('message', data);
    }
  });

};

module.exports = eventsManager;
