let Spinner = require('client/spinner');

function init() {
  initPlayer();
  initTabs();
  initShareButtons();
}

function initPlayer() {
  const VideoPlayer = require('client/videoPlayer');
  new VideoPlayer();
}

function initShareButtons() {
  const buttons = document.querySelectorAll('.share-buttons__button');
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    button.addEventListener('click', e => {
      e.preventDefault();
      window.open(button.getAttribute('href'), 'newwindow', 'width=400,height=400');
    })
  }
}

function initTabs() {
  const tabs = document.querySelectorAll(".screencast-tabs__tab");
  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i];
    tab.addEventListener('click', () => {
      if (tab.classList.contains('active')) return;
      setActiveTab(tab.getAttribute('data-id'));
      if (tab.getAttribute('data-id') === 'comments') {
        if (document.querySelector(`script[src="${disqusEmbedUrl}"]`)) {
          // already loaded or loading
          return;
        }
        let disqusElem = document.getElementById('disqus_thread');
        if (disqusElem) {
          if (disqusElem.hasChildNodes()) return;
          loadDisqus();
        }
      }
    });
  }
}

function setActiveTab(id) {
  document.querySelector('.screencast-tabs__tab.active').classList.remove('active');
  document.querySelector('.screencast-tabmodules__module.active').classList.remove('active');
  [].forEach.call(document.querySelectorAll(`[data-id='${id}']`), el => el.classList.add('active'));
}

let requestAnimationFrameId;

let disqusEmbedUrl = '//' + window.disqus_shortname + '.disqus.com/embed.js';

let TABLET_WIDTH = 900;
let playlist = document.querySelector('.playlist');
let playlistModule = document.querySelector('.screencast-tabmodules__module_playlist');
let playlistMainContainer = document.querySelector('.page__nav');

// don't handle onscroll more often than animation
function onWindowScrollAndResizeThrottled() {
  if (requestAnimationFrameId) return;

  requestAnimationFrameId = window.requestAnimationFrame(function() {
    onWindowScrollAndResize();
    requestAnimationFrameId = null;
  });
}

window.addEventListener('resize-internal', onWindowScrollAndResizeThrottled);
window.addEventListener('scroll', onWindowScrollAndResizeThrottled);
window.addEventListener('resize', onWindowScrollAndResizeThrottled);

if (document.readyState == 'loading') {
  document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
} else {
  onWindowScrollAndResizeThrottled();
}

function onWindowScrollAndResize() {
  setUserScaleIfTablet();
  movePlaylistIfTablet();
}

function movePlaylistIfTablet() {
  let isTablet = document.documentElement.clientWidth <= TABLET_WIDTH;
  if (isTablet && playlist.parentElement.classList.contains('page__nav')) {
    playlistModule.appendChild(playlist).classList.add('screencast-tabmodules__module_active');
    setActiveTab('playlist');
  } else if (!isTablet && playlist.parentElement.classList.contains('screencast-tabmodules__module')) {
    playlistMainContainer.appendChild(playlist);
    setActiveTab('description');
  }
}

function setUserScaleIfTablet() {
  let isTablet = document.documentElement.clientWidth <= TABLET_WIDTH;
  let content = document.querySelector('meta[name="viewport"]').content;
  content = content.replace(/user-scalable=\w+/, 'user-scalable=' + (isTablet ? 'yes' : 'no'));
  document.querySelector('meta[name="viewport"]').content = content;
}

function loadDisqus() {
  let disqusElem = document.getElementById('disqus_thread');

  if (disqusElem.classList.contains('disqus-loading')) {
    return;
  }

  disqusElem.classList.add('disqus-loading');
  let spinner = new Spinner({
    size: 'large'
  });
  disqusElem.append(spinner.elem);
  spinner.start();

  let s = document.createElement('script');
  s.src = disqusEmbedUrl;
  s.setAttribute('data-timestamp', +new Date());
  document.head.appendChild(s);
  s.onload = () => {
    spinner.stop();
    spinner.elem.remove();
  };
}


init();

