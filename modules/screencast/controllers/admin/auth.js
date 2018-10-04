'use strict';

const path = require('path');
const config = require('config');
const fs = require('mz/fs');
const {google} = require('googleapis');
const makeOauthClient = require('../../lib/makeOauthClient');

// Use email with rights to channel
exports.get = async function(ctx, next) {

  const oauth2Client = makeOauthClient();

  if (!ctx.user) {
    ctx.throw(403);
  }

  if (!ctx.user.hasRole('teacher')) {
    ctx.throw(403, {info: "Not a teacher"});
  }

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // refresh_token is needed for gulp task, we get it only if user goes to "consent" page
    scope: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube'
    ]
  });

  ctx.redirect(url);
};
