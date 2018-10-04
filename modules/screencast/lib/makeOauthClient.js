
const config = require('config');
const {google} = require('googleapis');

module.exports = function() {
  return new google.auth.OAuth2(
    config.auth.providers.google.appId,
    config.auth.providers.google.appSecret,
    new URL('/screencast/admin/callback', config.urlBase.main).href
  );
};

