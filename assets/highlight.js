/* Syntax highlighting for the code windows.
 *
 * Hand-written rather than pulled from a CDN: a highlighter that covers exactly the languages the
 * articles use is smaller than the loader for one that covers two hundred, has nothing to fetch before
 * the first paint, and cannot start colouring a language it has guessed wrong.
 *
 * Every language a block declares MUST appear in both RULES (or ALIASES) and LABELS. An unknown value
 * fails silently in the worst way: render() falls back to plain text and label() prints "Output", so a
 * Java window is captioned as program output and nobody sees an error. That is how java, sql, tsx and
 * bash sat unhighlighted across 45 of 117 blocks. tools/test-highlight.js now reads every data-lang out
 * of writing/*.html and fails if one is not declared here.
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
    /* Java·SQL·Python·TSX 는 인용부호와 주석 처리만 kotlin 과 같은 원리다.
       모든 그룹은 반드시 non-capturing — 캡처 그룹 하나가 뒤의 규칙 index 를 전부 밀어낸다. */
    java: [
      ["comment", "\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/"],
      ["string", "\"(?:[^\"\\\\\\n]|\\\\.)*\""],
      ["anno", "@[A-Za-z]\\w*"],
      ["keyword", "\\b(?:abstract|boolean|break|byte|case|catch|char|class|continue|default|do|double|else|enum|extends|final|finally|float|for|if|implements|import|instanceof|int|interface|long|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|false|try|var|void|volatile|while)\\b"],
      ["type", "\\b[A-Z]\\w*"],
      ["number", "\\b\\d[\\d_]*[LlFfDd]?\\b"]
    ],
    python: [
      ["comment", "#[^\\n]*"],
      ["string", "(?:[rRbBfFuU]{0,2})(?:\"\"\"[\\s\\S]*?\"\"\"|'''[\\s\\S]*?'''|\"(?:[^\"\\\\\\n]|\\\\.)*\"|'(?:[^'\\\\\\n]|\\\\.)*')"],
      ["anno", "@[A-Za-z_]\\w*"],
      ["keyword", "\\b(?:and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield|None|True|False)\\b"],
      ["type", "\\b[A-Z]\\w*"],
      ["number", "\\b\\d[\\d_]*(?:\\.\\d+)?\\b"]
    ],
    /* SQL 만 대소문자를 안 가린다(FLAGS 참고). 그래서 [A-Z] 로 型을 잡는 규칙을 두지 않는다 —
       두면 소문자 식별자까지 전부 型으로 칠해진다. */
    sql: [
      ["comment", "--[^\\n]*"],
      ["string", "'(?:[^'\\\\\\n]|\\\\.)*'"],
      ["keyword", "\\b(?:select|from|where|group|order|by|having|insert|into|values|update|set|delete|create|alter|drop|truncate|table|index|join|left|right|inner|outer|on|as|and|or|not|null|limit|offset|count|sum|avg|min|max|distinct|union|all|explain|desc|asc|in|is|like|between|case|when|then|end)\\b"],
      ["number", "\\b\\d+\\b"]
    ],
    tsx: [
      ["comment", "\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/"],
      ["string", "\"(?:[^\"\\\\\\n]|\\\\.)*\"|'(?:[^'\\\\\\n]|\\\\.)*'|`(?:[^`\\\\]|\\\\.)*`"],
      ["keyword", "\\b(?:const|let|var|function|return|if|else|for|while|of|in|new|class|extends|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof|null|undefined|true|false|interface|type|enum|as|readonly|public|private|protected|void|never|any|string|number|boolean)\\b"],
      ["type", "\\b[A-Z]\\w*"],
      ["number", "\\b\\d[\\d_]*(?:\\.\\d+)?\\b"]
    ],
    text: []
  };

  /* bash 와 shell 은 같은 규칙으로 칠하되 라벨은 각자 쓴 이름 그대로 보여 준다. */
  var ALIASES = { bash: "shell" };

  /* 언어별 정규식 flag. SQL 은 대문자로 쓰든 소문자로 쓰든 같은 낱말이라 "i" 를 더한다.
     다른 언어에 "i" 를 주면 안 된다 — [A-Z] 로 型을 잡는 규칙이 전부 무너진다. */
  var FLAGS = { sql: "gmi" };

  /* 코드 창의 라벨은 세 언어 모두 영어로 둔다. Kotlin·YAML·Shell 은 원래 고유명사이고,
     나머지 하나만 「출력」·「出力」로 번역해 두면 그 창만 성격이 다른 것처럼 보인다.
     라벨이 가리키는 것은 화면에 찍힌 글이지 한국어 낱말이 아니다. */
  var LABELS = { kotlin: "Kotlin", yaml: "YAML", shell: "Shell", bash: "Bash", java: "Java",
                 python: "Python", sql: "SQL", tsx: "TSX", text: "Output" };
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
    var key = ALIASES[lang] || lang;
    var rules = RULES[key] || RULES.text;
    if (!rules.length) return esc(code);

    var master = new RegExp(rules.map(function (r) { return "(" + r[1] + ")"; }).join("|"),
                            FLAGS[key] || "gm");
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

  /* 검사기용. 「이 파일이 아는 언어」를 밖에서 물어볼 수 있어야 미신고 data-lang 을 잡을 수 있다. */
  function languages() { return Object.keys(LABELS); }

  return { render: render, detect: detect, label: label, escape: esc, languages: languages };
})();

if (typeof module !== "undefined" && module.exports) module.exports = CodeHighlight;
