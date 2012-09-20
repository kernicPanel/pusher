var config = {};

config.broker = {};

config.broker.options = {
  host: 'rabbit.host',
  ssl: true,
  port: 5672,
  login: 'logir',
  password: 'password',
  vhost: '/vhost'
};

module.exports = config;
