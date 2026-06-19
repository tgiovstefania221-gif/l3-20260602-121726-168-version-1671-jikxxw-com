(function() {
    var heroIndex = 0;
    var heroTimer = null;

    function setHeroSlide(nextIndex) {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        if (!slides.length) {
            return;
        }
        heroIndex = (nextIndex + slides.length) % slides.length;
        slides.forEach(function(slide, index) {
            slide.classList.toggle('is-active', index === heroIndex);
        });
        dots.forEach(function(dot, index) {
            dot.classList.toggle('is-active', index === heroIndex);
        });
    }

    function startHeroSlider() {
        var slides = document.querySelectorAll('.hero-slide');
        if (slides.length <= 1) {
            return;
        }
        clearInterval(heroTimer);
        heroTimer = setInterval(function() {
            setHeroSlide(heroIndex + 1);
        }, 5600);
    }

    function setupHero() {
        var prev = document.querySelector('.hero-prev');
        var next = document.querySelector('.hero-next');
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        if (prev) {
            prev.addEventListener('click', function() {
                setHeroSlide(heroIndex - 1);
                startHeroSlider();
            });
        }
        if (next) {
            next.addEventListener('click', function() {
                setHeroSlide(heroIndex + 1);
                startHeroSlider();
            });
        }
        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                setHeroSlide(index);
                startHeroSlider();
            });
        });
        startHeroSlider();
    }

    function setupMenu() {
        var button = document.querySelector('.mobile-menu-button');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function() {
            var expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            panel.hidden = expanded;
            button.textContent = expanded ? '☰' : '×';
        });
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function applyFilter(input) {
        var list = document.querySelector('.searchable-list');
        if (!list) {
            return;
        }
        var query = normalize(input.value);
        var items = Array.prototype.slice.call(list.querySelectorAll('[data-search]'));
        items.forEach(function(item) {
            var text = normalize(item.getAttribute('data-search'));
            item.classList.toggle('hidden-by-filter', query && text.indexOf(query) === -1);
        });
    }

    function setupFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('.filter-input'));
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        inputs.forEach(function(input) {
            if (q && !input.value) {
                input.value = q;
            }
            applyFilter(input);
            input.addEventListener('input', function() {
                applyFilter(input);
            });
            if (input.classList.contains('auto-focus') && !q) {
                setTimeout(function() {
                    input.focus();
                }, 120);
            }
        });
    }

    window.initMoviePlayer = function(streamUrl) {
        var video = document.getElementById('movie-video');
        var overlay = document.getElementById('play-overlay');
        if (!video || !overlay || !streamUrl) {
            return;
        }
        var ready = false;
        var hls = null;

        function attachStream() {
            if (ready) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            ready = true;
        }

        function start() {
            attachStream();
            overlay.classList.add('is-hidden');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function() {
                    overlay.classList.remove('is-hidden');
                });
            }
        }

        overlay.addEventListener('click', start);
        video.addEventListener('click', function() {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function() {
            overlay.classList.add('is-hidden');
        });
        video.addEventListener('ended', function() {
            overlay.classList.remove('is-hidden');
        });
        window.addEventListener('beforeunload', function() {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function() {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
