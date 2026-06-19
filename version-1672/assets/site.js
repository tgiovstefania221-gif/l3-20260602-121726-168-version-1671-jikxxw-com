(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector(".js-mobile-toggle");
    var panel = document.querySelector(".js-mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector(".js-hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot") || 0));
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll(".js-filter-scope"));
    scopes.forEach(function (scope) {
      var cardsContainer = scope.parentElement || document;
      var cards = Array.prototype.slice.call(cardsContainer.querySelectorAll(".js-filter-card"));
      if (!cards.length) {
        cards = Array.prototype.slice.call(document.querySelectorAll(".js-filter-card"));
      }
      var query = scope.querySelector(".js-filter-query");
      var category = scope.querySelector(".js-filter-category");
      var year = scope.querySelector(".js-filter-year");
      var region = scope.querySelector(".js-filter-region");
      var count = scope.querySelector("[data-result-count]");
      var empty = cardsContainer.querySelector(".js-empty-state");

      function valueOf(field) {
        return field ? field.value.trim().toLowerCase() : "";
      }

      function apply() {
        var q = valueOf(query);
        var c = valueOf(category);
        var y = valueOf(year);
        var r = valueOf(region);
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-text") || "").toLowerCase();
          var title = (card.getAttribute("data-title") || "").toLowerCase();
          var tags = (card.getAttribute("data-tags") || "").toLowerCase();
          var cardCategory = (card.getAttribute("data-category") || "").toLowerCase();
          var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
          var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
          var matched = true;
          if (q && text.indexOf(q) === -1 && title.indexOf(q) === -1 && tags.indexOf(q) === -1) {
            matched = false;
          }
          if (c && cardCategory !== c) {
            matched = false;
          }
          if (y && cardYear !== y) {
            matched = false;
          }
          if (r && cardRegion !== r) {
            matched = false;
          }
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = String(visible);
        }
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [query, category, year, region].forEach(function (field) {
        if (!field) {
          return;
        }
        field.addEventListener("input", apply);
        field.addEventListener("change", apply);
      });
      apply();
    });
  }

  window.initMoviePlayer = function (url) {
    ready(function () {
      var video = document.getElementById("moviePlayer");
      if (!video || !url) {
        return;
      }
      var shell = video.closest(".player-shell");
      var active = false;
      var hls = null;

      function attach() {
        if (active) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 32,
            backBufferLength: 30,
            enableWorker: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
        active = true;
      }

      function start() {
        attach();
        if (shell) {
          shell.classList.add("is-playing");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      Array.prototype.slice.call(document.querySelectorAll("[data-player-trigger]")).forEach(function (trigger) {
        trigger.addEventListener("click", start);
      });
      video.addEventListener("click", function () {
        if (!active || video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        if (shell) {
          shell.classList.add("is-playing");
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  };

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupFilters();
  });
})();
