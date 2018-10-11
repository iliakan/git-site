module.exports = class VideoPlayer {

  constructor(options) {
    this.videoId = options.videoId;
    this.onClose = options.onClose;
    // sizes from https://developers.google.com/youtube/iframe_api_reference
    this.sizeList = [
      {width: 0, height: 0}, // mobile screens lower than any player => new window
      {width: 640, height: 360},
      {width: 853, height: 480},
      {width: 1280, height: 720}
    ];
  }

  getVideoThumbnail() {
    return 'https://img.youtube.com/vi/' + this.videoId + '/hqdefault.jpg';
  }

  openVideo() {
    let i = 0;

    for (i; i < this.sizeList.length; i++) {
      if (document.documentElement.clientHeight < this.sizeList[i].height ||
          document.documentElement.clientWidth < this.sizeList[i].width) break;
    }
    i--;

    this.currentWidth = this.sizeList[i].width;
    this.currentHeight = this.sizeList[i].height;

    if (i === 0) {
      window.location.href = '//www.youtube.com/watch?v=' + this.videoId;
    } else {
      let modal = new Modal();
      modal.setContent(
          `<div id="player"></div>`
      );

      modal.elem.addEventListener('modal-remove', () => {
        if (this.player) {
          this.player.destroy();
          this.player = null;
        }
        if (this.onClose) this.onClose.call(this);
      });

      if (!window.YT) {
        let iframeApiScript = document.createElement('script');
        iframeApiScript.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(iframeApiScript);

        window.onYouTubeIframeAPIReady = () => {
          this.initPlayer();
          delete window.onYouTubeIframeAPIReady;
        };
      } else {
        this.initPlayer();
      }

    }
    // <iframe width="${width}" height="${height}" src="//www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>

  }

  initPlayer() {
    if (this.player) {
      this.player.destroy();
    }

    this.player = new window.YT.Player('player', {
      height:  this.currentHeight,
      width:   this.currentWidth,
      videoId: this.videoId,
      playerVars: {rel: 0},
      events:  {
        onReady: () => {
          this.player.playVideo();
        },
        onStateChange: this.onStateChangeHandler.bind(this)
      }
    });
  }

  onStateChangeHandler(event) {
    window.focus();
    if (event.data == 1) { // start
      this.player.videoId = this.videoId;
    }

    if (event.data == 0) { // end
      let videoLinks = document.querySelectorAll('[data-video-id]');
      for (let i = 0; i < videoLinks.length; i++) {
        let videoLink = videoLinks[i];
        if (videoLink.getAttribute('data-video-id') == this.player.videoId) {
          let nextVideoId = videoLinks[i + 1] && videoLinks[i + 1].getAttribute('data-video-id');
          if (nextVideoId) {
            if (videoLinks[i + 1].parentNode.dataset.mnemo) {
              window.location.hash = videoLinks[i + 1].parentNode.dataset.mnemo;
            }
            this.videoId = nextVideoId;
            this.initPlayer();
          }
          break;
        }
      }
    }
  }
}


