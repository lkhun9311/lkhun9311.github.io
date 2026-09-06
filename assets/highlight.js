/* Syntax highlighting for the code windows.
 *
 * Hand-written rather than pulled from a CDN. The articles use four kinds of block — Kotlin, YAML, shell
 * transcripts and plain program output — and a highlighter that covers exactly those is smaller than the
 * loader for one that covers two hundred, has nothing to fetch before the first paint, and cannot start
 * colouring a language it has guessed wrong.
 *
 * The rules run as ONE pass over the source. Applying them one after another would let a later rule find a
 * keyword inside the markup an earlier rule had already emitted — the classic way highlighters corrupt
 * strings and comments.
 *
 * Pure: no DOM. tools/test-highlight.js drives it in node.
 */
var CodeHighlight = (function () {
  "use strict";

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* What keeps a keyword inside a string plain is the single pass, not the order of this list: the master
     regex takes the leftmost match, so the opening quote is reached first and the whole string is consumed
     as one token before the keyword inside it is ever a candidate. (Checked — reordering keyword ahead of
     string changes nothing.) The order below only decides ties between rules that can match at the SAME
     position, and is kept specific-before-general as a defence for rules added later.

     Every group inside a rule must be non-capturing. The master regex identifies which rule matched by its
     capture index, and one stray capturing group would shift every index after it. */
  var RULES = {
    kotlin: [
      ["comment", "\\/\\/[^\\n]*"],
      ["string", "\"(?:[^\"\\\\\\n]|\\\\.)*\""],
      ["anno", "@[A-Za-z]\\w*"],
      ["keyword", "\\b(?:fun|val|var|class|object|interface|override|return|if|else|when|is|as|in|throw|null|true|false|import|package|private|internal|public|suspend|data|companion|for|while|try|catch|finally)\\b"],
      ["type", "\\b[A-Z]\\w*"],
      ["number", "\\b\\d[\\d_]*\\b"]
    ],
    yaml: [
      ["comment", "#[^\\n]*"],
      ["var", "\\$\\{[^}\\n]*\\}"],
      ["string", "\"(?:[^\"\\\\\\n]|\\\\.)*\"|'[^'\\n]*'"],
      ["key", "^[ \\t]*[\\w.-]+(?=[ \\t]*:)"],
      ["number", "\\b\\d+\\b"]
    ],
    shell: [
      ["comment", "#[^\\n]*"],
      ["string", "\"(?:[^\"\\\\\\n]|\\\\.)*\"|'[^'\\n]*'"],
      /* The prompt and the command name are one match so that "the first word of a line" can be found
         without a lookbehind, which Safari did not support until 16.4. emit() splits them again. */
      ["cmdline", "^[ \\t]*(?:\\$[ \\t]+)?[a-z][\\w./-]*"],
      ["flag", "(?:^|[ \\t])--?[A-Za-z][\\w-]*"],
      ["var", "\\$\\{[^}\\n]*\\}"],
      ["number", "\\b\\d+\\b"]
    ],
    text: []
  };

  /* 코드 창의 라벨은 세 언어 모두 영어로 둔다. Kotlin·YAML·Shell 은 원래 고유명사이고,
     나머지 하나만 「출력」·「出力」로 번역해 두면 그 창만 성격이 다른 것처럼 보인다.
     라벨이 가리키는 것은 화면에 찍힌 글이지 한국어 낱말이 아니다. */
  var LABELS = { kotlin: "Kotlin", yaml: "YAML", shell: "Shell", text: "Output" };
  var LABELS_KO = LABELS;
  var LABELS_JA = LABELS;

  function span(cls, text) {
    return '<span class="tok-' + cls + '">' + esc(text) + "</span>";
  }

  function emit(kind, text) {
    if (kind === "cmdline") {
      var m = /^([ \t]*)(\$[ \t]+)?([\s\S]*)$/.exec(text);
      return esc(m[1]) + (m[2] ? span("prompt", m[2]) : "") + span("cmd", m[3]);
    }
    if (kind === "flag") {
      // The rule swallows the space before the flag so that "a-b" inside a word is not taken for one.
      var lead = /^[ \t]/.test(text) ? text.charAt(0) : "";
      return esc(lead) + span("flag", text.slice(lead.length));
    }
    return span(kind, text);
  }

  function render(lang, code) {
    var rules = RULES[lang] || RULES.text;
    if (!rules.length) return esc(code);

    var master = new RegExp(rules.map(function (r) { return "(" + r[1] + ")"; }).join("|"), "gm");
    var out = "";
    var last = 0;
    var m;

    while ((m = master.exec(code)) !== null) {
      if (m.index > last) out += esc(code.slice(last, m.index));

      var kind = null;
      for (var i = 0; i < rules.length; i++) {
        if (m[i + 1] !== undefined) { kind = rules[i][0]; break; }
      }
      out += emit(kind, m[0]);
      last = m.index + m[0].length;

      // A rule that can match the empty string would spin here forever.
      if (m[0].length === 0) master.lastIndex++;
    }

    return out + esc(code.slice(last));
  }

  /* Only a fallback. Blocks carry data-lang where the language matters, because a guess that is wrong
     colours the wrong things and a reader has no way to tell that it guessed. */
  function detect(code) {
    var s = String(code);
    if (/^[ \t]*\$ /m.test(s)) return "shell";
    if (/@[A-Z]\w+|(^|\n)\s*(?:fun|val|var|class)\s/.test(s)) return "kotlin";
    if (/^[ \t]*[\w.-]+:[ \t]*(?:\$\{|["'\[\w]|$)/m.test(s)) return "yaml";
    return "text";
  }

  function label(lang, pageLang) {
    var table = pageLang === "ko" ? LABELS_KO : pageLang === "ja" ? LABELS_JA : LABELS;
    return table[lang] || table.text;
  }

  return { render: render, detect: detect, label: label, escape: esc };
})();

if (typeof module !== "undefined" && module.exports) module.exports = CodeHighlight;
