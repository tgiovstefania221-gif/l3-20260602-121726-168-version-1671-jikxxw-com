(function () {
  function queryAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var links = document.querySelector('[data-nav-links]');
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  function setupSearchForms() {
    queryAll('.site-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        if (!value) {
          return;
        }
        var target = form.getAttribute('data-search-url') || 'search.html';
        window.location.href = target + '?q=' + encodeURIComponent(value);
      });
    });
  }

  function setupFocusStage() {
    var stage = document.querySelector('[data-focus-stage]');
    if (!stage) {
      return;
    }
    var slides = queryAll('.focus-slide', stage);
    var dots = queryAll('[data-focus-dot]', stage);
    var activeIndex = 0;
    function show(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-focus-dot')) || 0);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(activeIndex + 1);
      }, 5200);
    }
  }

  function setupCardFilters() {
    var textInput = document.querySelector('[data-card-filter]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var cards = queryAll('[data-movie-card]');
    if (!cards.length || (!textInput && !yearSelect)) {
      return;
    }
    function apply() {
      var keyword = textInput ? textInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedYear = !year || cardYear === year;
        card.hidden = !(matchedKeyword && matchedYear);
      });
    }
    if (textInput) {
      textInput.addEventListener('input', apply);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', apply);
    }
  }

  function movieCardHtml(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card">' +
      '<a class="poster-link" href="' + movie.url + '">' +
      '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-shade"></span>' +
      '<span class="play-chip">播放</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.rating) + '</span></div>' +
      '<h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>' +
      '<p>' + escapeHtml(movie.desc) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (mark) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[mark];
    });
  }

  function setupSearchPage() {
    var container = document.querySelector('[data-search-results]');
    if (!container || !window.SITE_SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get('q') || '').trim().toLowerCase();
    var summary = document.querySelector('[data-search-summary]');
    var empty = document.querySelector('[data-search-empty]');
    var searchInput = document.querySelector('.hero-search input[name="q"]');
    if (searchInput && keyword) {
      searchInput.value = params.get('q') || '';
    }
    if (!keyword) {
      container.innerHTML = '';
      if (empty) {
        empty.hidden = true;
      }
      return;
    }
    var results = window.SITE_SEARCH_DATA.filter(function (movie) {
      return movie.search.indexOf(keyword) !== -1;
    }).slice(0, 120);
    container.innerHTML = results.map(movieCardHtml).join('');
    if (summary) {
      summary.textContent = '与“' + (params.get('q') || '') + '”相关的内容';
    }
    if (empty) {
      empty.hidden = results.length > 0;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupSearchForms();
    setupFocusStage();
    setupCardFilters();
    setupSearchPage();
  });
})();
