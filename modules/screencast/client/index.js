// require('./styles');

let clientRender = require('client/clientRender');
let newsletter = require('newsletter/client');
let gaHitCallback = require('gaHitCallback');

function init() {
  initList();

  initNewsletterForm();

  let mnemo = window.location.hash;
  if (!mnemo) return;

  if (mnemo) mnemo = mnemo.slice(1);
  let elem = document.querySelector(`[data-mnemo="${mnemo}"]`);
  if (elem) {
    elem.scrollIntoView();
    window.ga('send', 'event', window.SCREENCAST_SLUG, 'open', mnemo);
    let videoId = elem.firstElementChild.dataset.videoId;
    openVideo(videoId);
  }

}


function initNewsletterForm() {

  let form = document.querySelector('[data-newsletter-subscribe-form]');
  if (!form) return;

  form.onsubmit = function(event) {
    event.preventDefault();
    newsletter.submitSubscribeForm(form);
  };

}

function initList() {
  let lis = document.querySelectorAll('li[data-mnemo]');

  /*
  for (let i = 0; i < lis.length; i++) {
    let li = lis[i];
    let mnemo = li.getAttribute('data-mnemo');

    li.insertAdjacentHTML(
      'beforeEnd',

      '<div class="lessons-list__download">' +
      '<div class="lessons-list__popup">' +
      '<ul class="lessons-list__popup-list">' +
      '<li class="lessons-list__popup-item">' +
      '<a data-track-outbound href="/screencast/' + window.SCREENCAST_SLUG + '/mp4-low/' +
      mnemo + '.mp4">Компактный размер</a>' +
      '</li>' +

      '<li class="lessons-list__popup-item">' +
      '<a data-track-outbound href="/screencast/' + window.SCREENCAST_SLUG + '/mp4/' +
      mnemo + '.mp4">Высокое качество</a>' +
      '</li>' +
      '</ul>' +
      '</div>' +
      '</div>'
    );
  }
  */

  let links = document.querySelectorAll('a[data-video-id]');
  for (let i = 0; i < links.length; i++) {
    let link = links[i];
    link.href = '//www.youtube.com/watch?v=' + link.getAttribute('data-video-id');

    link.onclick = function(e) {
      e.preventDefault();
      let videoId = this.getAttribute('data-video-id');
      let mnemo = this.parentNode.dataset.mnemo;
      window.ga('send', 'event', window.SCREENCAST_SLUG, 'open', mnemo);
      window.location.hash = mnemo;
      openVideo(videoId);
    };
  }
}


let player;

function openVideo(videoId) {
  // sizes from https://developers.google.com/youtube/iframe_api_reference
  let sizeList = [
    {width: 0, height: 0}, // mobile screens lower than any player => new window
    {width: 640, height: 360},
    {width: 853, height: 480},
    {width: 1280, height: 720}
  ];
  let i = 0;

  for (i; i < sizeList.length; i++) {
    if (document.documentElement.clientHeight < sizeList[i].height ||
      document.documentElement.clientWidth < sizeList[i].width) break;
  }
  i--;

  let width = sizeList[i].width;
  let height = sizeList[i].height;

  if (i === 0) {
    window.location.href = '//www.youtube.com/watch?v=' + videoId;
  } else {

    let modal = new Modal();
    modal.setContent(
      `<div id="player"></div>`
    );

    modal.elem.addEventListener('modal-remove', function() {
      if (player) {
        player.destroy();
        player = null;
      }
    });


    if (!window.YT) {
      let iframeApiScript = document.createElement('script');
      iframeApiScript.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(iframeApiScript);

      window.onYouTubeIframeAPIReady = function() {
        initPlayer(videoId, width, height);
        delete window.onYouTubeIframeAPIReady;
      };
    } else {
      initPlayer(videoId, width, height);
    }

  }
  // <iframe width="${width}" height="${height}" src="//www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>


}


function initPlayer(videoId, width, height) {


  if (player) {
    player.destroy();
  }

  player = new window.YT.Player('player', {
    height:  height,
    width:   width,
    videoId: videoId,
    playerVars: {rel: 0},
    events:  {
      onReady:       function() {
        player.playVideo();
      },
      onStateChange: function(event) {
        let videoIds = document.querySelectorAll('[data-video-id]');
        if (event.data == 1) { // start
          player.videoId = videoId;
        }

        if (event.data == 0) { // end
          let videoLinks = document.querySelectorAll('[data-video-id]');
          for (let i = 0; i < videoLinks.length; i++) {
            let videoLink = videoLinks[i];
            if (videoLink.getAttribute('data-video-id') == player.videoId) {
              let nextVideoId = videoLinks[i + 1] && videoLinks[i + 1].getAttribute('data-video-id');
              if (nextVideoId) {
                if (videoLinks[i + 1].parentNode.dataset.mnemo) {
                  window.location.hash = videoLinks[i + 1].parentNode.dataset.mnemo;
                }
                initPlayer(nextVideoId, width, height);
              }
              break;
            }
          }
        }
      }
    }
  });
}


init();
