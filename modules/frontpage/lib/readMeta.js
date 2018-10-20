
let yaml = require('js-yaml');
let fse = require('fs-extra');
let fs = require('fs');
const path = require('path');
const _ = require('lodash');

function readKeywords(keywords) {
  if (!keywords) {
    return [];
  }
  if (typeof keywords == 'string') {
    keywords = keywords.split(/\s*,\s*/g);
  }

  return keywords;
}


module.exports = function(pathToMeta) {

  let meta = yaml.safeLoad(fs.readFileSync(pathToMeta, 'utf8'));

  if (!meta.thumbnail) {
    meta.thumbnail = {}; // default (nothing)
  }

  let chapterNum = 0;

  for (let chapterSlug in meta.chapters) {
    let chapterMeta = meta.chapters[chapterSlug];
    chapterNum++;

    Object.setPrototypeOf(chapterMeta, meta);

    let videoNum = 0;

    for (let videoSlug in chapterMeta.videos) {
      let videoMeta = chapterMeta.videos[videoSlug];

      Object.setPrototypeOf(videoMeta, chapterMeta);

      videoNum++;

      videoMeta.keywordsFull = _.uniq(_.flattenDeep([].concat(readKeywords(meta.keywords), readKeywords(chapterMeta.keywords), readKeywords(videoMeta.keywords))));

      videoMeta.titleFull = _.uniq([
        meta.title,
        chapterMeta.title,
        videoMeta.title
      ]).join(' – ');

      videoMeta.titleFull = (meta.levels === 2 ? (chapterNum + '.') : '') + videoNum + ' ' + videoMeta.titleFull;

      videoMeta.slugFull = _.uniq([
        chapterSlug,
        videoSlug || 'starting-video'
      ]).join('-');

      videoMeta.descriptionFull = _.uniq([
        meta.description,
        chapterMeta.description,
        videoMeta.description
      ]).join('\n\n');

      videoMeta.filePattern = '??-??-' + [chapterSlug, videoSlug].filter(Boolean).join('-') + '.mp4';

    }
  }

  return meta;
};
