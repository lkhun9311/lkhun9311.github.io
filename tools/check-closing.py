#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""규약 30 — 마치며는 결론을 하나만 둔다.

세 가지를 본다.
  1) 예고 문구: 「정리하면 이렇습니다」·「마지막으로 한 줄만 남긴다면 이겁니다」처럼
     결론이 온다고 미리 알리는 상투구. 16편과 12편이 같은 문장으로 시작하고 있었다.
  2) 되풀이: 마지막 문단의 문장이 위 불릿과 글자까지 같은 자리.
  3) 부서진 문장: 줄표(—)를 규약 12로 마침표로 바꾸다 「…것. 이었습니다」처럼
     마침표 뒤에 문장을 시작할 수 없는 조각이 남은 자리.
"""
import glob, io, os, re, sys

ANNOUNCE = [
    "정리하면 이렇습니다",
    "마지막으로 한 줄만 남긴다면",
    "남는 한 줄은 이것입니다",
    "한 줄로 남긴다면 이겁니다",
]
BROKEN = re.compile(r"[^\s.]{1,14}\.\s+(이었습니다|였습니다|이라는|이라고|이고|도,|은,|는,|을,|를,)")


def sentences(t):
    return [s.strip() for s in re.split(r"(?<=다\.)\s+", t) if len(s.strip()) > 14]


def strip_tags(x):
    x = re.sub(r"<(pre|code)[^>]*>.*?</\1>", " ", x, flags=re.S)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", x))


def main():
    bad = []
    n = 0
    for p in sorted(glob.glob("writing/*.ko.html")):
        s = io.open(p, encoding="utf-8").read()
        m = re.search(r"<article.*?</article>", s, re.S)
        if not m:
            continue
        a = m.group(0)
        name = os.path.basename(p)[:-8]
        k = a.rfind('<h2 id="마치며')
        if k < 0:
            continue
        n += 1
        sec = a[k:]

        for ph in ANNOUNCE:
            if ph in sec:
                bad.append("%-44s 결론 예고 「%s」" % (name, ph))

        lis = set(strip_tags(x) for x in sentences(
            " ".join(strip_tags(x) for x in re.findall(r"<li>.*?</li>", sec, re.S))))
        for t in sentences(" ".join(strip_tags(x) for x in re.findall(r"<p>.*?</p>", sec, re.S))):
            if t in lis:
                bad.append("%-44s 결론이 불릿을 되풀이 「%s」" % (name, t[:44]))

        for mm in BROKEN.finditer(strip_tags(a)):
            bad.append("%-44s 부서진 문장 「%s」" % (name, mm.group(0)[:40]))

    if bad:
        print("\n".join("  ✘ " + x for x in bad))
        print("\n결과: 실패 — %d건" % len(bad))
        return 1
    print("마치며 %d편 — 결과: OK" % n)
    return 0


if __name__ == "__main__":
    sys.exit(main())
