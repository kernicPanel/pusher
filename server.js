#!/usr/bin/env node

var express = require('express'),
    path    = require('path'),
    http    = require('http'),
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

server.users = {};
server.addUser = function addUser ( user, socket ) {
  if (!server.users[user]) {
    server.users[user] = {};
    console.log("server.users : ", server.users);
    server.users[user].socket = socket;
    console.log("server.users : ", server.users);
  }
};

server.deleteUser = function delUser ( user ) {
  delete server.users[user];
  console.log("server.users : ", server.users);
};


server.eventsManager = require('./lib/eventsManager.js');
server.eventsManager.init(server);

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

