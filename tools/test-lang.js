/* Tests for the routing decision in assets/lang.js.
 *
 * The bug this exists for: choosing Korean on a page with no Korean variant sets a site-wide googtrans
 * cookie, and every English article opened afterwards was machine-translated even though a hand-written
 * Korean page sat one URL away. The rule "an authored page beats a machine translation" was enforced only
 * when the picker changed, never on load.
 *
 * Run: node tools/test-lang.js
 */
"use strict";

var LangRoute = require("../assets/lang.js");
var authoredDestination = LangRoute.authoredDestination;

var A = { en: "post.html", ko: "post.ko.html", ja: "post.ja.html" };

var cases = [
  // page,  authored, cookie,        expected,        what it is
  ["en", A, "/en/ko", "post.ko.html",
   "the reported bug: English page, cookie says translate to Korean, a Korean page exists"],
  ["en", A, "/en/ja", "post.ja.html",
   "same for Japanese"],
  ["ja", A, "/ja/ko", "post.ko.html",
   "routing works from any authored page, not just English"],
  ["ko", A, "/ko/en", "post.html",
   "and back the other way"],

  ["en", A, null, null,
   "no cookie: nothing to route, leave the load alone"],
  ["en", A, "", null,
   "empty cookie behaves like no cookie"],
  ["en", A, "/en/en", null,
   "target is already this page's language"],
  ["en", A, "/en/es", null,
   "Spanish has no authored page, so the widget keeps it"],
  ["en", {}, "/en/ko", null,
   "a page with no authored variants at all (home, CV) stays with the widget"],
  ["ko", A, "/en/ko", null,
   "cookie source is not this page's language: the caller clears it, we do not route"],
  // The case above passes even with the source check deleted, because target === page catches it on the
  // next line. This one does not: source and target both differ from the page, so only the source check
  // can return null. Without it, a cookie set on an English page would route a Korean reader to Japanese.
  ["ko", A, "/en/ja", null,
   "stale cookie from another page's language must not route anywhere"],
  ["en", A, "ko", null,
   "malformed cookie with no slashes"],
  ["en", A, "/en", null,
   "malformed cookie missing the target"],
  ["en", A, "/en/", null,
   "empty target"],
  ["en", null, "/en/ko", null,
   "no authored map at all"]
];

var failed = 0;
cases.forEach(function (c) {
  var page = c[0], authored = c[1], cookie = c[2], expected = c[3], what = c[4];
  var got;
  try {
    got = authoredDestination(page, authored, cookie);
  } catch (e) {
    got = "THREW: " + e.message;
  }
  if (got !== expected) {
    failed++;
    console.error(
      "FAIL  " + what + "\n" +
      "      page=" + JSON.stringify(page) +
      " cookie=" + JSON.stringify(cookie) +
      " authored=" + JSON.stringify(authored) + "\n" +
      "      expected " + JSON.stringify(expected) + ", got " + JSON.stringify(got)
    );
  }
});

if (cases.length === 0) {
  console.error("FATAL: no cases ran. A test file that checks nothing is worse than none.");
  process.exit(2);
}

if (failed) {
  console.error("\n" + failed + " / " + cases.length + " 실패");
  process.exit(1);
}
console.log("통과 — " + cases.length + " 케이스");
