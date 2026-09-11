# -*- coding: utf-8 -*-
"""강조가 다시 번지지 않게 잠근다.

2026-09-12 측정: 한국어판 문장 3,598 개에 `<strong>` 2,083 개. **문장 두 개에 하나꼴이면
강조가 아니라 배경**이고, 훑는 사람이 굵은 것만 읽어도 글 전체를 읽는 셈이 된다.
사용자 지적이 「기계가 쓴 것 같다」였고, 참고한 국내 기술 블로그는 한 절에 한두 개다.

규칙: **절(h2 사이)마다 2개**, **그림 캡션마다 1개**. 넘으면 실패한다.
"""
import glob
import io
import re
import sys

STRONG = re.compile(r"<strong>", re.S)
FIGURE = re.compile(r"<figure\b.*?</figure>", re.S)
CAPTION = re.compile(r"<figcaption\b[^>]*>(.*?)</figcaption>", re.S)
PER_SECTION = 2
PER_CAPTION = 1


def main():
    fails, checked = [], 0
    for f in sorted(glob.glob("writing/*.html") + glob.glob("notes/*.html")):
        if f.endswith("index.html"):
            continue
        m = re.search(r"<article\b.*?</article>", io.open(f, encoding="utf-8").read(), re.S)
        if not m:
            continue
        checked += 1
        art = m.group(0)
        for c in CAPTION.finditer(art):
            n = len(STRONG.findall(c.group(1)))
            if n > PER_CAPTION:
                fails.append("%s: 캡션 하나에 강조 %d개 (최대 %d)" % (f, n, PER_CAPTION))
        body = FIGURE.sub(" ", art)
        bounds = [x.start() for x in re.finditer(r"<h2", body)] + [len(body)]
        segs = [(0, bounds[0])] + [(bounds[i], bounds[i + 1]) for i in range(len(bounds) - 1)]
        for s, e in segs:
            n = len(STRONG.findall(body[s:e]))
            if n > PER_SECTION:
                head = re.search(r"<h2[^>]*>(.*?)<", body[s:e], re.S)
                name = re.sub(r"<[^>]+>", "", head.group(1)).strip() if head else "(도입부)"
                fails.append("%s: 「%s」 절에 강조 %d개 (최대 %d)" % (f, name[:28], n, PER_SECTION))
    print("글 %d 편 검사" % checked)
    if fails:
        print("결과: %d 건 실패" % len(fails))
        for x in fails[:20]:
            print("  -", x)
        return 1
    print("결과: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
