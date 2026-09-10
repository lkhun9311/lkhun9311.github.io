#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""규약 12(줄표를 쓰지 않는다)를 **세 언어 모두**에서 센다.

왜 따로 있나: `check-korean.py` 는 `writing/*.ko.html` 과 `notes/*.ko.html` 만 본다.
규약 문서는 「영문·일본어판도 같은 규약을 적용한다」고 적어 두었는데, 검사가 한국어만 보는 바람에
2026-09-09 실측으로 **한국어 0 · 영문 251 · 일본어 149** 가 아무에게도 안 걸린 채 쌓여 있었다.
검사가 통과를 찍는 동안 400곳이 새고 있었던 셈이다.

한 번에 400곳을 다시 쓰는 것은 위험하다. 줄표 자리마다 마침표·쉼표·콜론 중 무엇이 맞는지가
다르고, 기계로 고르면 영문에 comma splice 가 생긴다. 그래서 이 검사기는 **늘지 못하게 잠그고**
남은 개수를 매번 보여 준다. 아래 숫자는 **줄기만 해야 한다.**

  - 파일의 개수가 기준보다 많으면 실패한다.
  - 기준에 없는 파일에 줄표가 생겨도 실패한다.
  - 줄어들면 기준을 낮추라고 알려 준다(자동으로 낮추지 않는다 — 줄인 것은 사람이 확인한다).

세는 범위는 `<article>` 안쪽이고, 코드 창(`<pre>`)과 표의 「해당 없음」 칸은 뺀다.
"""
import glob
import io
import re
import sys

BASELINE = {
    "notes/arm.html": 2,
    "notes/arm.ja.html": 3,
    "notes/connection-pool.html": 2,
    "notes/connection-pool.ja.html": 4,
    "notes/connection-pooler.html": 6,
    "notes/connection-pooler.ja.html": 6,
    "notes/fail-closed.html": 3,
    "notes/fail-closed.ja.html": 4,
    "notes/load-test-harness.html": 10,
    "notes/load-test-harness.ja.html": 10,
    "notes/mutation-testing.html": 5,
    "notes/mutation-testing.ja.html": 4,
    "notes/percentile.html": 5,
    "notes/percentile.ja.html": 5,
    "notes/transaction-pooling.html": 7,
    "notes/transaction-pooling.ja.html": 7,
    "notes/warmup.html": 5,
    "notes/warmup.ja.html": 5,
    "writing/a-pooler-fixes-only-one.html": 36,
    "writing/a-pooler-fixes-only-one.ja.html": 19,
    "writing/every-guarantee-ends-at-a-writable-field.html": 15,
    "writing/every-guarantee-ends-at-a-writable-field.ja.html": 16,
    "writing/four-fixes-that-were-not-there.html": 14,
    "writing/it-deleted-the-tenant.html": 21,
    "writing/it-deleted-the-tenant.ja.html": 11,
    "writing/parallelism-made-the-tail-worse.html": 13,
    "writing/seven-of-eight-should-not-recover.html": 11,
    "writing/seven-of-eight-should-not-recover.ja.html": 7,
    "writing/slow-screens-2-instance-list.ja.html": 2,
    "writing/slow-screens-6-polling-pileup.html": 6,
    "writing/slow-screens-7-nothing-to-fix.html": 1,
    "writing/slow-screens-8-load-test-harness.html": 5,
    "writing/the-ceiling-was-not-in-the-code.html": 18,
    "writing/the-ceiling-was-not-in-the-code.ja.html": 4,
    "writing/the-only-control-that-caught-something.html": 12,
    "writing/the-only-control-that-caught-something.ja.html": 10,
    "writing/the-review-that-skipped-the-big-file.html": 3,
    "writing/three-documents-on-a-false-premise.html": 26,
    "writing/three-documents-on-a-false-premise.ja.html": 16,
    "writing/until-the-guarantee-was-a-sentence.html": 24,
    "writing/until-the-guarantee-was-a-sentence.ja.html": 16,
}


def count(path):
    s = io.open(path, encoding="utf-8").read()
    try:
        body = s[s.index("<article"):s.index("</article>")]
    except ValueError:
        return 0
    body = re.sub(r"<pre.*?</pre>", " ", body, flags=re.S)
    n = 0
    for m in re.finditer("—", body):
        around = body[max(0, m.start() - 14):m.start() + 14]
        if re.search(r"<td[^>]*>\s*—\s*</td>", around):   # 표의 「해당 없음」 칸만 예외
            continue
        n += 1
    return n


def main():
    now = {}
    for f in sorted(glob.glob("writing/*.html") + glob.glob("notes/*.html")):
        n = count(f)
        if n:
            now[f] = n

    grew, appeared, shrank = [], [], []
    for f, n in sorted(now.items()):
        base = BASELINE.get(f)
        if base is None:
            appeared.append("%s: %d 곳 — 기준에 없던 파일이다" % (f, n))
        elif n > base:
            grew.append("%s: %d 곳 (기준 %d)" % (f, n, base))
        elif n < base:
            shrank.append("%s: %d → %d" % (f, base, n))
    for f, base in sorted(BASELINE.items()):
        if f not in now:
            shrank.append("%s: %d → 0" % (f, base))

    total, btotal = sum(now.values()), sum(BASELINE.values())
    print("본문 줄표 %d 곳 (기준 %d)" % (total, btotal))
    for x in grew + appeared:
        print("  실패:", x)
    if shrank:
        print("  줄었다 — 기준을 낮춰 두라:")
        for x in shrank[:12]:
            print("    ", x)
        if len(shrank) > 12:
            print("     … 외 %d 개" % (len(shrank) - 12))
    if grew or appeared:
        print("결과: %d건 실패" % len(grew + appeared))
        return 1
    print("결과: OK — 늘지 않았다")
    return 0


if __name__ == "__main__":
    sys.exit(main())
