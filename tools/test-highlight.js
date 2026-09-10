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

/* ---- languages the articles actually declare ------------------------------------------------- */

/* 이 블록이 이 파일에서 가장 중요하다. 앞의 단언들은 「내가 넘긴 언어」를 검사하지만, 실제 사고는
   글이 선언한 data-lang 이 highlight.js 에 없을 때 난다. 그때 render 는 평문으로, label 은 "Output"
   으로 조용히 떨어져서 Java 창이 「출력」이라고 적힌 채 발행된다. 실측으로 117개 블록 중 45개가
   그 상태였다(java·sql·tsx·bash). 그래서 글에서 값을 읽어 와 대조한다. */
var fs = require("fs");
var path = require("path");
var dir = path.join(__dirname, "..", "writing");
var known = H.languages();
var seen = {};

/* 경로가 틀리면 readdirSync 가 던지고 끝나서 「무엇이 왜 없는지」가 안 남는다. */
var files = [];
try {
  files = fs.readdirSync(dir).filter(function (f) { return /\.html$/.test(f); });
} catch (e) {
  console.error("FAIL  글 폴더를 못 읽었다: " + dir + " — " + e.code);
}

files.forEach(function (f) {
  var html = fs.readFileSync(path.join(dir, f), "utf8");
  var re = /data-lang="([^"]*)"/g, m;
  while ((m = re.exec(html)) !== null) (seen[m[1]] = seen[m[1]] || []).push(f);
});

var declared = Object.keys(seen);
ran++;
if (declared.length === 0) {
  failed++;
  console.error("FAIL  글에서 data-lang 을 하나도 못 읽었다 — 경로가 틀렸거나 표기가 바뀌었다");
}
declared.forEach(function (lang) {
  ran++;
  if (known.indexOf(lang) === -1) {
    failed++;
    console.error('FAIL  data-lang="' + lang + '" 는 highlight.js 에 없다 — 평문 + "Output" 으로 떨어진다\n' +
                  "      쓰인 곳: " + seen[lang].slice(0, 3).join(" "));
  }
});

/* 라벨만 있고 규칙이 없으면 「선언은 됐는데 아무것도 안 칠해지는」 상태가 된다. text 는 일부러 그렇다. */
declared.forEach(function (lang) {
  if (lang === "text" || known.indexOf(lang) === -1) return;
  ran++;
  var sample = { java: "class A {}", kotlin: "val a = 1", yaml: "a: 1", shell: "$ ls",
                 bash: "$ ls", sql: "select 1", tsx: "const a = 1", python: "def f(): pass",
                 json: '{"a": 1}' }[lang];
  if (!sample) { failed++; console.error("FAIL  " + lang + " 표본이 이 테스트에 없다"); return; }
  if (H.render(lang, sample).indexOf('<span class="tok-') === -1) {
    failed++;
    console.error("FAIL  " + lang + " 은 라벨만 있고 아무것도 칠하지 않는다");
  }
});

/* ---- the languages added for the harness article --------------------------------------------- */

contains("python keeps a comment out of the string rule",
  H.render("python", 'THREADS = 50  # 동시 사용자'), '<span class="tok-comment"># 동시 사용자</span>');
lacks("python does not tokenise inside a string",
  H.render("python", 'x = "def not a keyword"'), '<span class="tok-keyword">def</span>');
check("sql is case-insensitive", H.render("sql", "select"), '<span class="tok-keyword">select</span>');
check("sql upper case works too", H.render("sql", "SELECT"), '<span class="tok-keyword">SELECT</span>');
lacks("case-insensitivity does not leak into kotlin types",
  H.render("kotlin", "val abc = 1"), '<span class="tok-type">abc</span>');
contains("bash is highlighted with the shell rules",
  H.render("bash", "$ bash run.sh"), '<span class="tok-prompt">');
check("bash keeps its own label", H.label("bash", "ko"), "Bash");
lacks("java comment markers inside a string stay in the string",
  H.render("java", 'String s = "a // b";'), '<span class="tok-comment">');

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
