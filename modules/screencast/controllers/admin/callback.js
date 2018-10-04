'use strict';

const path = require('path');
const config = require('config');
const fs = require('mz/fs');
const {google} = require('googleapis');
const makeOauthClient = require('../../lib/makeOauthClient');

const GoogleToken = require('../../models/token');

exports.get = async function(ctx, next) {


  const oauth2Client = makeOauthClient();

  let token = await oauth2Client.getToken(ctx.query.code);

  token = token.tokens;

  await GoogleToken.remove({user: ctx.user});
  await GoogleToken.create({
    user: ctx.user,
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    token_type: token.token_type,
    expiry_date: new Date(token.expiry_date)
  });

  ctx.body = token;

};
