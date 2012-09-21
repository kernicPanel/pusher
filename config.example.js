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

config.auth = {
  url: 'auth.url',
  path: '/path',
  ids: 'get.instances.url'
};

config.ids = {
  url: 'api.url',
  path: '/path/to/instances',
  getName: 'name'
};

module.exports = config;
