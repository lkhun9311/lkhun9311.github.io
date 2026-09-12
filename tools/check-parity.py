#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""세 언어판의 뼈대가 같은지 본다.

같은 글의 ko·en·ja 는 **표·그림·절의 개수가 같아야 한다.** 한쪽만 줄어들면 번역이
아니라 손실이다. 실제로 도입부를 통째로 갈다가 `every-guarantee…` 한국어판이
표를 한 장 잃었고, `check-figures` 는 표를 안 세므로 **아무도 못 잡았다.**

절(h2) 개수는 「무슨 내용인가요?」 절을 세 언어에서 차례로 걷어내는 동안 어긋난다.
그래서 지금은 **남은 편수를 숫자로 찍고** 다 끝나면 실패로 올린다.
"""
import glob, io, os, re, sys
from collections import defaultdict

H2_IN_PROGRESS = True  # 스포일러 절 제거가 끝나면 False 로 내린다


def main():
    d = defaultdict(dict)
    for p in sorted(glob.glob("writing/*.html")):
        b = os.path.basename(p)
        if b == "index.html":
            continue
        lang = "ko" if b.endswith(".ko.html") else ("ja" if b.endswith(".ja.html") else "en")
        name = re.sub(r"\.(ko|ja)?\.?html$", "", b)
        m = re.search(r"<article.*?</article>", io.open(p, encoding="utf-8").read(), re.S)
        if not m:
            continue
        a = m.group(0)
        d[name][lang] = {
            "표": a.count('<div class="table-scroll">'),
            "그림": len(re.findall(r'<figure class="diagram"', a)),
            "절": len(re.findall(r"<h2", a)),
        }

    bad, pending, n = [], [], 0
    for name in sorted(d):
        v = d[name]
        if len(v) < 2:
            continue
        n += 1
        for key in ("표", "그림", "절"):
            vals = {l: c[key] for l, c in v.items()}
            if len(set(vals.values())) == 1:
                continue
            line = "%-46s %-3s %s" % (name, key, vals)
            (pending if key == "절" and H2_IN_PROGRESS else bad).append(line)

    if bad:
        print("\n".join("  ✘ " + x for x in bad))
        print("\n결과: 실패 — %d건" % len(bad))
        return 1
    print("세 언어 갖춘 글 %d편 — 표·그림 결과: OK" % n)
    if pending:
        print("절 개수가 아직 다른 글 %d편 (스포일러 절 제거가 진행 중)" % len(pending))
    return 0


if __name__ == "__main__":
    sys.exit(main())
