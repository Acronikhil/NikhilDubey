// Experience "RAM bus" pulse and project filters
(function () {
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- Experience timeline: a data packet travels down the bus and charges each node it passes ----
    var track = document.querySelector(".exp-track");
    if (track && !reduceMotion) {
        var packet = track.querySelector(".exp-packet");
        var items = Array.from(track.querySelectorAll(".exp-item"));
        var SPEED = 260; // px per second
        var PACKET = 70; // packet length in px
        var nodes = [], height = 0, start = null, running = false, frame = null;

        function measure() {
            height = track.offsetHeight;
            nodes = items.map(function (item) {
                var logo = item.querySelector(".exp-logo");
                return { item: item, y: item.offsetTop + logo.offsetTop + logo.offsetHeight / 2, charged: false };
            });
        }

        function step(ts) {
            if (start === null) start = ts;
            var travel = height + PACKET * 2;
            var pause = 700; // ms of quiet between pulses
            var cycle = (travel / SPEED) * 1000 + pause;
            var t = (ts - start) % cycle;
            var y = (t / 1000) * SPEED - PACKET; // y of the packet's leading (bottom) edge

            packet.style.transform = "translateY(" + (y - PACKET) + "px)";
            packet.style.opacity = t > cycle - pause ? 0 : 1;

            nodes.forEach(function (n) {
                var hit = y >= n.y && y - PACKET <= n.y + 10;
                if (hit && !n.charged) {
                    n.charged = true;
                    n.item.classList.remove("is-charged");
                    void n.item.offsetWidth;
                    n.item.classList.add("is-charged");
                } else if (!hit && y < n.y) {
                    n.charged = false;
                }
            });

            frame = requestAnimationFrame(step);
        }

        function setRunning(on) {
            if (on === running) return;
            running = on;
            if (on) { measure(); frame = requestAnimationFrame(step); }
            else cancelAnimationFrame(frame);
        }

        new IntersectionObserver(function (entries) {
            setRunning(entries[0].isIntersecting);
        }).observe(track);
        window.addEventListener("resize", measure);
        window.addEventListener("load", measure);
    }

    // ---- Navbar: compact state on scroll, active section highlight, auto-close on mobile ----
    var nav = document.querySelector(".portfolio-nav");
    if (nav) {
        var links = Array.from(nav.querySelectorAll(".nav-link[href^='#']"));
        var onScroll = function () { nav.classList.toggle("is-scrolled", window.scrollY > 24); };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();

        // Highlight the link of the section crossing the upper third of the screen
        var targets = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                links.forEach(function (a, i) {
                    var active = targets[i] === entry.target;
                    a.classList.toggle("active", active);
                    if (active) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
                });
            });
        }, { rootMargin: "-35% 0px -60% 0px" });
        targets.forEach(function (t) { if (t) spy.observe(t); });

        var collapse = nav.querySelector(".navbar-collapse");
        var toggler = nav.querySelector(".navbar-toggler");
        nav.querySelectorAll(".navbar-collapse a").forEach(function (a) {
            a.addEventListener("click", function () {
                if (collapse.classList.contains("show")) toggler.click();
            });
        });
    }

    // ---- Profile card modal ----
    var modal = document.getElementById("profileModal");
    if (modal) {
        var opener = null;
        var openModal = function (e) {
            opener = e.currentTarget;
            modal.hidden = false;
            document.documentElement.classList.add("modal-open");
            requestAnimationFrame(function () { modal.classList.add("is-open"); });
            modal.querySelector(".profile-close").focus();
        };
        var closeModal = function () {
            modal.classList.remove("is-open");
            document.documentElement.classList.remove("modal-open");
            setTimeout(function () { modal.hidden = true; }, 300);
            if (opener) opener.focus();
        };
        document.querySelectorAll("[data-profile-open]").forEach(function (b) { b.addEventListener("click", openModal); });
        modal.querySelectorAll("[data-profile-close]").forEach(function (b) { b.addEventListener("click", closeModal); });
        document.addEventListener("keydown", function (e) {
            if (modal.hidden) return;
            if (e.key === "Escape") closeModal();
            // Keep keyboard focus inside the card while it is open
            if (e.key === "Tab") {
                var f = Array.from(modal.querySelectorAll("a, button"));
                var first = f[0], last = f[f.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        });
    }

    // ---- Rocket scrollbar (mouse/trackpad only) ----
    var rocket = document.querySelector(".rocket-scroll");
    if (rocket && window.matchMedia("(pointer: fine)").matches) {
        var root = document.documentElement;
        var thumb = rocket.querySelector(".rocket-thumb");
        var trackEl = rocket.querySelector(".rocket-track");
        var trail = rocket.querySelector(".rocket-trail");
        var lastY = window.scrollY, idle = null, ticking = false, dragging = null;
        root.classList.add("has-rocket-scroll");

        var range = function () { return rocket.clientHeight - thumb.offsetHeight; };
        var maxScroll = function () { return root.scrollHeight - window.innerHeight; };

        var render = function () {
            ticking = false;
            var max = maxScroll();
            rocket.classList.toggle("is-hidden", max <= 0);
            if (max <= 0) return;
            var y = window.scrollY;
            var pos = Math.min(1, Math.max(0, y / max)) * range();
            thumb.style.transform = "translateY(" + pos + "px)";
            trail.style.height = pos + thumb.offsetHeight / 2 + "px";

            if (y !== lastY) {
                rocket.classList.toggle("going-up", y < lastY);
                rocket.classList.add("is-moving");
                clearTimeout(idle);
                idle = setTimeout(function () { rocket.classList.remove("is-moving"); }, 180);
            }
            lastY = y;
        };
        var request = function () { if (!ticking) { ticking = true; requestAnimationFrame(render); } };
        window.addEventListener("scroll", request, { passive: true });
        window.addEventListener("resize", request);
        window.addEventListener("load", request);
        render();

        // Drag the rocket
        thumb.addEventListener("pointerdown", function (e) {
            e.preventDefault();
            thumb.setPointerCapture(e.pointerId);
            dragging = { startY: e.clientY, startScroll: window.scrollY };
            rocket.classList.add("is-dragging");
        });
        thumb.addEventListener("pointermove", function (e) {
            if (!dragging) return;
            var ratio = maxScroll() / range();
            window.scrollTo({ top: dragging.startScroll + (e.clientY - dragging.startY) * ratio, behavior: "instant" });
        });
        var endDrag = function () { dragging = null; rocket.classList.remove("is-dragging"); };
        thumb.addEventListener("pointerup", endDrag);
        thumb.addEventListener("pointercancel", endDrag);

        // Click the track to fly there
        trackEl.addEventListener("click", function (e) {
            var rect = rocket.getBoundingClientRect();
            var p = (e.clientY - rect.top - thumb.offsetHeight / 2) / range();
            window.scrollTo({ top: Math.min(1, Math.max(0, p)) * maxScroll(), behavior: "smooth" });
        });
    }

    // ---- Project filters ----
    var section = document.querySelector(".proj-section");
    if (section) {
        var chips = Array.from(section.querySelectorAll(".cert-chip"));
        var cards = Array.from(section.querySelectorAll(".proj-card"));

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                var filter = chip.dataset.filter;
                chips.forEach(function (c) {
                    c.classList.toggle("active", c === chip);
                    c.setAttribute("aria-pressed", c === chip);
                });
                cards.forEach(function (card) {
                    var show = filter === "all" || card.dataset.category.split(" ").indexOf(filter) > -1;
                    card.hidden = !show;
                    if (show) {
                        card.classList.remove("cert-in");
                        void card.offsetWidth;
                        card.classList.add("cert-in");
                    }
                });
            });
        });
    }
})();
