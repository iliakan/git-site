#!/usr/bin/env node

const config = require('config');
const app = require('jsengine/koa/app');
const log = require('jsengine/log')();

app.waitBootAndListen(config.server.host, config.server.port).then(() => {
  log.info("App is listening");
}).catch(function(err) {
  log.error(err);
  process.exit(1); // fatal error, could not boot!
});
