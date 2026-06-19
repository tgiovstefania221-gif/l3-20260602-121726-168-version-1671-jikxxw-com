(function () {
    var toggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    var nextButton = document.querySelector('.hero-next');
    var prevButton = document.querySelector('.hero-prev');
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    function startTimer() {
        if (slides.length < 2) {
            return;
        }
        clearInterval(timer);
        timer = setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    if (nextButton) {
        nextButton.addEventListener('click', function () {
            showSlide(current + 1);
            startTimer();
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', function () {
            showSlide(current - 1);
            startTimer();
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            startTimer();
        });
    });

    startTimer();

    function normalText(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupSearchPanel(panel) {
        var scope = panel.parentElement || document;
        var input = panel.querySelector('.search-input');
        var sort = panel.querySelector('.sort-control');
        var genre = panel.querySelector('.genre-control');
        var list = scope.querySelector('.searchable-list');

        if (!list) {
            list = document.querySelector('.searchable-list');
        }

        if (!list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        cards.forEach(function (card, index) {
            card.dataset.rank = String(index + 1);
        });

        function compareCards(a, b) {
            var mode = sort ? sort.value : 'year-desc';

            if (mode === 'year-asc') {
                return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
            }

            if (mode === 'title-asc') {
                return normalText(a.dataset.title).localeCompare(normalText(b.dataset.title), 'zh-Hans-CN');
            }

            if (mode === 'rank') {
                return Number(a.dataset.rank || 0) - Number(b.dataset.rank || 0);
            }

            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }

        function applyFilters() {
            var query = normalText(input ? input.value : '');
            var genreValue = normalText(genre ? genre.value : '');
            var visibleCards = [];

            cards.forEach(function (card) {
                var text = normalText(card.dataset.search);
                var cardGenre = normalText(card.dataset.genre);
                var matchedQuery = !query || text.indexOf(query) !== -1;
                var matchedGenre = !genreValue || cardGenre.indexOf(genreValue) !== -1;
                var visible = matchedQuery && matchedGenre;
                card.classList.toggle('is-hidden', !visible);
                if (visible) {
                    visibleCards.push(card);
                }
            });

            visibleCards.sort(compareCards).forEach(function (card) {
                list.appendChild(card);
            });
        }

        if (input) {
            input.addEventListener('input', applyFilters);
        }

        if (sort) {
            sort.addEventListener('change', applyFilters);
        }

        if (genre) {
            genre.addEventListener('change', applyFilters);
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('.search-panel')).forEach(setupSearchPanel);
})();
