function initMoviePlayer(url) {
  var video = document.getElementById("movie-player");
  var cover = document.getElementById("start-player");
  var ready = false;
  var hls = null;

  if (!video || !cover || !url) {
    return;
  }

  function attach() {
    if (ready) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }

    ready = true;
  }

  function begin() {
    attach();
    cover.classList.add("hidden");
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  cover.addEventListener("click", begin);
  video.addEventListener("click", function () {
    if (video.paused) {
      begin();
    }
  });
  video.addEventListener("play", function () {
    cover.classList.add("hidden");
  });
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
