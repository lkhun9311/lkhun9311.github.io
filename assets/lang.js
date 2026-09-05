/* Language selection.
 *
 * Two mechanisms live behind one <select>, and conflating them is the bug this file exists to prevent.
 *
 *   ko / en / ja   pages written by hand. The picker NAVIGATES to them.
 *   everything else Google's website widget translates the page in place.
 *
 * Before this file, the picker only ever did the second thing. Choosing "Japanese" on a hand-written
 * Japanese page asked Google to translate ja→ja, and choosing it on the Korean page produced a machine
 * translation of Korean while a human-written Japanese page sat one URL away, unreachable.
 *
 * This script must run BEFORE translate_a/element.js. The widget reads the googtrans cookie at init and
 * translates immediately; the cookie has to be corrected while there is still time to correct it.
 */

/* Given the page's own language, the hand-written variants of this page, and the googtrans cookie,
 * return the variant this load should be replaced by — or null to leave the load alone.
 *
 * This is the rule "an authored page beats a machine translation", applied ON LOAD rather than only when
 * the picker changes. Without it: choose Korean on a page that has no Korean variant (the home page, the
 * section indexes, the CV) and the widget sets a site-wide googtrans cookie. Every English article opened
 * afterwards is then machine-translated — including ones where a hand-written Korean page sits one URL
 * away, which is the whole thing this file exists to prevent.
 *
 * Kept pure and outside the IIFE so tools/test-lang.js can drive it in node with no DOM.
 */
var LangRoute = {
  authoredDestination: function (page, authored, cookie) {
    if (!cookie || !authored) return null;
    var parts = String(cookie).split("/");   // ["", source, target]
    if (parts.length < 3) return null;
    var source = parts[1], target = parts[2];
    if (!target) return null;
    // A cookie whose source is not this page's language was set elsewhere; the caller clears it instead.
    if (source && source !== page) return null;
    // Already the language this page is written in — nothing to route to.
    if (target === page) return null;
    if (!Object.prototype.hasOwnProperty.call(authored, target)) return null;
    return authored[target];
  }
};

if (typeof module !== "undefined" && module.exports) module.exports = LangRoute;

(function () {
  "use strict";

  // node loads this file for the pure function above; everything below needs a document.
  if (typeof document === "undefined") return;

  // The source language is whatever the page declares. Hard-coding 'en' — which every page did until the
  // first Korean article shipped — tells Google that Korean text is English and it translates it as such.
  var PAGE = (document.documentElement.getAttribute("lang") || "en").toLowerCase();

  var picker = document.getElementById("langPicker");

  // {"en": "post.html", "ko": "post.ko.html", ...} — the hand-written variants of THIS page.
  // Absent on pages that exist in one language only, which is most of the site.
  var authored = {};
  if (picker) {
    try {
      authored = JSON.parse(picker.getAttribute("data-authored") || "{}");
    } catch (e) {
      // A malformed attribute must not take the picker down with it: the widget half still works.
      authored = {};
    }
  }

  /* ---- googtrans cookie -------------------------------------------------------------------------- */
  // Format is /<source>/<target>. It persists across pages, which is the point — and the hazard, because
  // the source it records belongs to the page where the reader made the choice.

  function readCookie() {
    var m = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function clearCookie() {
    var past = "; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/";
    document.cookie = "googtrans=" + past;
    // The widget also writes a domain-scoped copy on some paths. Clearing only the host cookie leaves that
    // one to be read on the next load, which looks exactly like the clear not having worked.
    document.cookie = "googtrans=" + past + "; domain=" + location.hostname;
    document.cookie = "googtrans=" + past + "; domain=." + location.hostname;
  }

  // Returns the active target language, or null when there is no usable translation state.
  function activeTarget() {
    var c = readCookie();
    if (!c) return null;
    var parts = c.split("/");           // ["", source, target]
    if (parts.length < 3) return null;
    var source = parts[1], target = parts[2];
    if (!target) return null;
    // A cookie whose source is not this page's language was set somewhere else. Applying it here would
    // translate from a language the page is not written in.
    if (source && source !== PAGE) { clearCookie(); return null; }
    return target;
  }

  var active = activeTarget();

  /* ---- the widget -------------------------------------------------------------------------------- */

  window.googleTranslateElementInit = function () {
    /* global google */
    new google.translate.TranslateElement(
      {
        pageLanguage: PAGE,
        includedLanguages: "en,ko,ja,zh-CN,zh-TW,es,fr,de,pt,ru,vi,id,hi,ar",
        autoDisplay: false
      },
      "google_translate_element"
    );
  };

  /* A hand-written page beats a machine translation on load too, not only when the picker changes.
     The cookie goes with it: its source is this page's language, which is about to stop being true.
     The reader loses the "translate everything" preference here, and that is the right trade — they land
     on a page a person wrote instead of a machine's version of a different one. */
  var destination = LangRoute.authoredDestination(PAGE, authored, readCookie());
  if (destination) {
    clearCookie();
    location.replace(destination);
    return;
  }

  if (!picker) return;

  // Show what the reader is actually looking at: a machine translation if one is active, otherwise the
  // language this page is written in.
  var want = active || PAGE;
  picker.value = want;
  if (picker.value !== want) picker.value = PAGE;  // the option may not exist; fall back

  function applyWidget(lang) {
    var combo = document.querySelector(".goog-te-combo");
    if (!combo) return false;
    combo.value = lang;
    combo.dispatchEvent(new Event("change"));
    return true;
  }

  picker.addEventListener("change", function () {
    var lang = this.value || PAGE;

    // Choosing the language the page is already written in means "show me the original", whether or not a
    // variant map exists. Handing that to the widget would ask Google to translate en→en.
    if (lang === PAGE) {
      clearCookie();
      if (active) location.reload();
      return;
    }

    // A hand-written variant always wins over a machine translation of the same language.
    if (Object.prototype.hasOwnProperty.call(authored, lang)) {
      clearCookie();
      location.href = authored[lang];
      return;
    }

    // No hand-written variant: hand it to the widget. The combo is injected asynchronously, so poll for it
    // rather than assuming it has arrived — but bound the polling, or a widget that never loads leaves a
    // timer running for the life of the page.
    var tries = 0;
    (function attempt() {
      if (applyWidget(lang) || tries++ > 60) return;
      setTimeout(attempt, 120);
    })();
  });
})();
