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

  /* ---- code windows ------------------------------------------------------------------------------ */
  /* Every <pre> becomes a terminal-looking window with the language named in its title bar. Done here
     rather than in the markup so that the twenty-four article pages cannot drift apart, and so that a page
     written before this existed gets it too.

     The language comes from data-lang when the author set one. Detection is only a fallback: a wrong guess
     colours the wrong tokens and the reader has no way to tell it guessed. */
  /* 경고·결정 문단을 카드로.
     「⚠️ …」로 시작하는 문단은 본문의 흐름이 아니라 **읽는 사람이 조건을 알고 있어야 하는
     대목**이다. 다른 문단과 모양이 같으면 그냥 지나치기 쉬워서, Confluence 의 패널처럼 왼쪽에
     색 띠를 둔 카드로 뗀다. 표시는 글 안에 이미 이모지로 있으므로 클래스만 붙인다. */
  var NOTE_KINDS = [
    { mark: "⚠️", cls: "warn" },
    { mark: "🔒", cls: "lock" }
  ];

  function decorateNotes() {
    var ps = document.querySelectorAll(".article-body p");
    for (var i = 0; i < ps.length; i++) {
      var text = (ps[i].textContent || "").trim();
      for (var k = 0; k < NOTE_KINDS.length; k++) {
        if (text.indexOf(NOTE_KINDS[k].mark) === 0) {
          ps[i].classList.add("note-card", NOTE_KINDS[k].cls);
          break;
        }
      }
    }
  }

  function decorateCode() {
    if (typeof CodeHighlight === "undefined") return;   // the script failed to load; plain <pre> still reads

    var pageLang = (document.documentElement.getAttribute("lang") || "en").toLowerCase();
    var pres = document.querySelectorAll(".article-body pre");

    for (var i = 0; i < pres.length; i++) {
      var pre = pres[i];
      if (pre.parentNode && pre.parentNode.className.indexOf("code-window") !== -1) continue;

      var code = pre.querySelector("code") || pre;
      var lang = pre.getAttribute("data-lang") || code.getAttribute("data-lang") ||
                 CodeHighlight.detect(code.textContent);

      var win = document.createElement("div");
      win.className = "code-window";

      var bar = document.createElement("div");
      bar.className = "code-bar";
      // The dots are decoration and say nothing; the label is the content, and must survive translation
      // because "Shell" is a name, not a word.
      bar.innerHTML = '<span class="code-dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
                      '<span class="code-lang notranslate" translate="no">' +
                      CodeHighlight.escape(CodeHighlight.label(lang, pageLang)) + "</span>";

      pre.parentNode.insertBefore(win, pre);
      win.appendChild(bar);
      win.appendChild(pre);

      code.innerHTML = CodeHighlight.render(lang, code.textContent);
    }
  }

  /* ---- contents rail ------------------------------------------------------------------------------ */
  /* Marks the section the reader is in. The rail is a list of links until this runs, which is why the
     highlight is added here and not baked into the markup: without JS the contents still work. */
  function initToc() {
    /* ⚠️ 예전에는 `.article-body .article-toc` 로 찾았다. 목차를 <article> 밖 레일로 옮기면서
       이 선택자가 아무것도 못 찾게 됐고, **현재 절 형광펜이 조용히 죽었다** — 오류도 없고
       목차는 그대로 보이니 눈에 띄지 않는다. 위치에 기대지 않고 클래스로 찾는다. */
    var toc = document.querySelector(".article-toc");
    if (!toc) return;

    var links = toc.querySelectorAll('a[href^="#"]');
    var map = [];
    for (var i = 0; i < links.length; i++) {
      var raw = links[i].getAttribute("href").slice(1);
      var id = raw;
      try { id = decodeURIComponent(raw); } catch (e) { /* already decoded, or malformed */ }
      var el = document.getElementById(id) || document.getElementById(raw);
      if (el) map.push({ link: links[i], el: el });
    }
    if (!map.length) return;

    var current = null;
    function update() {
      // The offset is the sticky bar plus a little, so a heading counts as reached when it arrives under
      // the bar rather than when it touches the top of the window.
      var line = 150;
      var found = map[0];
      for (var i = 0; i < map.length; i++) {
        if (map[i].el.getBoundingClientRect().top <= line) found = map[i];
      }
      if (found === current) return;
      if (current) current.link.classList.remove("is-current");
      found.link.classList.add("is-current");
      current = found;
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { ticking = false; update(); });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  decorateCode();
  decorateNotes();
  initToc();

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
