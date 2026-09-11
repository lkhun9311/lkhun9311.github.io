# -*- coding: utf-8 -*-
"""규약 1 — 한국어판 본문은 합니다체다.

평서체(`~다.`)가 남아 있는 자리를 글마다 센다. 0 을 요구하지 않는 이유는 **정당한 평서체가
있기 때문**이다 — 당시 내 생각의 인용(「호출이 순차라서 느린 것이다」), 「」·"" 안의 인용문,
표 칸, 정의문(`fail-closed : 게시를 막는다`). 그래서 check-dash 와 같은 톱니바퀴로 만든다.
**늘면 실패하고, 줄면 기준을 내리라고 알려 준다.** 새 파일은 0 이어야 한다.

세는 자리에서 빼는 것: <pre>(인용한 소스) · <table>(칸) · 「」 "" “” 안(인용).
"""
import io, re, glob, sys

BASELINE = {
    "writing/a-pooler-fixes-only-one.ko.html": 0,
    "writing/every-guarantee-ends-at-a-writable-field.ko.html": 0,
    "writing/four-fixes-that-were-not-there.ko.html": 0,
    "writing/it-deleted-the-tenant.ko.html": 0,
    "writing/monitoring-empty-is-not-zero.ko.html": 0,
    "writing/monitoring-one-shared-cache.ko.html": 0,
    "writing/monitoring-the-screen-i-said-not-to-fix.ko.html": 0,
    "writing/monitoring-three-races-in-one-cache.ko.html": 0,
    "writing/monitoring-two-gates-one-screen.ko.html": 0,
    "writing/parallelism-made-the-tail-worse.ko.html": 0,
    "writing/seven-of-eight-should-not-recover.ko.html": 0,
    "writing/slow-screens-1-volume-list.ko.html": 3,
    "writing/slow-screens-2-instance-list.ko.html": 0,
    "writing/slow-screens-3-role-lookup.ko.html": 2,
    "writing/slow-screens-4-client-per-loop.ko.html": 0,
    "writing/slow-screens-6-polling-pileup.ko.html": 0,
    "writing/slow-screens-7-nothing-to-fix.ko.html": 0,
    "writing/slow-screens-8-load-test-harness.ko.html": 0,
    "writing/the-ceiling-was-not-in-the-code.ko.html": 0,
    "writing/the-only-control-that-caught-something.ko.html": 0,
    "writing/the-review-that-skipped-the-big-file.ko.html": 0,
    "writing/three-documents-on-a-false-premise.ko.html": 0,
    "writing/until-the-guarantee-was-a-sentence.ko.html": 0,
    "notes/arm.ko.html": 0,
    "notes/connection-pool.ko.html": 0,
    "notes/connection-pooler.ko.html": 0,
    "notes/fail-closed.ko.html": 2,
    "notes/load-test-harness.ko.html": 1,
    "notes/mutation-testing.ko.html": 0,
    "notes/percentile.ko.html": 0,
    "notes/transaction-pooling.ko.html": 1,
    "notes/warmup.ko.html": 0,
}

MASK = [re.compile(p, re.S) for p in (
    r"<pre\b.*?</pre>", r"<table\b.*?</table>", r"<code\b.*?</code>",
    r"「[^」]*」", r"“[^”]*”", r"\"[^\"<>]{0,400}\"",
)]
# 합니다체의 종결은 **받침 ㅂ + 니다** 다 — 합니다·입니다·있습니다·봅니다.
# ⚠️ 「니다 로 끝나면 합니다체」로 두면 **아니다** 가 통째로 빠진다. 이 글들에서
# 제일 흔한 평서체가 그것이었고(41 곳) 검사기가 한 번도 못 봤다.
_PLAIN_DA = re.compile(r"다\s*[.](?!\d)")


def _is_polite(text, i):
    """text[i] == '다' 일 때 그 앞이 받침 ㅂ + 니 인가."""
    if i < 2 or text[i - 1] != "니":
        return False
    c = ord(text[i - 2]) - 0xAC00
    return 0 <= c <= 11171 and (c % 28) == 17  # 받침 ㅂ


def _plain_spans(text):
    for m in _PLAIN_DA.finditer(text):
        i = m.start()
        if i and text[i - 1] in " \t\n":
            continue
        if not _is_polite(text, i):
            yield m


def count(path):
    s = io.open(path, encoding="utf-8").read()
    m = re.search(r"<article\b.*?</article>", s, re.S)
    if not m:
        return 0, []
    art = m.group(0)
    for r in MASK:
        art = r.sub(lambda x: " " * (x.end() - x.start()), art)
    # ⚠️ 태그를 전부 공백으로 바꾸면 `…안전한가</strong>다.` 가 `… 다.` 가 되어
    # 아래 lookbehind(공백 제외)에 걸리지 않는다. 실제로 이 검사기가 20 곳을 놓쳤다.
    # 인라인 태그는 지우고 블록 태그만 공백으로 바꾼다.
    art = re.sub(r"</?(?:strong|em|code|b|i|span|a|sup|sub)\b[^>]*>", "", art)
    txt = re.sub(r"<[^>]+>", " ", art)
    hits = [re.sub(r"\s+", " ", txt[max(0, h.start() - 60):h.end()]).strip()
            for h in _plain_spans(txt)]
    return len(hits), hits


def main():
    show = "--show" in sys.argv
    files = sorted(glob.glob("writing/*.ko.html")) + sorted(glob.glob("notes/*.ko.html"))
    fails, shrunk, cur = [], [], {}
    for f in files:
        n, hits = count(f)
        cur[f] = n
        base = BASELINE.get(f)
        if base is None:
            if n:
                fails.append("%s: 새 글에 평서체 %d 곳 — 규약 1 은 합니다체다" % (f, n))
                if show:
                    for h in hits[:8]:
                        fails.append("      …%s" % h)
        elif n > base:
            fails.append("%s: 평서체 %d 곳 (기준 %d) — 늘었다" % (f, n, base))
            if show:
                for h in hits[:8]:
                    fails.append("      …%s" % h)
        elif n < base:
            shrunk.append("%s: %d → %d" % (f, base, n))
    for f in BASELINE:
        if f not in cur:
            shrunk.append("%s: 사라졌다 — BASELINE 에서 빼라" % f)
    print("본문 평서체 %d 곳 (기준 %d)" % (sum(cur.values()), sum(BASELINE.values())))
    if shrunk:
        print("줄었다 — BASELINE 을 내려라:")
        for s in shrunk:
            print("  -", s)
    if fails:
        print("결과: %d 건 실패" % len(fails))
        for s in fails:
            print("  -", s)
        return 1
    print("결과: OK — 늘지 않았다")
    return 0


if __name__ == "__main__":
    sys.exit(main())
