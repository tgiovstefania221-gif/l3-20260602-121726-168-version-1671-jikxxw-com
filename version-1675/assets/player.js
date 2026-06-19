import { H as Hls } from './hls-vendor.js';

function initializePlayer(box) {
  var video = box.querySelector('video');
  var button = box.querySelector('[data-play-button]');
  var url = box.getAttribute('data-video-url');
  var hls = null;
  var ready = false;

  function begin() {
    if (!video || !url) {
      return;
    }
    if (!ready) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        ready = true;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        ready = true;
      }
    }
    box.classList.add('is-playing');
    video.setAttribute('controls', 'controls');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        box.classList.remove('is-playing');
      });
    }
  }

  if (button) {
    button.addEventListener('click', begin);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (!ready || video.paused) {
        begin();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initializePlayer);
});
