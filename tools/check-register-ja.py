# -*- coding: utf-8 -*-
"""日本語版は敬体(ですます)で書く。常体(だ・である)が増えていないかを見る톱니바퀴.

2026-09-11 に測ったら **7 編が丸ごと常体** で、残り 16 編は敬体だった。韓国語版とまったく同じ
不一致が日本語側にもあった。常体を 0 にはしない — 引用・表のセル・図のラベルには正当な常体がある。
だから check-dash・check-register と同じく **増えたら失敗、減ったら基準を下げろと言う**。

⚠️ 見出しと <h1> は <article> の外にあったり句点が無かったりして本文規則が届かない。別に見る。
"""
import glob
import io
import re
import sys

# ⚠️ 이 기준선은 **마크업에 딸려 움직인다.** 2026-09-12 에 `<strong>` 4,846 개를 걷어냈더니
# 글자는 하나도 안 바뀌었는데 두 편에서 「늘었다」가 떴다 — 태그가 끊어 놓던 토큰이 이어붙어
# 세는 자리가 달라졌기 때문이다. 문체가 아니라 **세는 방식**이 바뀐 것이므로 기준선만 옮긴다.
BASELINE = {
    "writing/a-pooler-fixes-only-one.ja.html": 14,
    "writing/every-guarantee-ends-at-a-writable-field.ja.html": 6,
    "writing/four-fixes-that-were-not-there.ja.html": 4,
    "writing/it-deleted-the-tenant.ja.html": 5,
    "writing/monitoring-empty-is-not-zero.ja.html": 1,
    "writing/monitoring-one-shared-cache.ja.html": 3,
    "writing/monitoring-the-screen-i-said-not-to-fix.ja.html": 8,
    "writing/monitoring-three-races-in-one-cache.ja.html": 0,
    "writing/monitoring-two-gates-one-screen.ja.html": 0,
    "writing/parallelism-made-the-tail-worse.ja.html": 8,
    "writing/seven-of-eight-should-not-recover.ja.html": 3,
    "writing/slow-screens-1-volume-list.ja.html": 6,
    "writing/slow-screens-2-instance-list.ja.html": 0,
    "writing/slow-screens-3-role-lookup.ja.html": 3,
    "writing/slow-screens-4-client-per-loop.ja.html": 2,
    "writing/slow-screens-6-polling-pileup.ja.html": 2,
    "writing/slow-screens-7-nothing-to-fix.ja.html": 2,
    "writing/slow-screens-8-load-test-harness.ja.html": 4,
    "writing/the-ceiling-was-not-in-the-code.ja.html": 6,
    "writing/the-only-control-that-caught-something.ja.html": 6,
    "writing/the-review-that-skipped-the-big-file.ja.html": 1,
    "writing/three-documents-on-a-false-premise.ja.html": 4,
    "writing/until-the-guarantee-was-a-sentence.ja.html": 7,
}

MASK = [re.compile(p, re.S) for p in (
    r"<pre\b.*?</pre>", r"<script\b.*?</script>", r"<table\b.*?</table>",
    r"<code\b.*?</code>", r"「[^」]*」", r"“[^”]*”", r"\"[^\"<>]{0,400}\"")]
POLITE = ("ます", "です", "ません", "でした", "ました", "ましょう")
PLAIN = re.compile(r"([^\s、。（）()「」・]{1,20})。")
TITLE = re.compile(r"<h1>(.*?)(?:<br>|</h1>)", re.S)
HEAD = re.compile(r"<h([23])[^>]*>(.*?)</h\1>", re.S)
VERBEND = re.compile(r"(だ|である|ない|なかった|た|る|う)$")


def body_count(path):
    s = io.open(path, encoding="utf-8").read()
    m = re.search(r"<article\b.*?</article>", s, re.S)
    if not m:
        return 0, []
    art = m.group(0)
    for r in MASK:
        art = r.sub(lambda x: " " * (x.end() - x.start()), art)
    t = re.sub(r"<[^>]+>", " ", art)
    hits = [w.group(1) for w in PLAIN.finditer(t)
            if not w.group(1).endswith(POLITE) and re.search(r"[ぁ-んァ-ヶ一-龥ー]$", w.group(1))]
    return len(hits), hits


def head_plain(path):
    """見出しと題。句点が無いので本文規則では見えない。"""
    s = io.open(path, encoding="utf-8").read()
    out = []
    chunks = [TITLE.search(s)]
    m = re.search(r"<article\b.*?</article>", s, re.S)
    if m:
        chunks += list(HEAD.finditer(m.group(0)))
    for c in chunks:
        if not c:
            continue
        t = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", c.group(len(c.groups())))).strip().rstrip("#").strip()
        if not t or t.endswith(POLITE) or t.endswith(("か", "？", "?")):
            continue
        if VERBEND.search(t):
            out.append(t)
    return out


def main():
    files = sorted(glob.glob("writing/*.ja.html"))
    fails, shrunk, cur = [], [], {}
    for f in files:
        n, _ = body_count(f)
        cur[f] = n
        base = BASELINE.get(f)
        if base is None:
            if n:
                fails.append("%s: 新しい記事に常体 %d 箇所" % (f, n))
        elif n > base:
            fails.append("%s: 常体 %d 箇所 (基準 %d) — 増えた" % (f, n, base))
        elif n < base:
            shrunk.append("%s: %d → %d" % (f, base, n))
        for t in head_plain(f):
            fails.append("%s: 見出しが常体 — 「%s」" % (f, t))
        # ⚠️ 二重敬体。常体→敬体の一括変換で「ました」を除外し忘れると
        #    「ございました → ございましました」になる。7 件出た。
        raw = io.open(f, encoding="utf-8").read()
        for bad in ("ましました", "ませんでしました", "でしました", "ですです", "ますます。"):
            if bad in raw:
                fails.append("%s: 二重敬体 — 「%s」" % (f, bad))
    print("本文の常体 %d 箇所 (基準 %d)" % (sum(cur.values()), sum(BASELINE.values())))
    if shrunk:
        print("減った — BASELINE を下げよ:")
        for x in shrunk:
            print("  -", x)
    if fails:
        print("結果: %d 件失敗" % len(fails))
        for x in fails[:20]:
            print("  -", x)
        return 1
    print("結果: OK — 増えていない")
    return 0


if __name__ == "__main__":
    sys.exit(main())
