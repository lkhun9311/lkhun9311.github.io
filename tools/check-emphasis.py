# -*- coding: utf-8 -*-
"""강조가 다시 번지지 않게 잠근다.

2026-09-12 측정: 한국어판 문장 3,598 개에 `<strong>` 2,083 개. **문장 두 개에 하나꼴이면
강조가 아니라 배경**이고, 훑는 사람이 굵은 것만 읽어도 글 전체를 읽는 셈이 된다.
사용자 지적이 「기계가 쓴 것 같다」였고, 참고한 국내 기술 블로그는 한 절에 한두 개다.

규칙: **절(h2 사이)마다 2개**, **그림 캡션마다 1개**. 넘으면 실패한다.

같은 이유로 **⚠️ 도 센다.** 규약 6 은 「유보는 「무슨 내용인가요?」에 한 번, 「주장하지 않는 것」에
전부 한 번」인데, 실측해 보니 **허용된 자리 밖에 454 개**가 있었다(`slow-screens-8` 한 편에 30 개).
코덱스의 표현으로는 「경험 공유가 아니라 반박 대비용 답변서」로 읽힌다. 유보 자체는 남기고
**경고 기호만** 두 자리로 모은다.
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
# ⚠️ 가 허용되는 절의 id 조각
CAVEAT_OK = ("무슨-내용", "what-this-is-about", "what-is-in-here", "この記事の内容", "どんな内容",
             "주장하지-않는-것", "what-this-does-not-claim", "主張しないこと", "한계", "limits")


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
        # 예상 독자 상자에는 강조를 두지 않는다 — 세 줄짜리 상자에서는 아무 일도 안 한다.
        for c in re.finditer(r'<ul class="callout">.*?</ul>', art, re.S):
            n = len(STRONG.findall(c.group(0)))
            if n:
                fails.append("%s: 예상 독자 상자에 강조 %d개 — 여기는 두지 않는다" % (f, n))
        for c in CAPTION.finditer(art):
            n = len(STRONG.findall(c.group(1)))
            if n > PER_CAPTION:
                fails.append("%s: 캡션 하나에 강조 %d개 (최대 %d)" % (f, n, PER_CAPTION))
        body = FIGURE.sub(" ", art)
        bounds = [x.start() for x in re.finditer(r"<h2", body)] + [len(body)]
        segs = [(0, bounds[0])] + [(bounds[i], bounds[i + 1]) for i in range(len(bounds) - 1)]
        for s, e in segs:
            n = len(STRONG.findall(body[s:e]))
            head = re.search(r"<h2[^>]*>(.*?)<", body[s:e], re.S)
            name = re.sub(r"<[^>]+>", "", head.group(1)).strip() if head else "(도입부)"
            if n > PER_SECTION:
                fails.append("%s: 「%s」 절에 강조 %d개 (최대 %d)" % (f, name[:28], n, PER_SECTION))
            sid = re.search(r'<h2[^>]*id="([^"]*)"', body[s:e])
            sid = sid.group(1) if sid else "(도입부)"
            w = body[s:e].count("⚠️")
            if w and not any(k in sid for k in CAVEAT_OK):
                fails.append("%s: 「%s」 절에 ⚠️ %d개 — 유보는 두 자리에만 모은다" % (f, name[:28], w))
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
