let mongoose = require('jsengine/mongoose');
let Schema = mongoose.Schema;
let _ = require('lodash');
let Thumbnails = require('./thumbnails');


let schema = new Schema({
  id: String,
  etag: String,
  snippet: {
    publishedAt: Date,
    channelId: String,
    title: String,
    description: String,
    thumbnails: Thumbnails.schema,
    channelTitle: String,
    tags: [String],
    defaultLanguage: String,
    localized: {
      title: String,
      description: String
    }
  },
  status: {
    privacyStatus: String
  },
  contentDetails: {
    itemCount: Number
  },
  player: {
    embedHtml: String
  },
  localizations: {}
}, {timestamps: true});


module.exports = mongoose.model('YoutubePlaylist', schema);
