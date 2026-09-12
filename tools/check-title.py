#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""제목 줄의 구조를 본다 — 부제는 문장이고, 맥락 표지는 별도 요소다.

왜 있나: 2026-09-12 외부 검토(codex)가 **23편 전부에서 같은 문법 파손**을 지적했다.
부제가 「…하나만 고칩니다. 출시 전 소셜 투표 플랫폼 점검」 꼴이었다. 뒤쪽은 서술어가 없어
문장이 아니고, 문장 뒤에 그냥 붙어 있어 부제로 읽히지 않는다.

  1) 모든 글에 `<div class="hero-tag">#프로젝트</div>` 와 `<h1>제목<br><span class="h1-sub">…</span></h1>`
  2) 부제는 **문장으로 끝난다** — 한국어는 `다.`/`요.`, 영어는 `.`, 일본어는 `。`
  3) 부제 안에 맥락 표지가 다시 들어 있으면 안 된다 (‘사내 …’·‘A personal project…’)
  4) 프로젝트 태그는 **하나**이고 `#` 으로 시작하며 안에 빈칸이 없다
  5) 태그가 `<a>` 면 가리키는 파일이 실제로 있어야 한다 — 누를 수 있게 보이면 눌린다
"""
import glob
import io
import os
import re
import sys
import urllib.parse

CTX_IN_SUB = {
    "ko": re.compile(r"(사내 Cloud|개인 프로젝트|소셜 투표 플랫폼 ·|OpenStack 기반|연작 [①-⑧])"),
    "en": re.compile(r"(A personal project|An internal cloud admin console|Slow Screens, part|Unified Monitoring, part)"),
    "ja": re.compile(r"(社内クラウド管理コンソール|個人プロジェクト|連載「)"),
}
END = {"ko": re.compile(r"[다요]\.$"), "en": re.compile(r"[.?]$"), "ja": re.compile(r"[。]$")}

# content.js 에 실제로 있는 태그 — 「눌러도 안 걸러지는 태그」를 잡으려면 이것이 필요하다.
TAGS = set(re.findall(r'"([^"]+)"', " ".join(
    re.findall(r"tags: \[(.*?)\]", io.open("assets/content.js", encoding="utf-8").read()))))


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
        ctx = re.search(r'<div class="hero-tag[^"]*">(.*?)</div>', s, re.S)
        if not ctx:
            bad.append("%s: 프로젝트 태그(hero-tag)가 없다" % b)
            continue
        chips = re.findall(r'<(a|span) class="h1-tag"[^>]*>(.*?)</\1>', ctx.group(1), re.S)
        if len(chips) != 1:
            bad.append("%s: 프로젝트 태그가 하나가 아니다 — %d개" % (b, len(chips)))
        for kind, txt in chips:
            t = re.sub(r"<[^>]+>", "", txt).strip()
            if not t.startswith("#") or " " in t:
                bad.append("%s: 태그 꼴이 아니다 — 「%s」" % (b, t))
        for href in re.findall(r'<a class="h1-tag" href="([^"]+)"', ctx.group(1)):
            # ⚠️ 물음표 뒤를 떼고 파일을 본다. 안 떼면 `index.html?tag=X` 가 「없는 파일」이 된다.
            path, _, query = href.partition("?")
            tgt = os.path.normpath(os.path.join(os.path.dirname(p), path))
            if not os.path.exists(tgt):
                bad.append("%s: 태그가 없는 파일을 가리킨다 — %s" % (b, path))
                continue
            # 그리고 **그 태그가 실제로 거르는 태그인지**까지 본다. 파일만 있으면
            # 눌렀을 때 전체 목록이 나오고, 그건 안 눌리는 것보다 나쁘다.
            m2 = re.search(r"tag=([^&]+)", query)
            if m2 and TAGS and urllib.parse.unquote(m2.group(1)) not in TAGS:
                bad.append("%s: 거르지 못하는 태그를 가리킨다 — %s" % (b, m2.group(1)))
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
