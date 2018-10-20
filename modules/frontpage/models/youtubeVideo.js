let mongoose = require('jsengine/mongoose');
let Schema = mongoose.Schema;
let _ = require('lodash');
let Thumbnails = require('./thumbnails');


let schema = new Schema({
  chapter: {
    type:  Schema.Types.ObjectId,
    ref: 'VideoChapter'
  },
  title: String,
  description: String,
  slug: String,
  weight: Number,
  duration: Number,

  youtube: {
    id: String,
    etag: String,
    snippet: {
      publishedAt: Date,
      channelId: String,
      title: String,
      description: String,
      thumbnails: Thumbnails.schema,
      channelTitle: String,
      tags: [
        String
      ],
      categoryId: String,
      liveBroadcastContent: String,
      defaultLanguage: String,
      localized: {
        title: String,
        description: String
      },
      defaultAudioLanguage: String
    },
    contentDetails: {
      duration: String,
      dimension: String,
      definition: String,
      caption: String,
      licensedContent: Boolean,
      regionRestriction: {
        allowed: [
          String
        ],
        blocked: [
          String
        ]
      },
      contentRating: {
        acbRating: String,
        agcomRating: String,
        anatelRating: String,
        bbfcRating: String,
        bfvcRating: String,
        bmukkRating: String,
        catvRating: String,
        catvfrRating: String,
        cbfcRating: String,
        cccRating: String,
        cceRating: String,
        chfilmRating: String,
        chvrsRating: String,
        cicfRating: String,
        cnaRating: String,
        cncRating: String,
        csaRating: String,
        cscfRating: String,
        czfilmRating: String,
        djctqRating: String,
        djctqRatingReasons: [
          String
        ],
        ecbmctRating: String,
        eefilmRating: String,
        egfilmRating: String,
        eirinRating: String,
        fcbmRating: String,
        fcoRating: String,
        fmocRating: String,
        fpbRating: String,
        fpbRatingReasons: [
          String
        ],
        fskRating: String,
        grfilmRating: String,
        icaaRating: String,
        ifcoRating: String,
        ilfilmRating: String,
        incaaRating: String,
        kfcbRating: String,
        kijkwijzerRating: String,
        kmrbRating: String,
        lsfRating: String,
        mccaaRating: String,
        mccypRating: String,
        mcstRating: String,
        mdaRating: String,
        medietilsynetRating: String,
        mekuRating: String,
        mibacRating: String,
        mocRating: String,
        moctwRating: String,
        mpaaRating: String,
        mpaatRating: String,
        mtrcbRating: String,
        nbcRating: String,
        nbcplRating: String,
        nfrcRating: String,
        nfvcbRating: String,
        nkclvRating: String,
        oflcRating: String,
        pefilmRating: String,
        rcnofRating: String,
        resorteviolenciaRating: String,
        rtcRating: String,
        rteRating: String,
        russiaRating: String,
        skfilmRating: String,
        smaisRating: String,
        smsaRating: String,
        tvpgRating: String,
        ytRating: String
      },
      projection: String,
      hasCustomThumbnail: Boolean
    },
    status: {
      uploadStatus: String,
      failureReason: String,
      rejectionReason: String,
      privacyStatus: String,
      publishAt: Date,
      license: String,
      embeddable: Boolean,
      publicStatsViewable: Boolean
    },
    statistics: {
      viewCount: Number,
      likeCount: Number,
      dislikeCount: Number,
      favoriteCount: Number,
      commentCount: Number
    },
    player: {
      embedHtml: String,
      embedHeight: Number,
      embedWidth: Number
    },
    topicDetails: {
      topicIds: [
        String
      ],
      relevantTopicIds: [
        String
      ],
      topicCategories: [
        String
      ]
    },
    recordingDetails: {
      locationDescription: String,
      location: {
        latitude: Number,
        Numberitude: Number,
        altitude: Number
      },
      recordingDate: Date
    },
    fileDetails: {
      fileName: String,
      fileSize: Number,
      fileType: String,
      container: String,
      videoStreams: [
        {
          widthPixels: Number,
          heightPixels: Number,
          frameRateFps: Number,
          aspectRatio: Number,
          codec: String,
          bitrateBps: Number,
          rotation: String,
          vendor: String
        }
      ],
      audioStreams: [
        {
          channelCount: Number,
          codec: String,
          bitrateBps: Number,
          vendor: String
        }
      ],
      durationMs: Number,
      bitrateBps: Number,
      creationTime: String
    },
    processingDetails: {
      processingStatus: String,
      processingProgress: {
        partsTotal: Number,
        partsProcessed: Number,
        timeLeftMs: Number
      },
      processingFailureReason: String,
      fileDetailsAvailability: String,
      processingIssuesAvailability: String,
      tagSuggestionsAvailability: String,
      editorSuggestionsAvailability: String,
      thumbnailsAvailability: String
    },
    suggestions: {
      processingErrors: [
        String
      ],
      processingWarnings: [
        String
      ],
      processingHints: [
        String
      ],
      tagSuggestions: [
        {
          tag: String,
          categoryRestricts: [
            String
          ]
        }
      ],
      editorSuggestions: [
        String
      ]
    },
    liveStreamingDetails: {
      actualStartTime: Date,
      actualEndTime: Date,
      scheduledStartTime: Date,
      scheduledEndTime: Date,
      concurrentViewers: Number,
      activeLiveChatId: String
    },
    localizations: {}
  }
}, {timestamps: true});

schema.methods.getDuration = function() {
  const duration = this.youtube.contentDetails.duration;
  let hours = duration.match(/(\d+)H/);
  let minutes = duration.match(/(\d+)M/);
  let seconds = duration.match(/(\d+)S/);
  if (hours) hours = hours[1] * 24 * 60;
  if (minutes) minutes = minutes[1] * 60;
  if (seconds) seconds = parseInt(seconds[1]);
  return (hours || 0) + (minutes || 0) + (seconds || 0);
};

schema.methods.displayDuration = function() {
  let time = this.getDuration();
  const hours = ('0' + Math.floor(time / (60 * 24))).slice(-2);
  const minutes = ('0' + Math.floor(time / 60)).slice(-2);
  const seconds = ('0' + (time % 60)).slice(-2);
  return (hours === '00' ? '' : hours + ':') + `${minutes}:${seconds}`;
}

schema.methods.getWeight = function() {
  return ('0' + this.weight).slice(-2);
}

module.exports = mongoose.model('YoutubeVideo', schema);
