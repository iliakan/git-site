const config = require('config');

const t = require('jsengine/i18n/t');

module.exports = function(template, locals) {
  locals = locals ? Object.create(locals) : {};
  addStandardHelpers(locals);

  return template(locals);
};

function addStandardHelpers(locals) {
  locals.t = t;
  locals.lang = config.lang;
  locals.env = config.env;
}

