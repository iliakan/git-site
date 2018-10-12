'use strict';

const Chapter = require('../models/videoChapter');
const YoutubeVideo = require('../models/youtubeVideo');
const t = require('jsengine/i18n');

exports.get = async function(ctx, next) {

  const sections = await Chapter.find({}).populate({
    path: 'videos'
  });

  ctx.locals.sections = sections;

  ctx.locals.title = t('title');

  ctx.locals.languages = [
    {
      name: 'English',
      nameLocal: 'English',
      nameShort: 'EN',
      href: 'https://git-site.com'
    },
    {
      name: 'Russian',
      nameLocal: 'Русский',
      nameShort: 'RU',
      href: 'https://git-site.ru'
    }
  ];

  ctx.body = ctx.render('index');
};
