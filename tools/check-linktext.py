#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""링크 글자가 **대상 글의 제목을 잘못 말하고 있지 않은지** 본다.

제목을 고치면 그 제목을 가리키던 본문 링크가 뒤에 남는다. 2026-09-12 에
`a-pooler-…` 세 판본과 용어 노트 열여덟 곳이 「처리량 상한은 코드에 없었습니다」·
「RDS Proxy로는 못 고치는 Connection 고갈」처럼 **이미 없는 제목**을 가리키고 있었다.
`check-links` 는 파일이 있는지만 보므로 이것을 못 잡는다.

「①편」·「part one」처럼 **짧은 가리킴말은 대상이 아니다** — 제목을 말하려는 것이 아니라
순서를 말하는 것이다. 제목을 말하려 드는 긴 글자만 본다.
"""
import glob
import io
import os
import re
import sys

TITLEISH = {
    "ko": re.compile(r"(습니다|았다|었다|입니다|하다)$"),
    "ja": re.compile(r"(ます|ました|ません|です|でした)$"),
    "en": re.compile(r"^[A-Z]"),
}
MIN = {"ko": 12, "ja": 12, "en": 22}


def lang_of(b):
    return "ko" if b.endswith(".ko.html") else ("ja" if b.endswith(".ja.html") else "en")


def main():
    titles = {}
    for p in glob.glob("writing/*.html") + glob.glob("notes/*.html"):
        m = re.search(r"<h1>(.*?)(?:<br>|</h1>)", io.open(p, encoding="utf-8").read(), re.S)
        if m:
            titles[os.path.basename(p)] = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", m.group(1))).strip()

    bad, n = [], 0
    for p in sorted(glob.glob("writing/*.html") + glob.glob("notes/*.html")):
        b = os.path.basename(p)
        lang = lang_of(b)
        s = io.open(p, encoding="utf-8").read()
        m = re.search(r"<article.*?</article>", s, re.S)
        if not m:
            continue
        for a in re.finditer(r'<a href="([^"#]+\.html)"[^>]*>(.*?)</a>', m.group(0), re.S):
            tgt = os.path.basename(a.group(1))
            if tgt not in titles:
                continue
            txt = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", a.group(2))).strip()
            if len(txt) < MIN[lang] or not TITLEISH[lang].search(txt):
                continue          # 짧은 가리킴말 — 제목을 말하려는 것이 아니다
            n += 1
            t = titles[tgt]
            if txt not in t and t not in txt:
                bad.append("%s: 「%s」\n      대상 제목: %s" % (b, txt, t))

    if bad:
        print("\n".join("  ✘ " + x for x in bad))
        print("\n결과: 실패 — %d건" % len(bad))
        return 1
    print("제목을 말하는 링크 %d개 — 결과: OK" % n)
    return 0


if __name__ == "__main__":
    sys.exit(main())
