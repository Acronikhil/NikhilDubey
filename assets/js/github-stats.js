// Live GitHub activity: stats, a themed contribution heatmap with a snake, and a language breakdown.
// Results are cached for 6 hours to stay under GitHub's anonymous rate limit (60 requests/hour).
(function () {
    var root = document.querySelector(".gh-activity");
    if (!root) return;

    var user = root.dataset.githubUser;
    var cacheKey = "github-activity:v2:" + user;
    var maxAge = 6 * 60 * 60 * 1000;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var SVGNS = "http://www.w3.org/2000/svg";
    var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var LANG_COLORS = ["#7510f7", "#00d8ff", "#a15afd", "#36e2c4", "#d16bff", "#5b8cff", "#8a8fa8"];

    function getJSON(url) {
        return fetch(url).then(function (res) {
            if (!res.ok) throw new Error(url + " responded " + res.status);
            return res.json();
        });
    }

    function load() {
        var api = "https://api.github.com/users/" + user;
        var contrib = "https://github-contributions-api.jogruber.de/v4/" + user;
        return Promise.all([
            getJSON(api),
            getJSON(api + "/repos?per_page=100&type=owner"),
            getJSON(contrib + "?y=all"),
            getJSON(contrib + "?y=last")
        ]).then(function (r) {
            var profile = r[0], repos = r[1], all = r[2], last = r[3];

            var counts = {}, forked = 0;
            repos.forEach(function (repo) {
                if (repo.fork) { forked++; return; }
                if (repo.language) counts[repo.language] = (counts[repo.language] || 0) + 1;
            });
            var languages = Object.keys(counts)
                .sort(function (a, b) { return counts[b] - counts[a]; })
                .map(function (name) { return { name: name, count: counts[name] }; });

            return {
                time: Date.now(),
                contributions: Object.keys(all.total).reduce(function (sum, y) { return sum + all.total[y]; }, 0),
                lastYear: last.total.lastYear,
                days: last.contributions.map(function (d) { return [d.date, d.count, d.level]; }),
                repos: profile.public_repos,
                original: repos.length - forked,
                forked: forked,
                languages: languages,
                joined: profile.created_at
            };
        });
    }

    function svg(tag, attrs) {
        var node = document.createElementNS(SVGNS, tag);
        for (var k in attrs) node.setAttribute(k, attrs[k]);
        return node;
    }

    function setText(name, text) {
        var el = root.querySelector('[data-stat="' + name + '"]');
        if (el) el.textContent = text;
    }

    function timeAgo(time) {
        var mins = Math.round((Date.now() - time) / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return mins + " min ago";
        var hrs = Math.round(mins / 60);
        return hrs + (hrs > 1 ? " hrs" : " hr") + " ago";
    }

    function countUp(el, target) {
        if (reduceMotion) { el.textContent = target.toLocaleString(); return; }
        var start = null, duration = 1400;
        function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / duration, 1);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString();
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    // ---- Contribution heatmap -------------------------------------------------
    var CELL = 11, STEP = 14, TOP = 16;

    function buildHeatmap(container, days) {
        var offset = new Date(days[0][0] + "T00:00:00").getDay();
        var cols = Math.ceil((days.length + offset) / 7);
        var map = svg("svg", {
            viewBox: "0 0 " + (cols * STEP) + " " + (TOP + 7 * STEP),
            role: "img",
            "aria-label": "GitHub contribution heatmap for the last year"
        });

        var cells = [], lastLabelCol = -4;
        days.forEach(function (d, i) {
            var idx = i + offset, col = Math.floor(idx / 7), row = idx % 7;
            var date = new Date(d[0] + "T00:00:00");
            var x = col * STEP, y = TOP + row * STEP;

            if (row === 0 && date.getDate() <= 7 && col - lastLabelCol > 3) {
                var label = svg("text", { x: x, y: 10, class: "gh-month" });
                label.textContent = MONTHS[date.getMonth()];
                map.appendChild(label);
                lastLabelCol = col;
            }

            var rect = svg("rect", { x: x, y: y, width: CELL, height: CELL, rx: 2.5, class: "gh-cell l" + d[2] });
            var title = svg("title", {});
            title.textContent = d[1] + " contribution" + (d[1] === 1 ? "" : "s") + " on " +
                date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
            rect.appendChild(title);
            map.appendChild(rect);
            cells.push({ col: col, row: row, x: x, y: y, level: d[2], rect: rect });
        });

        container.appendChild(map);
        return { svg: map, cells: cells };
    }

    // The snake sweeps the grid column by column (down, then up) and eats every active day it passes.
    function Snake(map, cells, scroller) {
        var path = cells.slice().sort(function (a, b) {
            return a.col - b.col || (a.col % 2 ? b.row - a.row : a.row - b.row);
        });
        var MAX = 12, BASE = 4, group = svg("g", { class: "gh-snake" }), segs = [];

        for (var i = 0; i < MAX; i++) {
            // Head is cyan, fading into the site's purple towards the tail
            var t = i / (MAX - 1);
            var color = "rgb(" + Math.round(0 + t * 161) + "," + Math.round(216 - t * 126) + "," + Math.round(255 - t * 2) + ")";
            var seg = svg("rect", { width: CELL, height: CELL, rx: 3, fill: color, class: i === 0 ? "gh-snake-head" : "" });
            seg.style.opacity = 0;
            group.appendChild(seg);
            segs.push(seg);
        }
        map.appendChild(group);

        var head = 0, len = BASE, timer = null, pause = null, visible = false;

        // On narrow screens the graph scrolls horizontally: glide it so the snake's head stays centred.
        // Following pauses for a few seconds whenever the visitor scrolls the graph themselves.
        var userScrollUntil = 0;
        ["touchstart", "pointerdown", "wheel"].forEach(function (type) {
            scroller.addEventListener(type, function () { userScrollUntil = Date.now() + 4000; }, { passive: true });
        });

        function follow(x) {
            var overflow = scroller.scrollWidth - scroller.clientWidth;
            if (overflow <= 0 || Date.now() < userScrollUntil) return;
            var scale = map.getBoundingClientRect().width / map.viewBox.baseVal.width;
            var target = Math.max(0, Math.min(overflow, (x + CELL / 2) * scale - scroller.clientWidth / 2));
            var diff = target - scroller.scrollLeft;
            // Ease towards the target; jump straight there when the snake restarts from the far end
            scroller.scrollLeft += Math.abs(diff) > scroller.clientWidth ? diff : diff * 0.2;
        }

        function draw() {
            var lead = path[Math.min(head, path.length - 1)];
            if (lead) follow(lead.x);
            for (var i = 0; i < MAX; i++) {
                var p = path[head - i];
                if (i < len && p) {
                    segs[i].setAttribute("x", p.x);
                    segs[i].setAttribute("y", p.y);
                    segs[i].style.opacity = 1 - i / (len + 2);
                } else {
                    segs[i].style.opacity = 0;
                }
            }
        }

        function tick() {
            var cell = path[head];
            if (cell && cell.level > 0 && !cell.eaten) {
                cell.eaten = true;
                cell.rect.classList.add("eaten");
                len = Math.min(MAX, len + 1);
            }
            draw();
            head++;
            if (head - len > path.length) {
                stop();
                pause = setTimeout(reset, 1600);
            }
        }

        function reset() {
            path.forEach(function (c) { c.eaten = false; c.rect.classList.remove("eaten"); });
            head = 0;
            len = BASE;
            pause = setTimeout(start, 900);
        }

        function start() {
            pause = null;
            if (visible && !timer) timer = setInterval(tick, 32);
        }

        function stop() {
            clearInterval(timer);
            timer = null;
        }

        return {
            setVisible: function (v) {
                visible = v;
                if (v && !pause) start();
                else if (!v) stop();
            }
        };
    }

    // ---- Language breakdown ---------------------------------------------------
    function renderLanguages(languages) {
        var bar = root.querySelector("[data-lang-bar]");
        var legend = root.querySelector("[data-lang-legend]");
        var total = languages.reduce(function (s, l) { return s + l.count; }, 0);
        if (!total) return;

        var shown = languages.slice(0, 6);
        var rest = languages.slice(6).reduce(function (s, l) { return s + l.count; }, 0);
        if (rest) shown.push({ name: "Other", count: rest });

        shown.forEach(function (lang, i) {
            var pct = (lang.count / total) * 100;
            var color = LANG_COLORS[i % LANG_COLORS.length];
            var label = lang.name + " " + pct.toFixed(1) + "%";

            var part = document.createElement("span");
            part.style.background = color;
            part.title = label;
            bar.appendChild(part);
            requestAnimationFrame(function () { requestAnimationFrame(function () { part.style.width = pct + "%"; }); });

            var item = document.createElement("li");
            item.innerHTML = '<i style="background:' + color + '"></i><span></span><em>' + pct.toFixed(1) + "%</em>";
            item.querySelector("span").textContent = lang.name;
            legend.appendChild(item);
        });
    }

    // ---- Render ---------------------------------------------------------------
    function render(data) {
        root.classList.remove("is-loading");

        root.querySelectorAll("[data-count]").forEach(function (el) {
            var values = {
                contributions: data.contributions,
                repos: data.repos,
                languages: data.languages.length,
                years: Math.floor((Date.now() - new Date(data.joined)) / (365.25 * 24 * 60 * 60 * 1000))
            };
            countUp(el, values[el.dataset.count]);
        });

        var joined = new Date(data.joined);
        setText("lastYear", data.lastYear.toLocaleString() + " in the last year");
        setText("repoSplit", data.original + " original · " + data.forked + " forked");
        setText("topLanguages", data.languages.slice(0, 3).map(function (l) { return l.name; }).join(" · ") || "—");
        setText("joined", "Since " + MONTHS[joined.getMonth()] + " " + joined.getFullYear());
        setText("synced", "Synced " + timeAgo(data.time));

        var heatmap = buildHeatmap(root.querySelector("[data-graph]"), data.days);
        if (!reduceMotion) {
            var snake = Snake(heatmap.svg, heatmap.cells, root.querySelector(".gh-graph-scroll"));
            new IntersectionObserver(function (entries) {
                snake.setVisible(entries[0].isIntersecting);
            }).observe(heatmap.svg);
        }

        renderLanguages(data.languages);
    }

    function showError() {
        root.classList.remove("is-loading");
        root.classList.add("is-error");
        setText("synced", "GitHub is unreachable right now");
        root.querySelector("[data-graph]").innerHTML =
            '<p class="gh-error">Couldn\'t load live data. <a href="https://github.com/' + user +
            '" target="_blank" rel="noopener">View my GitHub profile</a> instead.</p>';
    }

    function readCache() {
        try { return JSON.parse(localStorage.getItem(cacheKey)); } catch (e) { return null; }
    }

    var cached = readCache();
    var data = cached && Date.now() - cached.time < maxAge ? Promise.resolve(cached) : load().then(function (fresh) {
        try { localStorage.setItem(cacheKey, JSON.stringify(fresh)); } catch (e) { }
        return fresh;
    }).catch(function (err) {
        console.warn("GitHub activity unavailable:", err);
        return cached;
    });

    // Render once the section scrolls into view so the count-up animation is actually seen
    var observer = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        data.then(function (d) { d ? render(d) : showError(); });
    }, { threshold: 0.2 });
    observer.observe(root);
})();
