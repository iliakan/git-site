let mongoose = require('jsengine/mongoose');
let Schema = mongoose.Schema;
let _ = require('lodash');
require('./videoChapter');

let schema = new Schema({
  slug: {
    type: String,
    required: true
  },

  url: {
    type: String,
    required: true
  },


  title: {
    type: String,
    required: true
  },

  weight: Number

}, {timestamps: true});


schema.virtual('chapters', {
  ref: 'VideoChapter',
  localField: '_id',
  foreignField: 'screencast'
});


schema.methods.removeFull = async function() {

  let Chapter = require('./videoChapter');
  let Video = require('./youtubeVideo');
  let PlaylistItem = require('./playlistItem');

  let chapters = await Chapter.find({screencast: this});
  let videos = await Video.find({
    chapter: {
      $in: chapters.map(c => c._id)
    }
  });

  for(let video of videos) {
    await PlaylistItem.remove({video: video});
    await video.remove();
  }

  for(let chapter of chapters) {
    await chapter.remove();
  }

  await this.remove();


};
module.exports = mongoose.model('Screencast', schema);
