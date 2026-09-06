/* Tests for the routing decision in assets/lang.js.
 *
 * Two bugs live behind these cases.
 *
 *   1. Choosing Korean on a page with no Korean variant set a site-wide googtrans cookie, and every English
 *      article opened afterwards was machine-translated even though a hand-written Korean page sat one URL
 *      away. The rule "an authored page beats a machine translation" ran only when the picker changed.
 *   2. Fixing (1) by clearing the cookie lost the reader's intent instead: the next page that exists only
 *      in English came back in English. Hence a preference stored apart from the cookie.
 *
 * Run: node tools/test-lang.js
 */
"use strict";

var LangRoute = require("../assets/lang.js");
var wantedLanguage = LangRoute.wantedLanguage;
var authoredDestination = LangRoute.authoredDestination;

var A = { en: "post.html", ko: "post.ko.html", ja: "post.ja.html" };

var failed = 0;
var ran = 0;

function eq(what, got, expected) {
  ran++;
  if (got !== expected) {
    failed++;
    console.error("FAIL  " + what + "\n      expected " + JSON.stringify(expected) +
                  "\n      got      " + JSON.stringify(got));
  }
}

/* ---- wantedLanguage: what does the reader want? --------------------------------------------- */

eq("the stored preference is the answer when there is one",
  wantedLanguage("en", null, "ko"), "ko");
eq("the preference wins over the cookie, because the cookie only describes this page",
  wantedLanguage("en", "/en/ja", "ko"), "ko");
eq("a preference is normalised, so a stored 'KO' still matches a 'ko' variant key",
  wantedLanguage("en", null, "KO"), "ko");
eq("with no preference, the widget's own cookie stands in",
  wantedLanguage("en", "/en/ko", null), "ko");
eq("no preference and no cookie means no opinion",
  wantedLanguage("en", null, null), null);
eq("a cookie set on a page in another language describes nothing here",
  wantedLanguage("ko", "/en/ja", null), null);
eq("malformed cookie, no slashes", wantedLanguage("en", "ko", null), null);
eq("malformed cookie, no target", wantedLanguage("en", "/en", null), null);
eq("empty target", wantedLanguage("en", "/en/", null), null);

/* ---- authoredDestination: should this load be replaced? -------------------------------------- */

eq("the reported bug: an English page, a reader who wants Korean, a Korean page exists",
  authoredDestination("en", A, "ko", "post.html"), "post.ko.html");
eq("same for Japanese",
  authoredDestination("en", A, "ja", "post.html"), "post.ja.html");
eq("routing works from any authored page, not only from English",
  authoredDestination("ja", A, "ko", "post.ja.html"), "post.ko.html");
eq("and back the other way",
  authoredDestination("ko", A, "en", "post.ko.html"), "post.html");

eq("the reader is already reading the language they want",
  authoredDestination("ko", A, "ko", "post.ko.html"), null);
eq("no opinion, no routing",
  authoredDestination("en", A, null, "post.html"), null);
eq("Spanish: nobody wrote this page in it, so the widget keeps it",
  authoredDestination("en", A, "es", "post.html"), null);
eq("a page with no authored variants at all (home, the CV) stays with the widget",
  authoredDestination("en", {}, "ko", "index.html"), null);
eq("no authored map at all",
  authoredDestination("en", null, "ko", "post.html"), null);

/* The loop guard. If the destination is the file already open, replacing the load navigates to the page
   it is already on — which re-runs this decision and navigates again. */
eq("never route to the file already open",
  authoredDestination("en", { en: "post.html", ko: "post.ko.html" }, "ko", "post.ko.html"), null);
eq("an authored entry that is present but empty is not a destination",
  authoredDestination("en", { ko: "" }, "ko", "post.html"), null);

/* ---- seeding the preference from the page ---------------------------------------------------- */
/* 한국어 기사에서 「목록」을 누르면 목록 페이지가 영어로 나왔다. 선호가 한 번도 기록된 적이
   없어서 위젯을 켤 근거가 없었기 때문이다. 읽고 있는 페이지의 언어를 선호의 씨앗으로 쓴다. */
var seedPreference = LangRoute.seedPreference;

eq("a Korean page with no stored preference seeds Korean",
  seedPreference("ko", null), "ko");
eq("an English page with no stored preference seeds English",
  seedPreference("en", null), "en");
/* 이게 없으면 영어 전용 페이지를 한 번 들르는 것만으로 한국어 선호가 날아간다. */
eq("a stored preference is never overwritten by the page language",
  seedPreference("en", "ko"), "ko");
eq("an empty stored preference is treated as absent",
  seedPreference("ja", ""), "ja");
eq("a stored preference is lower-cased",
  seedPreference("en", "KO"), "ko");

/* ---- the two together, as a page actually uses them ------------------------------------------ */

function decide(page, authored, cookie, pref, file) {
  return authoredDestination(page, authored, wantedLanguage(page, cookie, pref), file);
}

eq("end to end: Korean chosen on the home page, then an English article is opened",
  decide("en", A, "/en/ko", "ko", "post.html"), "post.ko.html");
eq("end to end: having landed on the Korean article, it stays there",
  decide("ko", A, null, "ko", "post.ko.html"), null);
eq("end to end: the reader wants Spanish, so no navigation happens and the widget runs",
  decide("en", A, null, "es", "post.html"), null);

if (ran === 0) {
  console.error("FATAL: no assertions ran. A test file that checks nothing is worse than none.");
  process.exit(2);
}
if (failed) {
  console.error("\n" + failed + " / " + ran + " 실패");
  process.exit(1);
}
console.log("통과 — " + ran + " 단언");
