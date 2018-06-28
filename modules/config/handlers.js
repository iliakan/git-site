'use strict';

const path = require('path');
const fs = require('fs');

let handlers = [
  'static',
  'requestId',
  'requestLog',
  'nocache',

  // this middleware adds this.render method
  // it is *before errorHandler*, because errors need this.render
  'render',

  // errors wrap everything
  'errorHandler',

  // this logger only logs HTTP status and URL
  // before everything to make sure it log all
  'accessLogger',

  // before anything that may deal with body
  // it parses JSON & URLENCODED FORMS,
  // it does not parse form/multipart
  'bodyParser',

  // parse FORM/MULTIPART
  // (many tweaks possible, lets the middleware decide how to parse it)
  'multipartParser',

  // right after parsing body, make sure we logged for development
  'verboseLogger',

  'conditional',

  process.env.NODE_ENV=='development' && 'dev'
].filter(Boolean);

module.exports = handlers;
