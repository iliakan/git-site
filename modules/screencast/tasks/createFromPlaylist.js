/* debug google api calls
require('axios-debug-log')({
  request: function (debug, config) {
    console.log("REQ", config);
  },
  response: function (debug, response) {
    console.log("RES", response);
  },
  error: function (debug, error) {
    // Read https://www.npmjs.com/package/axios#handling-errors for more info
    console.log('Boom', error);
  }
});
*/

let yaml = require('js-yaml');
let fs = require('fs');
let path = require('path');
let glob = require('glob');
const {google} = require('googleapis');
const GoogleToken = require('../models/token');
const Playlist = require('../models/playlist');
const Thumbnails = require('../models/thumbnails');
const Screencast = require('../models/screencast');
const PlaylistItem = require('../models/playlistItem');
const Video = require('../models/youtubeVideo');
const VideoChapter = require('../models/videoChapter');
const _ = require('lodash');
const log = require('jsengine/log')();
const execSync = require('child_process').execSync;
const readMeta = require('../lib/readMeta');
const playlistLib = require('../lib/playlistLib');

// TODO: prepare puts all in video-prepared, use it for upload

// ENABLED community contributions at
// https://www.youtube.com/timedtext_cs_queue?optin=true

// Youtube userId & channelId:
// find at https://support.google.com/youtube/answer/3250431?hl=en

let TEST = false;

module.exports = function() {

  // let playlistId = 'PLDDtRDqPGrIgqGSfeF2asqilfVMShetIf';
  // https://www.youtube.com/playlist?list=PLDyvV36pndZF-vwsVB48ivZyNJ4ETBKNY

  let args = require('yargs')
    .example('gulp screencast:upload --dir /path/to/meta')
    .demand(['dir'])
    .argv;

  return function() {

    return (async function() {
      let meta = readMeta(path.join(args.dir, 'meta.yml'));

      let youtube = google.youtube({
        version: 'v3',
        auth:    'AIzaSyBcEZxJ9hOI_N7Mfla2sEYLDzPbd8Jdx5g'
      });

      console.log("Playlist fetchItems");
      let items = await playlistLib.fetchItems(youtube, meta.playlist);

      // console.log(items);
      console.log("Playlist fetchItems done");

      for (let itemNo = 0; itemNo < items.length; itemNo++) {
        let item = items[itemNo];

        let num = 0;

        outer:
          for (let chapterSlug in meta.chapters) {
            let chapterMeta = meta.chapters[chapterSlug];

            for (let videoSlug in chapterMeta.videos) {
              let videoMeta = chapterMeta.videos[videoSlug];

              if (num === itemNo) {
                // videoMeta & item correspond to each other, let's update db video

                item.videoMeta = videoMeta;
                videoMeta.playlistItem = item;
                break outer;
              }

              num++;
            }
          }

        if (!item.videoMeta) {
          log.error("No videoMeta for item", item);
          throw new Error("No videoMeta for item");
        }
      }

      let screencast = await Screencast.findOne({
        slug: meta.slug
      });

      if (screencast) {
        await screencast.removeFull();
      }

      screencast = await Screencast.create({
        slug:  meta.slug,
        url:   meta.url,
        title: meta.title
      });

      log.debug("Created screencast", screencast);

      let chapterNum = 0;

      for (let chapterSlug in meta.chapters) {
        let chapterMeta = meta.chapters[chapterSlug];
        chapterNum++;

        let chapter = await VideoChapter.create({
          slug:       chapterSlug,
          screencast: screencast,
          title:      chapterMeta.title,
          weight:     chapterNum
        });

        let videoNum = 0;

        for (let videoSlug in chapterMeta.videos) {
          let videoMeta = chapterMeta.videos[videoSlug];
          videoNum++;

          log.debug("update videoMeta", videoMeta);
          let youtubeVideo = await youtube.videos.list({
            part: 'snippet,status,id',
            id:   videoMeta.playlistItem.snippet.resourceId.videoId
          });

          youtubeVideo = youtubeVideo.data.items[0];

          if (!youtubeVideo) {
            log.error("No youtube video for", videoMeta.playlistItem);
            throw new Error("No youtube video");
          }


          let video = await Video.create({
            slug:        videoSlug,
            chapter:     chapter,
            description: videoMeta.description,
            title:       videoMeta.title,
            weight:      videoNum,
            youtube:     youtubeVideo
          });

          log.debug("Created video", video);


        }
      }


    })();

  };


};
