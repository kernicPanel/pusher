var config = {};

config.amqp = {};

config.amqp.options = {
  host: 'rabbit.host',
  ssl: true,
  port: '5672',
  login: 'login',
  password: 'password',
  vhost: ''
};

module.exports = config;
