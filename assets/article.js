// Long-form article behaviour. Kept out of the page bodies so the two articles cannot drift apart.
(function () {
  "use strict";

  // A table only needs a scroll affordance when it actually overflows.
  // The width depends on the viewport, the font that finally loaded and the reader's zoom, so it cannot be
  // decided when the page is written; it has to be measured after layout and re-measured on resize.
  function markOverflow() {
    var boxes = document.querySelectorAll(".article-body .table-scroll");
    for (var i = 0; i < boxes.length; i++) {
      // The one-pixel slack absorbs sub-pixel rounding, which otherwise reports a table that fits exactly
      // as overflowing on fractional device pixel ratios.
      var over = boxes[i].scrollWidth > boxes[i].clientWidth + 1;
      boxes[i].classList.toggle("is-overflowing", over);
    }
  }

  var pending = null;
  function schedule() {
    if (pending !== null) return;
    pending = window.requestAnimationFrame(function () {
      pending = null;
      markOverflow();
    });
  }

  markOverflow();
  window.addEventListener("resize", schedule);

  // Webfonts land after first layout and change every column width, so the first measurement is provisional.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(markOverflow);
  }
})();
