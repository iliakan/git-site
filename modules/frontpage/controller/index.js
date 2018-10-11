'use strict';

const Chapter = require('screencast/models/videoChapter');
const YoutubeVideo = require('screencast/models/youtubeVideo');

exports.get = async function(ctx, next) {

  const sections = await Chapter.find({}).populate({
    path: 'videos'
  });

  ctx.locals.sections = sections;

  ctx.body = ctx.render('index');
};
