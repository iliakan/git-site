var Router = require('koa-router');

var glob = require('glob');
var path = require('path');
var router = module.exports = new Router();

router.get('/', async function (ctx) {
  ctx.body = this.render('index');

});
