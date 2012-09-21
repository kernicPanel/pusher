#!/usr/bin/env node

var express = require('express'),
    path    = require('path'),
    http    = require('http'),
    https    = require('https'),
    path    = require('path'),
    colors  = require('colors');

var app = express();

app.configure(function(){
  app.set('port', 8088);
  app.set('views', path.join(__dirname , path.join('/','views')));
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, path.join('/','public'))));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


//TODO: when express 3 updates check if there is a better way to attach socket.io
var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port %d in %s mode".red.inverse, app.get('port'), app.settings.env);
});

server.config = require('./config.js');

server.auth = function auth ( cookie, callback ) {
  var authUrl = server.config.auth.url;
  var authPath = server.config.auth.path;

  var options = {
    host: authUrl,
    path: authPath,
    headers: {
      Cookie: cookie
    }
  };

  console.log("options : ", options);

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (data) {
      try {
        data = JSON.parse(data);
        var token = data.token;
        server.getIPs(token, callback);
      }
      catch (e) {
        callback(e, null, null);
      }
    });
  });
  
  req.on('error', function(e) {
      console.log('problem with request: ' + e);
  });

  // write data to request body
  req.end();
};

server.getIPs = function getIPs ( token, callback ) {
  var ipsUrl = server.config.auth.ips + token;

  var req = http.request(ipsUrl, function(res) {
    res.setEncoding('utf8');
    var response = '';
    res.on('data', function (data) {
      response += data;
    });
    res.on('end', function () {
      try {
        response = JSON.parse(response);
        var objects = response.response;
        var ips = [];
        objects.forEach(function(object){
          ips.push(object.ip);
        });
        callback(null, token, ips);
      }
      catch (e) {
        callback(e, token, null);
      }
    });
  });
  
  req.on('error', function(e) {
      console.log('problem with request: ' + e);
  });

  // write data to request body
  req.end();
};

server.users = {};
server.ips = {};
server.addUser = function addUser ( user, socket, ips ) {
  console.log("addUser : ".blue.inverse, user);
  if (!server.users[user]) {
    server.users[user] = {};
    server.users[user].socket = socket;
    server.users[user].ips = ips;
  }

  ips.forEach(function(ip){
    if (!server.ips[ip]) {
      server.ips[ip] = [];
    }

    if (server.ips[ip].indexOf(user) < 0) {
      server.ips[ip].push(user);
    }
  });
};

server.deleteUser = function deleteUser ( user ) {
  console.log("deleteUser : ".yellow.inverse, user);
  if (server.users[user]) {
    server.users[user].ips.forEach(function(ip) {
      server.ips[ip].splice(server.ips[ip].indexOf(user), 1);
      if (!server.ips[ip].length) {
        delete server.ips[ip];
      }
    });
    delete server.users[user];
  }
};


server.eventsManager = require('./lib/eventsManager.js');
server.eventsManager.init(server);

server.broker = require('./lib/broker2.js');
server.broker.init(server);

app.get('/', function(req, res){
  console.log("req.query : ", req.query);

  var user = req.query.user;
  if (!!server.users[user]) {
    server.users[user].socket.emit('message', req.query);
  }
});

app.post('/', function(req, res){
  console.log("req.body : ", req.body);

  var user = req.body.user;
  if (!!server.users[user]) {
    server.users[user].socket.emit('message', req.body);
  }
});

