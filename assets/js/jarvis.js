// N.I.K.H.I.L — Neural Intelligence Keeping Humans In the Loop.
// A particle-plexus brain (side view) at the centre: ~1,000 glowing particles fill a brain silhouette,
// denser along winding folds, linked by a faint mesh that neural signals race through.
// It fires lightning discharges to orbiting technology nodes. The static brain is rendered once to an
// offscreen layer; only signals, sparkles, bolts and nodes are animated per frame.
(function () {
    var root = document.querySelector("[data-jarvis]");
    if (!root) return;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var canvas = root.querySelector(".jarvis-canvas");
    var ctx = canvas.getContext("2d");
    var layer = document.createElement("canvas"), lctx = layer.getContext("2d");
    var statusEl = document.querySelector("[data-jarvis-status]");

    var ORBITS = { 1: { r: 0.335, speed: 0.00011 }, 2: { r: 0.455, speed: -0.00007 } }; // radius as share of size, rad/ms
    var CORE = 0.205; // brain scale as share of size
    var BOLT_LIFE = 460, BOLT_TRAVEL = 170;

    // Seeded random so the brain has the same shape on every visit
    var seed = 20260625;
    function rand() {
        seed = (seed + 0x6d2b79f5) | 0;
        var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    var nodes = Array.from(root.querySelectorAll(".jarvis-node"));
    nodes = nodes.map(function (el) {
        var ring = nodes.filter(function (n) { return n.dataset.orbit === el.dataset.orbit; });
        var orbit = Number(el.dataset.orbit);
        return {
            el: el, key: el.dataset.node, label: el.dataset.label, orbit: orbit,
            angle: (ring.indexOf(el) / ring.length) * Math.PI * 2 + (orbit === 2 ? Math.PI / 4 : -Math.PI / 2),
            x: 0, y: 0, half: 21
        };
    });

    // ---- Brain shape (side view, facing right), in brain units ----
    function smooth(ctrl, closed, segs) {
        var out = [], n = ctrl.length, last = closed ? n : n - 1;
        var P = function (i) { return closed ? ctrl[(i + n) % n] : ctrl[Math.max(0, Math.min(n - 1, i))]; };
        for (var i = 0; i < last; i++) {
            var p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
            for (var s = 0; s < segs; s++) {
                var t = s / segs, t2 = t * t, t3 = t2 * t;
                out.push([0, 1].map(function (k) {
                    return 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3);
                }));
            }
        }
        if (!closed) out.push(ctrl[n - 1]);
        return out;
    }

    function inside(poly, x, y) {
        var hit = false;
        for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            var a = poly[i], b = poly[j];
            if ((a[1] > y) !== (b[1] > y) && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) hit = !hit;
        }
        return hit;
    }

    function distToPolyline(line, x, y) {
        var best = 1e9;
        for (var i = 0; i < line.length - 1; i++) {
            var a = line[i], b = line[i + 1], dx = b[0] - a[0], dy = b[1] - a[1];
            var f = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy)));
            best = Math.min(best, Math.hypot(x - (a[0] + dx * f), y - (a[1] + dy * f)));
        }
        return best;
    }

    // Cerebrum with a gently scalloped (gyral) top edge, cerebellum and brainstem
    var cerebrum = smooth([[0.93, -0.1], [0.9, -0.38], [0.74, -0.62], [0.45, -0.79], [0.1, -0.86], [-0.25, -0.82],
        [-0.58, -0.68], [-0.84, -0.44], [-0.97, -0.15], [-0.92, 0.08], [-0.7, 0.17], [-0.4, 0.18], [-0.18, 0.22],
        [0.02, 0.38], [0.3, 0.44], [0.52, 0.36], [0.6, 0.18], [0.8, 0.12]], true, 12);
    cerebrum = cerebrum.map(function (p, i) {
        if (p[1] > 0.1) return p; // keep the underside smooth
        var l = Math.hypot(p[0], p[1]) || 1, bump = 0.022 * Math.abs(Math.sin(i * 0.55));
        return [p[0] + (p[0] / l) * bump, p[1] + (p[1] / l) * bump];
    });
    var cerebellum = smooth([[-0.2, 0.28], [-0.45, 0.22], [-0.74, 0.24], [-0.88, 0.38], [-0.76, 0.55], [-0.48, 0.62], [-0.24, 0.54], [-0.14, 0.4]], true, 10);
    var stem = smooth([[-0.1, 0.3], [0.06, 0.36], [0.04, 0.6], [0.0, 0.9], [-0.1, 0.9], [-0.09, 0.6]], true, 8);
    var fissure = smooth([[0.56, 0.22], [0.3, 0.1], [0.02, 0.04], [-0.24, -0.03]], false, 10); // lateral (Sylvian) fissure

    // Winding fold pattern: points near the zero-crossings of this field form gyri-like ridges
    function foldField(x, y) {
        return Math.sin(11 * x + 2.2 * Math.sin(7 * y)) + Math.sin(11 * y + 2.2 * Math.sin(7 * x) + 1);
    }

    // ---- Particles ----
    var pts = []; // {x, y, bright, fold}
    var STEP = 0.026;
    for (var gy = -0.9; gy <= 0.95; gy += STEP) {
        for (var gx = -1; gx <= 1; gx += STEP) {
            var x = gx + (rand() - 0.5) * STEP * 0.9, y = gy + (rand() - 0.5) * STEP * 0.9;
            if (inside(cerebrum, x, y)) {
                if (distToPolyline(fissure, x, y) < 0.03) continue; // leave the fissure as a dark gap
                var onFold = Math.abs(foldField(x, y)) < 0.3;
                if (onFold ? rand() < 0.5 : rand() < 0.12) pts.push({ x: x, y: y, fold: onFold });
            } else if (inside(cerebellum, x, y)) {
                var folia = Math.abs(Math.sin(y * 42 + x * 5 + Math.sin(x * 9) * 0.6)) < 0.35;
                if (folia ? rand() < 0.95 : rand() < 0.05) pts.push({ x: x, y: y, fold: folia });
            } else if (inside(stem, x, y)) {
                if (rand() < 0.35) pts.push({ x: x, y: y, fold: false });
            }
        }
    }
    // Main gyri: anatomical fold lines sampled densely, so the classic brain folds read clearly
    function meander(line, amp) {
        var phase = rand() * 6.28, freq = 0.5 + rand() * 0.3;
        return line.map(function (p, i) {
            var a = line[Math.max(0, i - 1)], b = line[Math.min(line.length - 1, i + 1)];
            var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, o = amp * Math.sin(i * freq + phase);
            return [p[0] - (dy / l) * o, p[1] + (dx / l) * o];
        });
    }
    [
        [[0.12, -0.8], [0.16, -0.5], [0.1, -0.3], [0.2, -0.06]],             // central sulcus
        [[0.33, -0.76], [0.37, -0.46], [0.31, -0.25], [0.4, 0.04]],          // precentral
        [[-0.08, -0.8], [-0.04, -0.5], [-0.12, -0.3], [-0.04, -0.08]],       // postcentral
        [[0.84, -0.4], [0.64, -0.46], [0.52, -0.62]],                        // superior frontal
        [[0.88, -0.12], [0.68, -0.22], [0.5, -0.12]],                        // inferior frontal
        [[0.72, -0.64], [0.58, -0.32], [0.64, -0.02]],                       // middle frontal
        [[0.62, -0.7], [0.82, -0.54], [0.9, -0.3]],                          // frontal pole
        [[-0.28, -0.78], [-0.5, -0.6], [-0.56, -0.36]],                      // superior parietal
        [[-0.26, -0.62], [-0.4, -0.42], [-0.3, -0.2]],                       // parietal
        [[-0.2, -0.12], [-0.44, -0.16], [-0.64, -0.34]],                     // supramarginal
        [[-0.38, 0.02], [-0.6, -0.02], [-0.84, -0.1]],                       // angular
        [[-0.6, -0.54], [-0.74, -0.28], [-0.66, -0.02]],                     // occipital
        [[0.44, 0.3], [0.15, 0.24], [-0.15, 0.15], [-0.46, 0.09]],           // superior temporal
        [[0.32, 0.39], [0.05, 0.33], [-0.32, 0.26]]                          // inferior temporal
    ].forEach(function (c) {
        var line = meander(smooth(c, false, 14), 0.03);
        for (var i = 0; i < line.length - 1; i++) {
            var a = line[i], b = line[i + 1];
            var n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.016));
            for (var k = 0; k < n; k++) {
                var x = a[0] + (b[0] - a[0]) * (k / n) + (rand() - 0.5) * 0.014;
                var y = a[1] + (b[1] - a[1]) * (k / n) + (rand() - 0.5) * 0.014;
                if (inside(cerebrum, x, y) && distToPolyline(fissure, x, y) > 0.03) pts.push({ x: x, y: y, fold: true, gyrus: true });
            }
        }
    });

    // Bright outline particles trace the silhouette
    var rim = [];
    [cerebrum, cerebellum, stem].forEach(function (poly) {
        for (var i = 0; i < poly.length; i += 1) {
            var a = poly[i], b = poly[(i + 1) % poly.length];
            var n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.022));
            for (var k = 0; k < n; k++) {
                var j = (rand() - 0.5) * 0.012;
                var p = { x: a[0] + (b[0] - a[0]) * (k / n) + j, y: a[1] + (b[1] - a[1]) * (k / n) - j, fold: poly !== stem, rim: poly !== stem };
                pts.push(p);
                if (poly === cerebrum) rim.push(p);
            }
        }
    });

    // Plexus mesh: link particles closer than LINK (spatial hash keeps it fast)
    var LINK = 0.052, cell = {}, edges = [], adj = pts.map(function () { return []; });
    var key = function (x, y) { return Math.floor(x / LINK) + "," + Math.floor(y / LINK); };
    pts.forEach(function (p, i) { (cell[key(p.x, p.y)] = cell[key(p.x, p.y)] || []).push(i); });
    pts.forEach(function (p, i) {
        var kx = Math.floor(p.x / LINK), ky = Math.floor(p.y / LINK);
        for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) {
            (cell[(kx + dx) + "," + (ky + dy)] || []).forEach(function (j) {
                if (j <= i) return;
                var q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
                if (d < LINK && (p.fold || q.fold)) { edges.push([i, j, d]); adj[i].push(j); adj[j].push(i); }
            });
        }
    });

    // A few particles sparkle now and then
    var sparkles = [];
    for (var s = 0; s < 70; s++) sparkles.push({ i: (rand() * pts.length) | 0, ph: rand() * 6.28, sp: 0.6 + rand() * 0.8 });

    // Theme colour across the brain: cyan at the back, violet at the front
    function hue(x, a) {
        var t = Math.max(0, Math.min(1, (x + 1) / 2));
        var r = Math.round(0 + t * 170), g = Math.round(216 - t * 120), b = Math.round(255 - t * 2);
        return "rgba(" + r + "," + g + "," + b + "," + a + ")";
    }

    var size = 0, cx = 0, cy = 0, coreR = 0, dpr = 1;
    var pulses = [], bolts = [], brainFlash = -1e9, paused = false, last = 0, running = false, frame = null, breath = 1;

    function X(x) { return cx + x * coreR; }
    function Y(y) { return cy + (y - 0.03) * coreR; } // nudge up so the brainstem sits in the core
    // Same, including the breathing scale (for animated overlays)
    function BX(x) { return cx + (X(x) - cx) * breath; }
    function BY(y) { return cy + (Y(y) - cy) * breath; }

    // Render the static brain (mesh + particles) once per size
    function renderLayer() {
        layer.width = canvas.width;
        layer.height = canvas.height;
        lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        lctx.clearRect(0, 0, size, size);
        lctx.globalCompositeOperation = "lighter";

        lctx.lineWidth = 0.6;
        edges.forEach(function (e) {
            var p = pts[e[0]], q = pts[e[1]];
            lctx.strokeStyle = hue((p.x + q.x) / 2, p.fold && q.fold ? 0.32 : 0.12);
            lctx.beginPath();
            lctx.moveTo(X(p.x), Y(p.y));
            lctx.lineTo(X(q.x), Y(q.y));
            lctx.stroke();
        });

        pts.forEach(function (p) {
            var r = p.rim ? 1.25 : p.gyrus ? 1.35 : p.fold ? 1.05 : 0.8;
            lctx.fillStyle = hue(p.x, p.rim || p.gyrus ? 0.95 : p.fold ? 0.7 : 0.4);
            lctx.beginPath();
            lctx.arc(X(p.x), Y(p.y), r, 0, Math.PI * 2);
            lctx.fill();
        });
        lctx.globalCompositeOperation = "source-over";
    }

    function resize() {
        size = root.clientWidth;
        dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cx = cy = size / 2;
        coreR = size * CORE;
        nodes.forEach(function (n) { n.half = n.el.offsetWidth / 2 || 21; });
        renderLayer();
        placeNodes(0);
        if (!running) draw(performance.now());
    }

    function placeNodes(dt) {
        nodes.forEach(function (n) {
            if (!paused && !reduceMotion) n.angle += ORBITS[n.orbit].speed * dt;
            var r = ORBITS[n.orbit].r * size;
            n.x = cx + Math.cos(n.angle) * r;
            n.y = cy + Math.sin(n.angle) * r;
            n.el.style.transform = "translate(" + (n.x - n.half) + "px," + (n.y - n.half) + "px)";
        });
    }

    // Lightning starts at the rim particle facing the node
    function boltPath(n) {
        var dx = n.x - cx, dy = n.y - cy, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
        var start = rim.reduce(function (best, p) { return p.x * ux + p.y * uy > best.x * ux + best.y * uy ? p : best; }, rim[0]);
        var sx = X(start.x), sy = Y(start.y), ex = n.x - ux * n.half, ey = n.y - uy * n.half;
        var out = [], steps = 12, amp = Math.min(14, Math.hypot(ex - sx, ey - sy) * 0.07);
        for (var k = 0; k <= steps; k++) {
            var f = k / steps, off = (Math.random() * 2 - 1) * amp * Math.sin(Math.PI * f);
            out.push([sx + (ex - sx) * f - uy * off, sy + (ey - sy) * f + ux * off]);
        }
        return out;
    }

    // Neural signal: a random walk through the mesh, drawn as a streak with a fading tail
    function spawnPulse(t, fast) {
        var i = (Math.random() * pts.length) | 0, path = [i], prev = -1;
        for (var h = 0; h < 12; h++) {
            var nb = adj[i].filter(function (j) { return j !== prev; });
            if (!nb.length) break;
            prev = i;
            i = nb[(Math.random() * nb.length) | 0];
            path.push(i);
        }
        if (path.length > 3) pulses.push({ path: path, born: t, dur: fast ? 450 + Math.random() * 250 : 900 + Math.random() * 700 });
    }

    function fire(n, t) {
        t = t || performance.now();
        bolts.push({ n: n, born: t, pts: boltPath(n) });
        brainFlash = t;
        for (var k = 0; k < 8; k++) spawnPulse(t, true);
        setTimeout(function () {
            n.el.classList.remove("is-hit");
            void n.el.offsetWidth;
            n.el.classList.add("is-hit");
        }, BOLT_TRAVEL);
        if (statusEl) statusEl.textContent = "routing → " + n.label;
    }

    function draw(t) {
        ctx.clearRect(0, 0, size, size);
        var flash = Math.max(0, 1 - (t - brainFlash) / 650);

        // Synapses: faint data-flow lines from the brain to every node
        ctx.save();
        ctx.setLineDash([2, 7]);
        ctx.lineDashOffset = -t * 0.03;
        ctx.strokeStyle = "rgba(0, 216, 255, 0.14)";
        ctx.lineWidth = 1;
        nodes.forEach(function (n) {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();
        });
        ctx.restore();

        // Aura behind the brain
        var aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 1.2);
        aura.addColorStop(0, "rgba(0, 216, 255, " + (0.14 + flash * 0.22) + ")");
        aura.addColorStop(0.6, "rgba(117, 16, 247, " + (0.16 + flash * 0.14) + ")");
        aura.addColorStop(1, "rgba(117, 16, 247, 0)");
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR * 1.2, 0, Math.PI * 2);
        ctx.fill();

        // The brain itself, gently breathing; flares additively right after a discharge
        breath = reduceMotion ? 1 : 1 + 0.012 * Math.sin(t / 1300);
        var w = size * breath, off = (size - w) / 2;
        ctx.drawImage(layer, off, off, w, w);
        if (flash > 0) {
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = flash * 0.55;
            ctx.drawImage(layer, off, off, w, w);
            ctx.restore();
        }

        if (!reduceMotion) {
            // Sparkles
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            sparkles.forEach(function (s) {
                var a = Math.pow(Math.max(0, Math.sin(t / 700 * s.sp + s.ph)), 6);
                if (a < 0.05) return;
                var p = pts[s.i];
                ctx.fillStyle = "rgba(255, 255, 255, " + a + ")";
                ctx.beginPath();
                ctx.arc(BX(p.x), BY(p.y), 1.6 + a * 1.4, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();

            // Neural signals racing through the mesh
            if (Math.random() < 0.3) spawnPulse(t, false);
            pulses = pulses.filter(function (p) { return t - p.born < p.dur; });
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            pulses.forEach(function (p) {
                var head = ((t - p.born) / p.dur) * (p.path.length - 1);
                var from = Math.max(0, head - 3.5);
                ctx.beginPath();
                for (var f = from, k = 0; f <= head; f += 0.5, k++) {
                    var i = Math.floor(f), r = f - i, a = pts[p.path[i]], b = pts[p.path[Math.min(i + 1, p.path.length - 1)]];
                    ctx[k ? "lineTo" : "moveTo"](BX(a.x + (b.x - a.x) * r), BY(a.y + (b.y - a.y) * r));
                }
                ctx.strokeStyle = "rgba(230, 251, 255, 0.85)";
                ctx.lineWidth = 1.6;
                ctx.shadowColor = "#00d8ff";
                ctx.shadowBlur = 8;
                ctx.stroke();
            });
            ctx.restore();
        }

        // Lightning discharges: travel out to the node, crackle, then fade
        bolts = bolts.filter(function (b) { return t - b.born < BOLT_LIFE; });
        ctx.save();
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        bolts.forEach(function (b) {
            var age = t - b.born;
            if (Math.random() < 0.5) b.pts = boltPath(b.n); // re-jag for a crackling look
            var reach = Math.min(1, age / BOLT_TRAVEL), fade = age < BOLT_TRAVEL ? 1 : 1 - (age - BOLT_TRAVEL) / (BOLT_LIFE - BOLT_TRAVEL);
            var count = Math.max(2, Math.ceil(b.pts.length * reach));
            [[6, "rgba(0, 216, 255, " + 0.25 * fade + ")"], [2.2, "rgba(127, 231, 255, " + 0.85 * fade + ")"], [0.9, "rgba(255, 255, 255, " + fade + ")"]].forEach(function (layerStyle) {
                ctx.lineWidth = layerStyle[0];
                ctx.strokeStyle = layerStyle[1];
                ctx.shadowColor = "#00d8ff";
                ctx.shadowBlur = layerStyle[0] > 3 ? 14 : 6;
                ctx.beginPath();
                for (var k = 0; k < count; k++) ctx[k ? "lineTo" : "moveTo"](b.pts[k][0], b.pts[k][1]);
                ctx.stroke();
            });
        });
        ctx.restore();
    }

    // Ambient discharges at random intervals
    var nextAmbient = 0;
    function loop(t) {
        var dt = last ? Math.min(64, t - last) : 0;
        last = t;
        placeNodes(dt);
        if (t > nextAmbient) {
            if (nextAmbient) fire(nodes[(Math.random() * nodes.length) | 0], t);
            nextAmbient = t + 1300 + Math.random() * 1500;
        }
        draw(t);
        frame = requestAnimationFrame(loop);
    }

    function setRunning(on) {
        if (reduceMotion || on === running) return;
        running = on;
        if (on) { last = 0; frame = requestAnimationFrame(loop); }
        else cancelAnimationFrame(frame);
    }

    // Hover / focus: pause the orbits and discharge into that node
    nodes.forEach(function (n) {
        var enter = function () { paused = true; if (!reduceMotion) fire(n); };
        var leave = function () { paused = false; };
        n.el.addEventListener("pointerenter", enter);
        n.el.addEventListener("focus", enter);
        n.el.addEventListener("pointerleave", leave);
        n.el.addEventListener("blur", leave);
        n.el.addEventListener("click", function () { if (!reduceMotion) fire(n); });
    });

    // The hero headline announces each typed role; route a discharge to the matching tech
    var ROUTES = {
        "scalable APIs": ["spring", "java"],
        "React interfaces": ["react"],
        "Flutter apps": ["flutter"],
        "AI agents": ["ai"],
        "microservices": ["docker", "aws"]
    };
    document.addEventListener("hero:word", function (e) {
        (ROUTES[e.detail] || []).forEach(function (k, i) {
            var n = nodes.find(function (m) { return m.key === k; });
            if (n && running) setTimeout(function () { fire(n); }, i * 160);
        });
    });

    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(root);
    else window.addEventListener("resize", resize);
    resize();

    new IntersectionObserver(function (entries) { setRunning(entries[0].isIntersecting); }).observe(root);
})();
