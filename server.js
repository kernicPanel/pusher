#!/usr/bin/env node

/**
 * Module dependencies.
 */

var express = require('express'),
    path    = require('path'),
    http    = require('http'),
    path    = require('path'),
    colors = require('colors');
  //io      = require('socket.io');

var app = express();

app.configure(function(){
  app.set('port', 8080);
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


server.eventsManager = require('./lib/eventsManager.js');
server.eventsManager.init(server);

server.eventsManager.emit('log', 'wooooooot');

app.get('/', function(req, res){
  res.render('index', { title: 'pusher' });
});

app.post('/', function(req, res){
  server.eventsManager.emit('log', req);
});

/*
 *var io = require('socket.io').listen(server);
 *
 *io.sockets.on('connection', function (socket) {
 *
 *  // Emit a message to send it to the client.
 *  socket.emit('ping', { msg: 'Hello. I know socket.io.' });
 *
 *  // Print messages from the client.
 *  socket.on('pong', function (data) {
 *    console.log(data.msg.blue);
 *  });
 *
 *});
 */
