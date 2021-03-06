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

  var context = require('rabbit.js').createContext(rabbitUrl);

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
    var sub = context.socket('SUB');
    sub.setEncoding('utf8');
    sub.connect('realtime', function() {
      console.log("»    realtime subscribe    «".green);
      //sub.pipe(process.stdout);
      sub.on('data', function(data) {
        data = JSON.parse(data);
        eventsManager.emit('message', data);
      });
    });
  });
};

module.exports = broker;
