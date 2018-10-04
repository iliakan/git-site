let Router = require('koa-router');

let auth = require('./controllers/admin/auth');
let callback = require('./controllers/admin/callback');

let router = module.exports = new Router();

router.get('/admin/auth', auth.get);
router.get('/admin/callback', callback.get);
