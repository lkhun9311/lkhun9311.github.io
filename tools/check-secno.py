#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""절 번호가 세 자리에서 같은 절을 가리키는지 본다.

번호는 세 곳에 나온다 — 본문 절 제목, 오른쪽 목차, 그리고 용어 노트의 왼쪽 나무.
셋 다 **CSS 카운터와 배열 순서**로 만들므로 숫자 자체는 손으로 틀릴 수가 없다.
틀릴 수 있는 것은 **순서와 개수**다. 목차에 한 줄을 빠뜨리거나 순서를 바꾸면
목차의 07 과 본문의 07 이 다른 절이 되고, 그건 아무 검사에도 안 걸린다.

  1) 본문 `<h2 id>` 목록과 목차 `<li><a href="#id">` 목록이 **순서까지 같아야 한다**
  2) 용어 노트는 왼쪽 나무(`NOTES_NAV`)의 절 목록도 본문과 같아야 한다
"""
import glob
import io
import os
import re
import sys


def main():
    bad, n = [], 0
    for p in sorted(glob.glob("writing/*.html") + glob.glob("notes/*.html")):
        b = os.path.basename(p)
        if b == "index.html":
            continue
        s = io.open(p, encoding="utf-8").read()
        m = re.search(r"<article.*?</article>", s, re.S)
        if not m:
            continue
        n += 1
        body = re.findall(r'<h2 id="([^"]+)"', m.group(0))
        toc = re.findall(r'<li><a href="#([^"]+)">', s)
        if body != toc:
            extra = [x for x in toc if x not in body]
            miss = [x for x in body if x not in toc]
            why = ("목차에만 %s" % extra if extra else
                   "본문에만 %s" % miss if miss else "순서가 다르다")
            bad.append("%s: 목차 %d줄 · 본문 %d절 — %s" % (b, len(toc), len(body), why))

    js = io.open("assets/content.js", encoding="utf-8").read()
    blk = re.search(r"var NOTES_NAV = \{(.*?)\n  \};", js, re.S)
    if blk:
        for m in re.finditer(r'"([a-z0-9-]+)": \{(.*?)\}\},?\n', blk.group(1), re.S):
            slug = m.group(1)
            for lang, suf in (("ko", ".ko"), ("en", ""), ("ja", ".ja")):
                mm = re.search(r'%s:\{t:"[^"]*",s:\[(.*?)\]\}' % lang, m.group(2))
                p = "notes/%s%s.html" % (slug, suf)
                if not mm or not os.path.exists(p):
                    continue
                # 셋째 칸이 1이면 **쪽 목록**이라 본문 절과 견줄 것이 아니다.
                # 그때는 그 쪽들이 실제로 있는지만 본다.
                items = re.findall(r'\["([^"]*)","(?:[^"]|\\")*",(\d)\]', mm.group(1))
                if items and items[0][1] == "1":
                    for sub, _ in items:
                        q = "notes/%s%s.html" % (sub, suf)
                        if not os.path.exists(q):
                            bad.append("%s: 나무가 없는 쪽을 가리킨다 — %s" % (slug, q))
                    continue
                ids = [x for x, _ in items]
                a = re.search(r"<article.*?</article>",
                              io.open(p, encoding="utf-8").read(), re.S)
                body = re.findall(r'<h2 id="([^"]+)"', a.group(0)) if a else []
                if ids != body:
                    bad.append("%s: 왼쪽 나무 %s · 본문 %s" % (os.path.basename(p), ids, body))

    if bad:
        print("\n".join("  ✘ " + x for x in bad))
        print("\n결과: 실패 — %d건" % len(bad))
        return 1
    print("절 번호 %d쪽 — 본문·목차·나무가 같은 절을 가리킨다" % n)
    return 0


if __name__ == "__main__":
    sys.exit(main())
