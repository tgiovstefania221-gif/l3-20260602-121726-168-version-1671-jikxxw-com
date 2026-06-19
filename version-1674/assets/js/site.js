document.addEventListener("DOMContentLoaded", function() {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector(".main-nav");

    if (menuButton && nav) {
        menuButton.addEventListener("click", function() {
            nav.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        let index = 0;
        let timer = null;

        function showSlide(nextIndex) {
            index = nextIndex % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function startTimer() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function() {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                const next = Number(dot.getAttribute("data-hero-dot") || 0);
                showSlide(next);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    const filterPanel = document.querySelector("[data-filter-panel]");
    const cards = Array.from(document.querySelectorAll("[data-card]"));

    if (filterPanel && cards.length) {
        const input = filterPanel.querySelector("[data-local-search]");
        const buttons = Array.from(filterPanel.querySelectorAll("[data-filter]"));
        let filterValue = "all";

        function applyFilter() {
            const query = input ? input.value.trim().toLowerCase() : "";
            cards.forEach(function(card) {
                const text = (card.getAttribute("data-search") || "").toLowerCase();
                const year = card.getAttribute("data-year") || "";
                const type = card.getAttribute("data-type") || "";
                const matchQuery = !query || text.includes(query);
                const matchFilter = filterValue === "all" || year === filterValue || type === filterValue || text.includes(filterValue.toLowerCase());
                card.classList.toggle("is-hidden", !(matchQuery && matchFilter));
            });
        }

        if (input) {
            const params = new URLSearchParams(window.location.search);
            const initialQuery = params.get("q");
            if (initialQuery) {
                input.value = initialQuery;
            }
            input.addEventListener("input", applyFilter);
        }

        buttons.forEach(function(button) {
            button.addEventListener("click", function() {
                filterValue = button.getAttribute("data-filter") || "all";
                buttons.forEach(function(item) {
                    item.classList.toggle("is-active", item === button);
                });
                applyFilter();
            });
        });

        applyFilter();
    }
});
