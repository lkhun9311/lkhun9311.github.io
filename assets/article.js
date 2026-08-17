// Long-form article behaviour. Kept out of the page bodies so the two articles cannot drift apart.
(function () {
  "use strict";

  // A table only needs a scroll affordance when it actually overflows, and stops needing it once the reader
  // has reached the right edge — a fade still showing there claims content that is not present.
  //
  // Neither state can be decided when the page is written. The width depends on the viewport, on the webfont
  // that lands after first layout, and on Google Translate rewriting every cell into a language with
  // different word lengths.
  function measure(box) {
    var vp = box.querySelector(".table-scroll-viewport");
    if (!vp) return;

    // One pixel of slack absorbs sub-pixel rounding, which reports a table that fits exactly as overflowing
    // on fractional device pixel ratios.
    var over = vp.scrollWidth > vp.clientWidth + 1;
    box.classList.toggle("is-overflowing", over);
    box.classList.toggle("at-end", over && vp.scrollLeft + vp.clientWidth >= vp.scrollWidth - 1);

    // The fade is a child of the outer box, which is taller than the viewport by the height of the hint, so
    // it needs the viewport's height rather than the box's.
    box.style.setProperty("--scroll-viewport-height", vp.clientHeight + "px");
  }

  function measureAll() {
    var boxes = document.querySelectorAll(".article-body .table-scroll");
    for (var i = 0; i < boxes.length; i++) measure(boxes[i]);
  }

  var pending = null;
  function schedule() {
    if (pending !== null) return;
    pending = window.requestAnimationFrame(function () {
      pending = null;
      measureAll();
    });
  }

  var boxes = document.querySelectorAll(".article-body .table-scroll");
  for (var i = 0; i < boxes.length; i++) {
    var vp = boxes[i].querySelector(".table-scroll-viewport");
    if (vp) vp.addEventListener("scroll", schedule, { passive: true });
  }

  measureAll();
  window.addEventListener("resize", schedule);

  // Webfonts land after first layout and change every column width, so the first measurement is provisional.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measureAll);
  }

  // Google Translate replaces the text of every cell in place, which can turn a table that fit into one that
  // does not. It gives no callback, so the change has to be observed. The handler is the same rAF-coalesced
  // one used for resize, so a translation pass that rewrites hundreds of nodes still measures once.
  var body = document.querySelector(".article-body");
  if (body && window.MutationObserver) {
    new MutationObserver(schedule).observe(body, {
      subtree: true,
      childList: true,
      characterData: true,
    });
  }
})();
