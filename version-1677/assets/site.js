(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    var toggle = $('[data-nav-toggle]');
    var panel = $('[data-mobile-nav]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        play();
      });
    }
    show(0);
    play();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupCardFilters() {
    var bars = $all('[data-filter-bar]');
    bars.forEach(function (bar) {
      var root = bar.closest('section') || document;
      var search = $('[data-card-search]', bar);
      var year = $('[data-card-year]', bar);
      var type = $('[data-card-type]', bar);
      var cards = $all('[data-movie-card]', root);
      var empty = $('[data-empty-state]', root);

      function apply() {
        var q = normalize(search && search.value);
        var y = normalize(year && year.value);
        var t = normalize(type && type.value);
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-title'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardType = normalize(card.getAttribute('data-type'));
          var matched = (!q || text.indexOf(q) > -1) && (!y || cardYear === y) && (!t || cardType === t);
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      [search, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function setupSearchForms() {
    $all('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });
  }

  function setupSearchPage() {
    var page = $('[data-search-page]');
    if (!page || !window.SiteMovies) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var input = $('[data-main-search]', page);
    var results = $('[data-search-results]', page);
    var summary = $('[data-search-summary]', page);
    var empty = $('[data-search-empty]', page);
    if (input) {
      input.value = q;
    }

    function card(movie) {
      var tags = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category].concat(movie.tags || []).join(' ');
      return '' +
        '<a class="movie-card" href="' + movie.url + '" data-title="' + escapeHtml(tags) + '">' +
        '<figure>' +
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async">' +
        '<span class="card-badge">' + escapeHtml((movie.genre || '').split(/[，,\/]/)[0] || movie.category) + '</span>' +
        '<span class="play-hover">▶</span>' +
        '</figure>' +
        '<div class="card-body">' +
        '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
        '<h3>' + escapeHtml(movie.title) + '</h3>' +
        '<p>' + escapeHtml(movie.oneLine || '') + '</p>' +
        '</div>' +
        '</a>';
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function render(value) {
      var query = normalize(value);
      var pool = window.SiteMovies.slice();
      var matched = query ? pool.filter(function (movie) {
        var text = normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.oneLine].concat(movie.tags || []).join(' '));
        return text.indexOf(query) > -1;
      }) : pool.slice(0, 72);
      matched = matched.slice(0, 96);
      if (results) {
        results.innerHTML = matched.map(card).join('');
      }
      if (summary) {
        summary.textContent = query ? '搜索结果：' + value : '热门内容推荐';
      }
      if (empty) {
        empty.classList.toggle('show', matched.length === 0);
      }
    }

    render(q);
    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
  }

  function setupPlayers() {
    $all('[data-player]').forEach(function (box) {
      var video = $('video', box);
      var trigger = $('[data-play]', box);
      var stream = box.getAttribute('data-stream');
      var ready = false;
      var hls = null;
      if (!video || !trigger || !stream) {
        return;
      }

      function attach() {
        if (ready) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        ready = true;
      }

      function start() {
        attach();
        trigger.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        var play = video.play();
        if (play && typeof play.catch === 'function') {
          play.catch(function () {});
        }
      }

      trigger.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (!ready || video.paused) {
          start();
        }
      });
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupCardFilters();
    setupSearchForms();
    setupSearchPage();
    setupPlayers();
  });
})();
