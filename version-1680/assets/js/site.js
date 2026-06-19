document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", panel.classList.contains("is-open"));
        });
    }

    initHeroSlider();
    initFilters();
    initPlayerScrollButtons();
});

function initHeroSlider() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
        return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(function () {
            showSlide(current + 1);
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
            var next = parseInt(dot.getAttribute("data-hero-dot"), 10) || 0;
            showSlide(next);
            start();
        });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    showSlide(0);
    start();
}

function initFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll("[data-sortable-grid]"));
    if (!grids.length) {
        return;
    }

    var searchInput = document.querySelector("[data-movie-filter]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var categorySelect = document.querySelector("[data-category-filter]");
    var sortSelect = document.querySelector("[data-sort-filter]");
    var result = document.querySelector("[data-filter-result]");

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function getItems() {
        return Array.prototype.slice.call(document.querySelectorAll(".filter-item"));
    }

    function sortItems() {
        if (!sortSelect) {
            return;
        }

        var mode = sortSelect.value;
        grids.forEach(function (grid) {
            var children = Array.prototype.slice.call(grid.querySelectorAll(":scope > .filter-item"));
            children.sort(function (a, b) {
                var yearA = parseInt(a.getAttribute("data-year"), 10) || 0;
                var yearB = parseInt(b.getAttribute("data-year"), 10) || 0;
                var titleA = a.getAttribute("data-title") || "";
                var titleB = b.getAttribute("data-title") || "";

                if (mode === "year-asc") {
                    return yearA - yearB || titleA.localeCompare(titleB, "zh-Hans-CN");
                }
                if (mode === "title-asc") {
                    return titleA.localeCompare(titleB, "zh-Hans-CN");
                }
                return yearB - yearA || titleA.localeCompare(titleB, "zh-Hans-CN");
            });
            children.forEach(function (child) {
                grid.appendChild(child);
            });
        });
    }

    function applyFilter() {
        var keyword = normalize(searchInput ? searchInput.value : "");
        var year = yearSelect ? yearSelect.value : "";
        var category = categorySelect ? categorySelect.value : "";
        var visible = 0;
        var total = 0;

        getItems().forEach(function (item) {
            total += 1;
            var haystack = normalize([
                item.getAttribute("data-title"),
                item.getAttribute("data-region"),
                item.getAttribute("data-genre"),
                item.getAttribute("data-category")
            ].join(" "));
            var itemYear = item.getAttribute("data-year") || "";
            var itemCategory = item.getAttribute("data-category") || "";
            var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchesYear = !year || itemYear === year;
            var matchesCategory = !category || itemCategory === category;
            var shouldShow = matchesKeyword && matchesYear && matchesCategory;

            item.classList.toggle("is-hidden", !shouldShow);
            if (shouldShow) {
                visible += 1;
            }
        });

        if (result) {
            result.textContent = "当前显示 " + visible + " / " + total + " 部影片";
        }
    }

    [searchInput, yearSelect, categorySelect, sortSelect].forEach(function (control) {
        if (!control) {
            return;
        }
        control.addEventListener("input", function () {
            sortItems();
            applyFilter();
        });
        control.addEventListener("change", function () {
            sortItems();
            applyFilter();
        });
    });

    sortItems();
    applyFilter();
}

function initPlayerScrollButtons() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-scroll-player]"));
    buttons.forEach(function (button) {
        button.addEventListener("click", function () {
            var player = document.querySelector("[data-player]");
            if (player) {
                player.scrollIntoView({ behavior: "smooth", block: "center" });
                var playButton = player.querySelector("[data-play-button]");
                if (playButton) {
                    playButton.focus();
                }
            }
        });
    });
}
