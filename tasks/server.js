let app = require('app');
let config = require('config');

module.exports = function() {
  return app.waitBootAndListen(config.server.host, config.server.port);
};

