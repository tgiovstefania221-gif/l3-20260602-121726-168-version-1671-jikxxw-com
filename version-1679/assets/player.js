(function () {
    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }

        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

    function attachSource(video, source, done) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            done();
            return;
        }

        loadHls(function () {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, done);
                video._hlsInstance = hls;
            } else {
                video.src = source;
                done();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('.video-shell')).forEach(function (shell) {
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('.player-overlay');
        var source = shell.getAttribute('data-video-src');
        var ready = false;

        if (!video || !source) {
            return;
        }

        function playVideo() {
            if (overlay) {
                overlay.classList.add('hidden');
            }

            var start = function () {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        if (overlay) {
                            overlay.classList.remove('hidden');
                        }
                    });
                }
            };

            if (ready) {
                start();
                return;
            }

            ready = true;
            attachSource(video, source, start);
        }

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove('hidden');
            }
        });
    });
})();
