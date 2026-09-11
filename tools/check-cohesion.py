# -*- coding: utf-8 -*-
"""문단이 앞 문단과 이어져 읽히는가.

사용자 지적이 두 번 「문맥이 안 읽힌다」였고, 2026-09-12 에 재 보니
**문단 이음 784 자리 중 550(70%)이 앞 문단과 어휘로도 접속사로도 이어지지 않았다.**
문단마다 새 화제를 맨땅에서 시작하면, 문장 하나하나가 옳아도 글이 이어지지 않는다.

판정(거칠지만 재현된다): 어떤 문단의 **첫 문장**이
  · 앞 문단 **마지막 두 문장**의 낱말을 하나도 이어받지 않고
  · 접속부사로 시작하지도 않으면
그 자리를 **차가운 시작**으로 센다.

⚠️ 이 지표는 문체를 판정하지 못한다. 이어받을 낱말이 없어도 잘 읽히는 전환이 있고,
낱말이 겹쳐도 안 읽히는 문단이 있다. 그래서 **0 을 요구하지 않고 톱니바퀴로 쓴다** —
늘면 실패하고, 줄면 기준을 내리라고 알려 준다.
"""
import glob
import io
import re
import sys

BASELINE = {
    "writing/a-pooler-fixes-only-one.ko.html": 51,
    "writing/every-guarantee-ends-at-a-writable-field.ko.html": 25,
    "writing/four-fixes-that-were-not-there.ko.html": 37,
    "writing/it-deleted-the-tenant.ko.html": 24,
    "writing/monitoring-empty-is-not-zero.ko.html": 9,
    "writing/monitoring-one-shared-cache.ko.html": 12,
    "writing/monitoring-the-screen-i-said-not-to-fix.ko.html": 8,
    "writing/monitoring-three-races-in-one-cache.ko.html": 17,
    "writing/monitoring-two-gates-one-screen.ko.html": 11,
    "writing/parallelism-made-the-tail-worse.ko.html": 21,
    "writing/seven-of-eight-should-not-recover.ko.html": 20,
    "writing/slow-screens-1-volume-list.ko.html": 30,
    "writing/slow-screens-2-instance-list.ko.html": 18,
    "writing/slow-screens-3-role-lookup.ko.html": 19,
    "writing/slow-screens-4-client-per-loop.ko.html": 21,
    "writing/slow-screens-6-polling-pileup.ko.html": 19,
    "writing/slow-screens-7-nothing-to-fix.ko.html": 19,
    "writing/slow-screens-8-load-test-harness.ko.html": 39,
    "writing/the-ceiling-was-not-in-the-code.ko.html": 31,
    "writing/the-only-control-that-caught-something.ko.html": 29,
    "writing/the-review-that-skipped-the-big-file.ko.html": 29,
    "writing/three-documents-on-a-false-premise.ko.html": 28,
    "writing/until-the-guarantee-was-a-sentence.ko.html": 30,
}

PRE = re.compile(r"<pre.*?</pre>", re.S)
FIG = re.compile(r"<figure.*?</figure>", re.S)
WORD = re.compile(r"[가-힣A-Za-z][가-힣A-Za-z0-9]{1,}")
CONN = ("그래서", "그런데", "그리고", "그러면", "그러니까", "즉", "다만", "하지만", "그렇지만",
        "반면", "여기서", "이번에는", "결국", "따라서", "대신", "실제로", "먼저", "그다음",
        "마지막으로", "한편", "물론", "그러나", "게다가", "덧붙이면", "이제", "그때", "앞서")


def cold(path):
    a = re.search(r"<article.*?</article>", io.open(path, encoding="utf-8").read(), re.S)
    if not a:
        return 0, 0, []
    body = FIG.sub(" ", PRE.sub(" ", a.group(0)))
    ps = [re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", m.group(1))).strip()
          for m in re.finditer(r"<p>(.*?)</p>", body, re.S)]
    ps = [x for x in ps if len(x) > 25]
    hits, n = [], 0
    for i in range(1, len(ps)):
        first = re.split(r"(?<=[.!?])\s", ps[i])[0]
        tail = " ".join(re.split(r"(?<=[.!?])\s", ps[i - 1])[-2:])
        share = set(WORD.findall(first)) & set(WORD.findall(tail))
        if share or ps[i].startswith(CONN):
            continue
        n += 1
        hits.append(first[:70])
    return n, max(len(ps) - 1, 0), hits


def main():
    show = "--show" in sys.argv
    files = sorted(glob.glob("writing/*.ko.html"))
    fails, shrunk, cur, spots = [], [], {}, 0
    for f in files:
        n, total, hits = cold(f)
        cur[f] = n
        spots += total
        base = BASELINE.get(f)
        if base is None:
            if n:
                fails.append("%s: 새 글에 차가운 시작 %d 곳" % (f, n))
        elif n > base:
            fails.append("%s: 차가운 시작 %d 곳 (기준 %d) — 늘었다" % (f, n, base))
            if show:
                for h in hits[:5]:
                    fails.append("      …%s" % h)
        elif n < base:
            shrunk.append("%s: %d → %d" % (f, base, n))
    tot = sum(cur.values())
    print("문단 이음 %d 자리 · 차가운 시작 %d 곳 (%d%%, 기준 %d)"
          % (spots, tot, 100 * tot // max(spots, 1), sum(BASELINE.values())))
    if shrunk:
        print("줄었다 — 기준을 내려라:")
        for x in shrunk:
            print("  -", x)
    if fails:
        print("결과: %d 건 실패" % len(fails))
        for x in fails[:20]:
            print("  -", x)
        return 1
    print("결과: OK — 늘지 않았다")
    return 0


if __name__ == "__main__":
    sys.exit(main())
