// make sure Promise is wrapped early,
// to assign mongoose.Promise = global.Promise the wrapped variant any time later
let path = require('path');
let fs = require('fs-extra');
let env = process.env;
let yaml = require('js-yaml');

// NODE_ENV = development || test || production
env.NODE_ENV = env.NODE_ENV || 'development';

//if (!env.SITE_HOST) throw new Error("env.SITE_HOST is not set");
//if (!env.STATIC_HOST) throw new Error("env.STATIC_HOST is not set");

let secret = require('./secret');

let lang = env.NODE_LANG || 'en';

require('util').inspect.defaultOptions.depth = 3;

if (env.DEV_TRACE) {
  Error.stackTraceLimit = 100000;
  require('trace');
  require('clarify');
}

let config = module.exports = {
  // production domain, for tutorial imports, descriptions, etc
  // for the places where in-dev we must use a real domain
  urlBase: {
    // node may be behind nginx, use this in documents
    main: new URL(env.URL_BASE_MAIN || env.URL_BASE || 'http://localhost:3000'),
    static: new URL(env.URL_BASE_STATIC || env.URL_BASE || 'http://localhost:3000'),
  },
  urlBaseProduction: {
    // when even in dev mode we must reference prod, use this (maybe remove it?)
    main: new URL(env.URL_BASE_PRODUCTION_MAIN || env.URL_BASE || 'http://localhost:3000'),
    static: new URL(env.URL_BASE_PRODUCTION_STATIC || env.URL_BASE || 'http://localhost:3000')
  },

  server: {
    port: env.PORT || 3000,
    host: env.HOST || 'localhost'
  },

  mongoose: require('./mongoose'),

  cloudflare: {
    url:    'https://www.cloudflare.com/api_json.html',
    apiKey: secret.cloudflare.apiKey,
    email:  secret.cloudflare.email
  },


  appKeys:  [secret.sessionKey],
  adminKey: secret.adminKey,

  lang:    lang,

  assetVersioning: env.ASSET_VERSIONING == 'file' ? 'file' :
                     env.ASSET_VERSIONING == 'query' ? 'query' : null,

  pug:   {
    basedir: path.join(process.cwd(), 'templates'),
    cache:   env.NODE_ENV != 'development'
  },

  disqus: {
    domain: lang == 'en' ? 'javascriptinfo' : 'learnjavascriptru'
  },

  projectRoot:           process.cwd(),
  // public files, served by nginx
  publicRoot:            path.join(process.cwd(), 'public', lang),
  // private files, for expiring links, not directly accessible
  tmpRoot:               path.join(process.cwd(), 'tmp', lang),
  localesRoot:           path.join(process.cwd(), 'locales'),
  // js/css build versions
  cacheRoot:          path.join(process.cwd(), 'cache', lang),
  assetsRoot:            path.join(process.cwd(), 'assets'),

  handlers: require('./handlers')
};

require.extensions['.yml'] = function(module, filename) {
  module.exports = yaml.safeLoad(fs.readFileSync(filename, 'utf-8'));
};


const t = require('jsengine/i18n');
t.requireHandlerLocales();

config.webpack = require('./webpack');

createRoot(config.publicRoot);
createRoot(config.cacheRoot);
createRoot(config.tmpRoot);

function createRoot(root) {
  // may be existing symlink
  if (fs.existsSync(root) && fs.statSync(root).isFile()) {
    fs.unlinkSync(root);
  }
  if (!fs.existsSync(root)) {
    fs.ensureDirSync(root);
  }
}

