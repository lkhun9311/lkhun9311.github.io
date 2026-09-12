#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""제목 줄의 구조를 본다 — 부제는 문장이고, 맥락 표지는 별도 요소다.

왜 있나: 2026-09-12 외부 검토(codex)가 **23편 전부에서 같은 문법 파손**을 지적했다.
부제가 「…하나만 고칩니다. 출시 전 소셜 투표 플랫폼 점검」 꼴이었다. 뒤쪽은 서술어가 없어
문장이 아니고, 문장 뒤에 그냥 붙어 있어 부제로 읽히지 않는다.

  1) 모든 글에 `<h1>제목<br><span class="h1-sub">…</span><span class="h1-context">…</span></h1>`
  2) 부제는 **문장으로 끝난다** — 한국어는 `다.`/`요.`, 영어는 `.`, 일본어는 `。`
  3) 부제 안에 맥락 표지가 다시 들어 있으면 안 된다 (「사내 …」·「A personal project…」)
  4) 표지는 `시스템 · 범위` 꼴이다 — 가운뎃점이 정확히 하나
"""
import glob
import io
import os
import re
import sys

CTX_IN_SUB = {
    "ko": re.compile(r"(사내 Cloud|개인 프로젝트|소셜 투표 플랫폼 ·|OpenStack 기반|연작 [①-⑧])"),
    "en": re.compile(r"(A personal project|An internal cloud admin console|Slow Screens, part|Unified Monitoring, part)"),
    "ja": re.compile(r"(社内クラウド管理コンソール|個人プロジェクト|連載「)"),
}
END = {"ko": re.compile(r"[다요]\.$"), "en": re.compile(r"[.?]$"), "ja": re.compile(r"[。]$")}


def main():
    bad, n = [], 0
    for p in sorted(glob.glob("writing/*.html")):
        b = os.path.basename(p)
        if b == "index.html":
            continue
        lang = "ko" if b.endswith(".ko.html") else ("ja" if b.endswith(".ja.html") else "en")
        s = io.open(p, encoding="utf-8").read()
        m = re.search(r"<h1>(.*?)</h1>", s, re.S)
        if not m:
            continue
        n += 1
        h = m.group(1)
        sub = re.search(r'<span class="h1-sub">(.*?)</span>', h, re.S)
        ctx = re.search(r'<span class="h1-context[^"]*">(.*?)</span>', h, re.S)
        if not ctx:
            bad.append("%s: 맥락 표지(h1-context)가 없다" % b)
            continue
        c = re.sub(r"<[^>]+>", "", ctx.group(1)).strip()
        if c.count("·") != 1:
            bad.append("%s: 표지가 「시스템 · 범위」 꼴이 아니다 — 「%s」" % (b, c))
        if not sub:
            bad.append("%s: 부제(h1-sub)가 없다" % b)
            continue
        t = re.sub(r"<[^>]+>", "", sub.group(1)).strip()
        if not END[lang].search(t):
            bad.append("%s: 부제가 문장으로 끝나지 않는다 — 「…%s」" % (b, t[-24:]))
        mm = CTX_IN_SUB[lang].search(t)
        if mm:
            bad.append("%s: 부제 안에 맥락 표지가 다시 있다 — 「%s」" % (b, mm.group(0)))

    if bad:
        print("\n".join("  ✘ " + x for x in bad))
        print("\n결과: 실패 — %d건" % len(bad))
        return 1
    print("제목 줄 %d편 — 결과: OK" % n)
    return 0


if __name__ == "__main__":
    sys.exit(main())
