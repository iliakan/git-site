module.exports = class VideoPlayer {
  constructor() {
    this.playerEl = document.querySelector('.video-container');
    this.currentVideoIdEl = document.querySelector('.video-panel__video-id');
    this.currentVideoTitleEl = document.querySelector('.video-panel__video-name');
    this.playerLine = document.querySelector('.video-panel__played');
    this.activeLine = document.querySelector('.video-panel__activeline');
    this.buildPlaylist();
    
    let mnemo = window.location.hash;
    if (mnemo) {
      mnemo = mnemo.slice(1);
      let elem = document.querySelector(`[data-mnemo='${mnemo}']`);
      if (elem) {
        this.setCurrentVideo(elem.getAttribute('data-video-id'));
      }
    } else this.setCurrentVideo(this.playlist[0].videoId);
  }

  bindHandlers() {
    this.bindLinkHandlers();
    this.bindTooltipHandlers();
    this.bindControlHandlers();
  }

  bindLinkHandlers() {
    this.playlist.map(item => {
      item.el.onclick = (e) => {
        e.preventDefault();
        this.setCurrentVideo(item.videoId);
      };
    });
  }

  bindControlHandlers() {
    const prev = document.querySelector('.prev');
    const next = document.querySelector('.next');
    const play = document.querySelector('.play');
    const pause = document.querySelector('.pause');

    prev.addEventListener('click', () => {
      const prevVideoId = this.getPrevVideoId();
      this.setCurrentVideo(prevVideoId);
    });

    next.addEventListener('click', () => {
      const nextVideoId = this.getNextVideoId();
      this.setCurrentVideo(nextVideoId);
    });

    play.addEventListener('click', () => this.player.playVideo());

    pause.addEventListener('click', () => this.player.pauseVideo());

    this.activeLine.addEventListener('click', e => {
      const clickWidth = e.pageX - this.playerLine.getBoundingClientRect().left;
      this.playerLine.style.width = clickWidth + "px";
      this.player.seekTo(this.nowPlaying.duration / 100 * (clickWidth * 100 / this.activeLine.offsetWidth));
    })
  }

  bindTooltipHandlers() {
    const activeLine = document.querySelector('.video-panel__activeline');
    const hoverLine = document.querySelector('.video-panel__hoverline');
    const tooltip = document.querySelector(".video-panel__tooltip");

    activeLine.addEventListener('mousemove', (e) => {
      let left = e.pageX - activeLine.getBoundingClientRect().left;
      const maxLeft = activeLine.offsetWidth - tooltip.offsetWidth;
      hoverLine.style.width = left + 'px';
      if (left >= maxLeft) left = maxLeft;
      tooltip.style.left = left + 'px';
      let fullSeconds = Math.floor((e.pageX - activeLine.getBoundingClientRect().left) / activeLine.offsetWidth * this.nowPlaying.duration);
      let minutes = ('0' + Math.floor(fullSeconds / 60)).slice(-2);
      let seconds = ('0' + fullSeconds % 60).slice(-2);
      tooltip.innerHTML = `${minutes}:${seconds}`;
    });
    activeLine.addEventListener('mouseleave', () => {
      hoverLine.style.width = 0 + 'px';
    })
  }

  onPlayHandler() {
    if (this.req) window.cancelAnimationFrame(this.req);
    this.drawPlayedLine.call(this);
    this.playerEl.classList.add("video-container_playing");
  }

  onPauseHandler() {
    window.cancelAnimationFrame(this.req);
    this.playerEl.classList.remove("video-container_playing");
  }

  getNextVideoId() {
    const nextVideo = this.playlist.reduce((res, item, i) => {
      let x = this.nowPlaying === item ? ++i : 0;
      return res + x;
    }, 0);
    return this.playlist[nextVideo <= this.playlist.length - 1 ? nextVideo : this.playlist.length - 1].videoId;
  }

  getPrevVideoId() {
    const prevVideo = this.playlist.reduce((res, item, i) => {
      let x = this.nowPlaying === item ? --i : 0;
      return res + x;
    }, 0);
    return this.playlist[prevVideo >= 0 ? prevVideo : 0].videoId;
  }

  onStateChangeHandler(event) {
    switch (event.data) {
      case 0:
        const nextVideoId = this.getNextVideoId();
        if (nextVideoId === this.nowPlaying.videoId) this.player.stopVideo();
        else this.setCurrentVideo(nextVideoId);
        break;
      case 1:
      case 3:
        this.onPlayHandler();
        break;
      case 2:
        this.onPauseHandler();
        break;
    }
  }

  setCurrentVideo(videoId) {
    this.nowPlaying = this.playlist.filter(el => el.videoId === videoId)[0];
    this.currentVideoIdEl.innerHTML = this.nowPlaying.weight;
    this.currentVideoTitleEl.innerHTML = this.nowPlaying.title;
    window.location.hash = this.nowPlaying.mnemo;
    const activeVideo = document.querySelector('.playlist-item_active');
    if (activeVideo) activeVideo.classList.remove('playlist-item_active');
    const currentVideo = document.querySelector(`[data-video-id='${this.nowPlaying.videoId}']`);
    if (currentVideo) currentVideo.classList.add('playlist-item_active');
    if (!this.player) {
      this.initYouTubePlayer();
    } else this.player.loadVideoById(videoId);
    this.bindTooltipHandlers();
  }

  buildPlaylist() {
    this.playlist = [];
    const links = document.querySelectorAll('.playlist-item[data-video-id]');
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const videoId = link.getAttribute('data-video-id');
      this.playlist.push({
        weight: link.querySelector('.playlist-item__id').innerHTML,
        videoId,
        title: link.querySelector('.playlist-item__name').innerHTML,
        href: '//www.youtube.com/watch?v=' + link.getAttribute('data-video-id'),
        el: link,
        mnemo: link.getAttribute('data-mnemo'),
        duration: link.getAttribute('data-duration')
      });
    }
  }

  drawPlayedLine() {
    const playedTime = this.player.getCurrentTime();
    const percent = playedTime / this.nowPlaying.duration;
    const width = this.activeLine.offsetWidth * percent;
    this.playerLine.style.width = `${width}px`;
    if (width < this.activeLine.offsetWidth) {
      this.req = requestAnimationFrame(this.drawPlayedLine.bind(this));
    }
  }

  getVideoSize() {
    // Git screencast video ratio
    const RATIO = 0.5625;
    const playerEl = document.getElementById('player');
    this.currentWidth = playerEl.offsetWidth;
    this.currentHeight = this.currentWidth * RATIO;
  }

  initYouTubePlayer() {
    if (!window.YT) {
      let iframeApiScript = document.createElement('script');
      iframeApiScript.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(iframeApiScript);

      window.onYouTubeIframeAPIReady = () => {
        initPlayer.call(this);
        delete window.onYouTubeIframeAPIReady;
      };
    } else {
      initPlayer.call(this);
    }

    function initPlayer() {
      if (this.player) {
        this.player.destroy();
      }

      this.getVideoSize();

      this.player = new window.YT.Player('player', {
        height:  this.currentHeight,
        width:   this.currentWidth,
        videoId: this.nowPlaying.videoId,
        playerVars: {rel: 0, controls: 0, showinfo: 0},
        events:  {
          onReady: () => {
            this.currentVideoIdEl.innerHTML = this.nowPlaying.weight;
            this.currentVideoTitleEl.innerHTML = this.nowPlaying.title;
            this.bindHandlers();
            if (window.location.hash) {
              let elem = document.querySelector(`[data-mnemo='${this.nowPlaying.mnemo}']`);
              if (elem) {
                elem.scrollIntoView({ behavior: 'smooth' });
              }
            }
          },
          onStateChange: this.onStateChangeHandler.bind(this)
        }
      });
    }
  }

};
