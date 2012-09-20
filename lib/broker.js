#!/usr/bin/env node

var amqp = require('amqp');
var broker = {};

console.log("amqp : ", amqp);
broker.init = function(server, callback) {

/* */
  var options = server.config.amqp.options;
  console.log("amqp host : ".red.inverse, options.host);
  //var connection = amqp.createConnection(options);
  //var connection = amqp.createConnection(options, { defaultExchangeName: 'bus_me' });
  var connection = amqp.createConnection({ host: 'dev.rabbitmq.com' });
  //var connection = amqp.createConnection({ host: 'www.bus-it.com' });

  console.log("connection : ", connection._events);

  connection.on('close', function (data) {
    //console.log("connection : ", connection);
    console.log("close : ", data.toString());
  });


  connection.on('error', function (data) {
    //console.log("connection : ", connection);
    console.log("error : ", data.toString());
  });

  connection.on('ready', function () {
    console.log("ready : ".red.inverse);
  });


connection.on('connect', function (data) {
  console.log("connection._events connect : ", connection._events);
  console.log("connect : ", data);
  var chunks = '';
  connection.on('data', function (data) {
    //console.log("connection._events data : ".blue, connection._events);
    //console.log("data : ", data.toString());
    chunks += data;
  });

  connection.on('end', function () {
    console.log("end : ", chunks.toString());
  });

  var queue = connection.queue('realtime', function(q){
    console.log("q : ", q);
  });
  //console.log("queue : ".red, queue);
  queue.connection.on('ready', function () {
    console.log("ready : ".red);
  });

  // Wait for connection to become established.
  connection.on('ready', function () {
    console.log("ready : ".red);
    console.log("connection._events : ".blue, connection._events);
    var queue = connection.queue('realtime', function(q){
      console.log("queue : ", queue);
      console.log("realtime : ");
      // Catch all messages
      q.bind('#');

      // Receive messages
      q.subscribe(function (message) {
        console.log("message : ");
        // Print messages to stdout
        console.log(message);
      });
    });
  });
});
//
  // Wait for connection to become established.
  connection.on('ready', function () {
    console.log("ready : ".red.inverse);
    console.log("connection._events : ".blue, connection._events);
    var queue = connection.queue('realtime', function(q){
      console.log("queue : ", queue);
      console.log("realtime : ");
      // Catch all messages
      q.bind('#');

      // Receive messages
      q.subscribe(function (message) {
        console.log("message : ");
        // Print messages to stdout
        console.log(message);
      });
    });
  });




/* * /

var http = require('http');
//var amqp = require('amqp');
var URL = require('url');
var htmlEscape = require('sanitizer/sanitizer').escape;

function rabbitUrl() {
  if (process.env.VCAP_SERVICES) {
    conf = JSON.parse(process.env.VCAP_SERVICES);
    return conf['rabbitmq-2.4'][0].credentials.url;
  }
  else {
    return "amqp://dev.rabbitmq.com";
  }
}

var port = process.env.VCAP_APP_PORT || 3000;

var messages = [];

function setup() {
  console.log("setup : ");

  var exchange = conn.exchange('cf-demo', {'type': 'fanout', durable: false}, function() {

    var queue = conn.queue('realtime', {durable: false, exclusive: true},
    function() {
      queue.subscribe(function(msg) {
        messages.push(htmlEscape(msg.body));
        if (messages.length > 10) {
          messages.shift();
        }
      });
      queue.bind(exchange.name, '');
    });
    queue.on('queueBindOk', function() { httpServer(exchange); });
  });
}

function httpServer(exchange) {
  var serv = http.createServer(function(req, res) {
    var url = URL.parse(req.url);
    if (req.method == 'GET' && url.pathname == '/env') {
      printEnv(res);
    }
    else if (req.method == 'GET' && url.pathname == '/') {
      res.statusCode = 200;
      openHtml(res);
      writeForm(res);
      writeMessages(res);
      closeHtml(res);
    }
    else if (req.method == 'POST' && url.pathname == '/') {
      chunks = '';
      req.on('data', function(chunk) { chunks += chunk; });
      req.on('end', function() {
        msg = unescapeFormData(chunks.split('=')[1]);
        exchange.publish('', {body: msg});
        res.statusCode = 303;
        res.setHeader('Location', '/');
        res.end();
      });
    }
    else {
      res.statusCode = 404;
      res.end("This is not the page you were looking for.");
    }
  });
  serv.listen(port);
}

console.log("Starting ... AMQP URL: " + rabbitUrl());
var conn = amqp.createConnection({url: rabbitUrl()});
conn.on('ready', setup);

// ---- helpers

function openHtml(res) {
  res.write("<html><head><title>Node.js / RabbitMQ demo</title></head><body>");
}

function closeHtml(res) {
  res.end("</body></html>");
}

function writeMessages(res) {
  res.write('<h2>Messages</h2>');
  res.write('<ol>');
  for (i in messages) {
    res.write('<li>' + messages[i] + '</li>');
  }
  res.write('</ol>');
}

function writeForm(res) {
  res.write('<form method="post">');
  res.write('<input name="data"/><input type="submit"/>');
  res.write('</form>');
}

function printEnv(res) {
  res.statusCode = 200;
  openHtml(res);
  for (entry in process.env) {
    res.write(entry + "=" + process.env[entry] + "<br/>");
  }
  closeHtml(res);
}

function unescapeFormData(msg) {
  return unescape(msg.replace('+', ' '));
}

/* */
};

module.exports = broker;
