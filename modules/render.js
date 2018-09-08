const config = require('config');
const t = require('jsengine/i18n');
const pluralize = require('jsengine/text-utils/pluralize');
const escapeHtml = require('escape-html');
const _ = require('lodash');

let Renderer = require('jsengine/koa/renderer');

class ExtendedRenderer extends Renderer {

  addStandardHelpers() {

    super.addStandardHelpers();

    let ctx = this.ctx;
    let locals = ctx.locals;

    locals.carbonEnabled = ctx.query.carbonEnabled !== undefined ? Boolean(ctx.query.carbonEnabled) : false;

    // || (ctx.host == config.domain.main && process.env.NODE_LANG == 'en' && process.env.NODE_ENV == 'production');

    locals.analyticsEnabled = ctx.query.analyticsEnabled !== undefined ? Boolean(ctx.query.analyticsEnabled) : (ctx.host == config.urlBase.main.host && process.env.NODE_ENV == 'production');
    // locals.adsenseEnabled = ctx.query.adsenseEnabled !== undefined ? Boolean(ctx.query.adsenseEnabled) :
    //   ctx.host == config.domain.main && process.env.NODE_ENV == 'production';

    locals.disqusEnabled = process.env.NODE_ENV == 'production';

    // we don't use defer in sessions, so can assign it
    // (simpler, need to call await this.session)
    locals.session = ctx.session;

    locals.escapeHtml = escapeHtml;

    locals.pluralize = pluralize;
    locals.ga = config.ga;
    locals.yandexMetrika = config.yandexMetrika;
    locals.recaptcha = config.recaptcha;

    locals.csrf = function() {
      // function, not a property to prevent autogeneration
      // pug touches all local properties
      return ctx.user ? ctx.csrf : null;
    };

    // locals.debug = true;
    // locals.compileDebug = true;

    // this.locals.debug causes pug to dump function
    /* jshint -W087 */
    locals.deb = function() {
      debugger; // eslint-disable-line
    };

    locals._ = _;

    locals.disqusDomain = config.disqus.domain;
    locals.disqusConfig = {
      url: locals.canonicalUrl,
      identifier: locals.canonicalPath,
      title: locals.headTitle || locals.title
    };

  }

}

// (!) this.render does not assign this.body to the result
// that's because render can be used for different purposes, e.g to send emails
exports.init = function(app) {
  app.use(async function(ctx, next) {

    let renderer = new ExtendedRenderer(ctx);
    /**
     * Render template
     * Find the file:
     *   if locals.useAbsoluteTemplatePath => use templatePath
     *   else if templatePath starts with /   => lookup in locals.basedir
     *   otherwise => lookup in ctx.templateDir (MW should set it)
     * @param templatePath file to find (see the logic above)
     * @param locals
     * @returns {String}
     */
    ctx.render = (templatePath, locals) => renderer.render(templatePath, locals);

    await next();
  });

};


