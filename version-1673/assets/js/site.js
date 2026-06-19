(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");

    if (toggle && links) {
      toggle.addEventListener("click", function () {
        links.classList.toggle("open");
      });
    }

    var hero = document.querySelector(".hero-carousel");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var current = 0;
      var timer = null;

      function showSlide(next) {
        current = (next + slides.length) % slides.length;
        slides.forEach(function (slide, index) {
          slide.classList.toggle("active", index === current);
        });
        dots.forEach(function (dot, index) {
          dot.classList.toggle("active", index === current);
        });
      }

      function startAuto() {
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          window.clearInterval(timer);
          showSlide(index);
          startAuto();
        });
      });

      if (slides.length > 0) {
        showSlide(0);
        startAuto();
      }
    }

    var input = document.querySelector("[data-filter-input]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var regionSelect = document.querySelector("[data-filter-region]");
    var noResults = document.querySelector(".no-results");

    function yearMatches(value, year) {
      if (!value || value === "all") {
        return true;
      }
      var number = parseInt(year, 10);
      if (value === "2025") {
        return number >= 2025;
      }
      if (value === "2020") {
        return number >= 2020 && number <= 2024;
      }
      if (value === "2010") {
        return number >= 2010 && number <= 2019;
      }
      if (value === "2000") {
        return number >= 2000 && number <= 2009;
      }
      if (value === "1990") {
        return number < 2000;
      }
      return true;
    }

    function filterCards() {
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
      if (cards.length === 0) {
        return;
      }

      var query = input ? input.value.trim().toLowerCase() : "";
      var yearValue = yearSelect ? yearSelect.value : "all";
      var regionValue = regionSelect ? regionSelect.value : "all";
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var year = card.getAttribute("data-year") || "";
        var region = card.getAttribute("data-region") || "";
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchYear = yearMatches(yearValue, year);
        var matchRegion = !regionValue || regionValue === "all" || region.indexOf(regionValue) !== -1;
        var match = matchQuery && matchYear && matchRegion;
        card.style.display = match ? "" : "none";
        if (match) {
          visible += 1;
        }
      });

      if (noResults) {
        noResults.classList.toggle("visible", visible === 0);
      }
    }

    [input, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filterCards);
        control.addEventListener("change", filterCards);
      }
    });
  });
})();
