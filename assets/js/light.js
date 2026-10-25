var lightboxDescription = GLightbox({
  selector: 'glightbox',
  touchNavigation: true,
  keyboardNavigation: true,
  closeButton: true,
  closeOnOutsideClick: true,
  loop: true
});

function refreshLightbox() {
  if (lightboxDescription && typeof lightboxDescription.reload === "function") {
    lightboxDescription.reload();
  }
}

// Certificate collage: filter chips + "show all" toggle
(function () {
  var section = document.querySelector(".cert-section");
  if (!section) return;

  var wrap = section.querySelector(".cert-collage-wrap");
  var tiles = Array.from(section.querySelectorAll(".cert-tile"));
  var chips = Array.from(section.querySelectorAll(".cert-chip"));
  var more = section.querySelector(".cert-more");
  var toggle = section.querySelector("[data-cert-toggle]");

  // Load each thumbnail only when its tile is about to become visible. Tiles clipped by the
  // collapsed collage don't count as visible, so nothing below the fold downloads until "Show all".
  function loadTile(tile) {
    var img = tile.querySelector("img[data-src]");
    if (!img) return;
    img.onload = function () { tile.classList.add("is-loaded"); };
    img.onerror = function () { tile.classList.add("is-loaded", "is-broken"); };
    img.src = img.dataset.src;
    img.removeAttribute("data-src");
  }

  if ("IntersectionObserver" in window) {
    var imageObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        imageObserver.unobserve(entry.target);
        loadTile(entry.target);
      });
    }, { rootMargin: "200px 0px" });
    tiles.forEach(function (tile) { imageObserver.observe(tile); });
  } else {
    tiles.forEach(loadTile);
  }

  // Hide the "show all" button when everything already fits in the collapsed height
  function updateToggle() {
    var collapsed = wrap.classList.contains("is-collapsed");
    var overflowing = wrap.scrollHeight > wrap.clientHeight + 4;
    more.hidden = collapsed && !overflowing;
    wrap.classList.toggle("is-clipped", collapsed && overflowing);
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var filter = chip.dataset.filter;

      chips.forEach(function (c) {
        var active = c === chip;
        c.classList.toggle("active", active);
        c.setAttribute("aria-pressed", active);
      });

      tiles.forEach(function (tile) {
        var show = filter === "all" || tile.dataset.category === filter;
        tile.hidden = !show;
        // Only visible tiles take part in lightbox navigation
        tile.classList.toggle("glightbox", show);
        if (show) {
          tile.classList.remove("cert-in");
          void tile.offsetWidth;
          tile.classList.add("cert-in");
        }
      });

      refreshLightbox();
      updateToggle();
    });
  });

  toggle.addEventListener("click", function () {
    var expand = wrap.classList.contains("is-collapsed");
    wrap.classList.toggle("is-collapsed", !expand);
    toggle.setAttribute("aria-expanded", expand);
    toggle.querySelector("span").textContent = expand ? "Show fewer" : "Show all certificates";
    if (!expand) section.scrollIntoView({ behavior: "smooth", block: "start" });
    updateToggle();
  });

  window.addEventListener("resize", updateToggle);
  updateToggle();
})();
