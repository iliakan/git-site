let mongoose = require('jsengine/mongoose');
let Schema = mongoose.Schema;
let _ = require('lodash');
const {google} = require('googleapis');
const config = require('config');
const log = require('jsengine/log')();

let schema = new Schema({
  email: String,
  access_token:  String,
  refresh_token: String,
  token_type:    String,
  expiry_date:   Date
}, {timestamps: true});


schema.statics.makeOauthClient = async function (userEmail) {

  if (!userEmail) {
    throw new Error("No email");
  }

  let token = await GoogleToken.findOne({
    email
  });

  if (!token) {
    throw new Error("No token for the user " + user._id);
  }

  const oauth2Client = new google.auth.OAuth2(
    config.auth.providers.google.appId,
    config.auth.providers.google.appSecret,
    new URL('/screencast/admin/callback', config.urlBase.main).href
  );
  oauth2Client.setCredentials(token);

  log.debug("refreshing token");
  const tokens = await oauth2Client.refreshAccessToken();

  token = tokens.credentials;

  await GoogleToken.remove({user});
  await GoogleToken.create({
    user,
    access_token:  token.access_token,
    refresh_token: token.refresh_token,
    token_type:    token.token_type,
    expiry_date:   new Date(token.expiry_date)
  });

  log.debug("refreshed token");
  return oauth2Client;
};


let GoogleToken = module.exports = mongoose.model('GoogleToken', schema);
