let mongoose = require('jsengine/mongoose');
let Schema = mongoose.Schema;
let _ = require('lodash');

let schema = new Schema({
  video: {
    type:  Schema.Types.ObjectId,
    ref: 'YoutubeVideo'
  },
  youtube: {
    id: String,
    snippet: {
      publishedAt: Date,
      channelId: String,
      title: String,
      description: String,
      playlistId: String,
      position: Number,
      resourceId: {
        kind: String,
        videoId: String,
      }
    },
    contentDetails: {
      videoId: String,
      startAt: String,
      endAt: String,
      note: String,
      videoPublishedAt: Date
    },
    status: {
      privacyStatus: String
    }
  }
}, {timestamps: true});

module.exports = mongoose.model('YoutubePlaylistItem', schema);
