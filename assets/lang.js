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

/* The routing decision, kept pure and outside the IIFE so tools/test-lang.js can drive it in node.
 *
 * Two mechanisms, one reader intent. The reader picks a language once; after that every page has to work
 * out for itself whether that intent is served by navigating to a page a person wrote, or by handing the
 * page to Google's widget. Getting this wrong in either direction is what the file exists to prevent:
 *
 *   - Choose Korean on a page with no Korean variant (home, the section indexes, the CV) and only the
 *     widget can serve it. Its cookie is site-wide, so without the rule below every English article opened
 *     afterwards was machine-translated even where a hand-written Korean page sat one URL away.
 *   - Clear that state when routing to the authored page and the intent is lost instead: the next
 *     English-only page comes back in English. Hence the preference is remembered separately from the
 *     cookie, which only ever describes what the widget is doing right now.
 */
var LangRoute = {
  /* What language does the reader want? The stored preference is the durable answer; the googtrans cookie
     is a fallback so that a choice made before the preference existed is still honoured. */
  wantedLanguage: function (page, cookie, pref) {
    if (pref) return String(pref).toLowerCase();
    var parts = String(cookie || "").split("/");   // ["", source, target]
    if (parts.length < 3) return null;
    var source = parts[1], target = parts[2];
    if (!target) return null;
    // A cookie whose source is not this page's language was set elsewhere and describes nothing here.
    if (source && source !== page) return null;
    return target;
  },

  /* Where should this load go instead? null means stay — either the reader is already where they want to
     be, or no one has written this page in the language they want and the widget takes over. */
  authoredDestination: function (page, authored, wanted, currentFile) {
    if (!wanted || !authored) return null;
    if (wanted === page) return null;
    if (!Object.prototype.hasOwnProperty.call(authored, wanted)) return null;
    var target = authored[wanted];
    if (!target) return null;
    if (currentFile && target === currentFile) return null;   // already on it
    return target;
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

  /* ---- the reader's language, remembered across pages -------------------------------------------- */
  /* The cookie cannot carry this. It records what the widget is doing on one page, and it has to be
     cleared whenever we route to an authored page — so storing the intent there loses it exactly when the
     reader crosses from an article into a page that exists in one language only. */
  var PREF_KEY = "lang.pref";

  function readPref() {
    try { return localStorage.getItem(PREF_KEY); } catch (e) { return null; }  // private mode throws
  }

  function writePref(lang) {
    try {
      if (lang) localStorage.setItem(PREF_KEY, lang);
      else localStorage.removeItem(PREF_KEY);
    } catch (e) { /* the site still works, it just forgets */ }
  }

  var wanted = LangRoute.wantedLanguage(PAGE, readCookie(), readPref());

  /* A hand-written page beats a machine translation on load too, not only when the picker changes.
     The cookie goes with it — its source is this page's language, which is about to stop being true —
     but the preference does not, so an English-only page later still gets translated. */
  var currentFile = location.pathname.split("/").pop();
  var destination = LangRoute.authoredDestination(PAGE, authored, wanted, currentFile);
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

  /* Poll for the widget's own <select>, which element.js injects asynchronously. Bounded, or a widget
     that never loads leaves a timer running for the life of the page. */
  function applyWidgetWhenReady(lang) {
    var tries = 0;
    (function attempt() {
      if (applyWidget(lang) || tries++ > 60) return;
      setTimeout(attempt, 120);
    })();
  }

  /* Nobody wrote this page in the language the reader asked for, so the widget serves it — including on a
     fresh load, which is what makes the preference survive leaving an article. */
  if (wanted && wanted !== PAGE && !Object.prototype.hasOwnProperty.call(authored, wanted) && !active) {
    picker.value = wanted;
    applyWidgetWhenReady(wanted);
  }

  picker.addEventListener("change", function () {
    var lang = this.value || PAGE;

    // The choice is the reader's intent for the whole site, not for this page, so it is recorded before
    // anything else happens — including on the branches below that navigate away.
    writePref(lang);

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

    // No hand-written variant: hand it to the widget.
    applyWidgetWhenReady(lang);
  });
})();
