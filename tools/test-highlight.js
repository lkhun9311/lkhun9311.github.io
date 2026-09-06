/* Tests for assets/highlight.js.
 *
 * The failure that matters here is silent: a highlighter that mis-tokenises produces a page that still
 * looks like a page, just with the wrong words coloured. So the cases below check the boundaries where
 * that happens — a keyword inside a string, a comment marker inside a string, a hyphenated word taken
 * for a flag — rather than only the happy path.
 *
 * Run: node tools/test-highlight.js
 */
"use strict";

var H = require("../assets/highlight.js");

var failed = 0;
var ran = 0;

function check(what, got, expected) {
  ran++;
  if (got !== expected) {
    failed++;
    console.error("FAIL  " + what + "\n      expected " + JSON.stringify(expected) +
                  "\n      got      " + JSON.stringify(got));
  }
}

function contains(what, haystack, needle) {
  ran++;
  if (haystack.indexOf(needle) === -1) {
    failed++;
    console.error("FAIL  " + what + "\n      " + JSON.stringify(needle) + " not in\n      " +
                  JSON.stringify(haystack));
  }
}

function lacks(what, haystack, needle) {
  ran++;
  if (haystack.indexOf(needle) !== -1) {
    failed++;
    console.error("FAIL  " + what + "\n      " + JSON.stringify(needle) + " should not be in\n      " +
                  JSON.stringify(haystack));
  }
}

/* ---- escaping ------------------------------------------------------------------------------- */

check("angle brackets are escaped in plain text",
  H.render("text", "mutableListOf<Boolean>()"),
  "mutableListOf&lt;Boolean&gt;()");

// Boolean is tokenised as a type, so the escaped brackets sit either side of a span rather than
// next to each other. What matters is that no raw bracket survives.
var kt = H.render("kotlin", "val x = mutableListOf<Boolean>()");
contains("opening bracket is escaped inside a highlighted language", kt, "mutableListOf&lt;");
contains("closing bracket is escaped inside a highlighted language", kt, "&gt;()");
lacks("no raw < survives", kt, "<Boolean");

check("ampersands are escaped", H.render("text", "a && b"), "a &amp;&amp; b");

/* The three assertions above all take text that never enters a token, so they pass even with the
   escaping inside span() deleted. These exercise that path: the characters are inside the token. */
check("a bracket inside a string token is escaped",
  H.render("kotlin", 'val s = "a < b"'),
  '<span class="tok-keyword">val</span> s = <span class="tok-string">"a &lt; b"</span>');
check("a bracket inside a comment token is escaped",
  H.render("kotlin", "// a > b"),
  '<span class="tok-comment">// a &gt; b</span>');
check("an ampersand inside a shell string is escaped",
  H.render("shell", "echo \"a && b\""),
  '<span class="tok-cmd">echo</span> <span class="tok-string">"a &amp;&amp; b"</span>');

/* ---- the one-pass property ------------------------------------------------------------------ */

lacks("a keyword inside a string is not highlighted",
  H.render("kotlin", 'val s = "return null if true"'),
  '<span class="tok-keyword">return</span>');

contains("...and the string itself is one token",
  H.render("kotlin", 'val s = "return null"'),
  '<span class="tok-string">"return null"</span>');

lacks("a # inside a shell string does not start a comment",
  H.render("shell", "echo \"a # b\" tail"),
  '<span class="tok-comment">');

lacks("a // inside a Kotlin string does not start a comment",
  H.render("kotlin", 'val u = "https://example.com"'),
  '<span class="tok-comment">');

/* ---- kotlin --------------------------------------------------------------------------------- */

contains("annotation", H.render("kotlin", "@Transactional\nfun create() {}"),
  '<span class="tok-anno">@Transactional</span>');
contains("keyword", H.render("kotlin", "fun create() {}"),
  '<span class="tok-keyword">fun</span>');
contains("type", H.render("kotlin", "val a: UUID"), '<span class="tok-type">UUID</span>');
contains("line comment", H.render("kotlin", "// note"), '<span class="tok-comment">// note</span>');

/* ---- yaml ----------------------------------------------------------------------------------- */

contains("key", H.render("yaml", "read-timeout: 10s"), '<span class="tok-key">read-timeout</span>');
contains("interpolation", H.render("yaml", "url: ${DB_URL:x}"),
  '<span class="tok-var">${DB_URL:x}</span>');
contains("comment", H.render("yaml", "a: 1   # why"), '<span class="tok-comment"># why</span>');

/* ---- shell ---------------------------------------------------------------------------------- */

var sh = H.render("shell", '$ grep -rn "pg_advisory_lock" src/');
contains("prompt is its own token", sh, '<span class="tok-prompt">$ </span>');
contains("command name", sh, '<span class="tok-cmd">grep</span>');
contains("flag", sh, '<span class="tok-flag">-rn</span>');
contains("quoted argument", sh, '<span class="tok-string">"pg_advisory_lock"</span>');

lacks("a hyphen inside a word is not a flag",
  H.render("shell", "$ echo read-timeout"), '<span class="tok-flag">');

contains("a command with no prompt still reads as a command",
  H.render("shell", "grep -c written"), '<span class="tok-cmd">grep</span>');

/* ---- detection ------------------------------------------------------------------------------ */

check("detect shell from a prompt", H.detect("$ ls -al"), "shell");
check("detect kotlin from an annotation", H.detect("@Transactional\nfun f() {}"), "kotlin");
check("detect yaml from a key", H.detect("hikari:\n  maximum-pool-size: 20"), "yaml");
check("plain output falls back to text",
  H.detect("Connection is not available, request timed out after 30000ms"), "text");

/* ---- labels --------------------------------------------------------------------------------- */

/* 라벨은 세 언어 모두 영어다. 「출력」로 번역해 두면 그 창만 성격이 다른 것처럼 보인다.
   페이지 언어를 넘겨도 값이 안 바뀌는지를 단언한다 — 번역이 되돌아오면 여기서 잡힌다. */
check("the output label stays English on a Korean page", H.label("text", "ko"), "Output");
check("the output label stays English on a Japanese page", H.label("text", "ja"), "Output");
check("language names are not translated", H.label("kotlin", "ko"), "Kotlin");
check("an unknown language falls back to the output label", H.label("nope", "en"), "Output");

/* ---- termination ----------------------------------------------------------------------------- */

check("empty input", H.render("kotlin", ""), "");
check("unknown language passes through escaped", H.render("brainfuck", "<>"), "&lt;&gt;");

if (ran === 0) {
  console.error("FATAL: no assertions ran.");
  process.exit(2);
}
if (failed) {
  console.error("\n" + failed + " / " + ran + " 실패");
  process.exit(1);
}
console.log("통과 — " + ran + " 단언");
