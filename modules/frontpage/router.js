const Router = require('koa-router');
const router = module.exports = new Router();
const index = require('./controller/index');

router.get('/', index.get);
