let mongoose = require('jsengine/mongoose');
let Schema = mongoose.Schema;
let _ = require('lodash');

let schema = new Schema({
  slug: {
    type: String,
    required: true
  },

  title: {
    type: String,
    required: true
  },

  screencast: {
    type:     Schema.Types.ObjectId,
    ref:      'Screencast',
    required: true
  },

  weight: Number

}, {timestamps: true});


schema.virtual('videos', {
  ref: 'YoutubeVideo',
  localField: '_id',
  foreignField: 'chapter'
});


module.exports = mongoose.model('VideoChapter', schema);
