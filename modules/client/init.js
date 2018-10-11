
let links = document.querySelectorAll('.playlist-item[data-video-id]');
for (let i = 0; i < links.length; i++) {
  let link = links[i];
  link.href = '//www.youtube.com/watch?v=' + link.getAttribute('data-video-id');

  link.onclick = function(e) {
    e.preventDefault();
    let videoId = this.getAttribute('data-video-id');
    const player = new VideoPlayer({ videoId });
    player.openVideo();
  };
}
