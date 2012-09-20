#!/usr/bin/env node

var broker = {};

broker.init = function(server, callback) {
  var options = server.config.amqp.options;
  var login = options.login;
  var password = options.password;
  var host = options.host;
  var port = options.port;
  var vhost = options.vhost;
  if (!!vhost) {
    vhost = '/' + vhost;
  }
  var rabbitUrl = 'amqps://' + login + ':' + password + '@' + host + ':' + port + vhost;
  var eventsManager = server.eventsManager;

  console.log("rabbitUrl : ", rabbitUrl);

  var context = require('rabbit.js').createContext(rabbitUrl);
  console.log("context._connection._events : ", context._connection._events);

  context.on('eror', function(error) {
    console.log("error : ", error);
  });

  context.on('connect', function (data) {
    console.log("connect : ", data);
  });

  context.on('data', function (data) {
    console.log("data : ", data.toString());
  });

  context.on('ready', function() {
    console.log("ready : ");
    var sub = context.socket('SUB');
    sub.connect('realtime', function() {
      console.log("realtime : ");
      //sub.pipe(process.stdout);
      sub.on('data', function(data) {
        console.log("data : ", data.toString());
        eventsManager.emit('message', data);
      });
    });
  });
};

module.exports = broker;
