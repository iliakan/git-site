let mongoose = require('jsengine/mongoose');
let Schema = mongoose.Schema;
let _ = require('lodash');

let thumbnailSchema = exports.thumbnailSchema = new Schema({
  url: String,
  width: Number,
  height: Number
});

let thumbnailsSchema = new Schema({
  default: thumbnailSchema,
  medium: thumbnailSchema,
  high: thumbnailSchema,
  standard: thumbnailSchema,
  maxres: thumbnailSchema
});


module.exports = mongoose.model('YoutubeThumbnails', thumbnailsSchema);
