#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""용어 노트의 절 목록을 `content.js` 의 `NOTES_NAV` 로 굽는다.

왜 손으로 안 쓰나: 절을 하나 넣거나 빼면 목록이 조용히 어긋난다. 그리고 어긋난 것을
잡아 줄 방법이 없다 — 이 리포에서 같은 일이 여러 번 났다(목차 번호·제목 링크 글자).
**파일이 진실이고 목록은 거기서 굽는다.**

`--check` 를 주면 쓰지 않고 **다르면 실패**한다. 검사기와 생성기가 같은 코드를 쓰므로
「생성기는 이렇게 굽는데 검사기는 저렇게 본다」가 생기지 않는다.
"""
import glob
import io
import json
import os
import re
import sys

SKIP = {"index", "tags", "engineering", "study-reading"}
# 01 쪽의 이름 — 나무에서 개요 쪽을 가리키는 말
OVERVIEW = {"ko": "개요", "en": "Overview", "ja": "概要"}
SUFFIX = {"ko": ".ko.html", "ja": ".ja.html", "en": ".html"}
# 「이 사이트에서 쓰인 곳」·「함께 볼 용어」는 어느 용어에나 있는 꼬리다 — 트리에 넣지 않는다.
TAIL = re.compile(r"(이 사이트에서 쓰인 곳|함께 볼 용어"
                  r"|Where it is used on this site|Related terms"
                  r"|このサイトで使われている記事|あわせて読む用語)")


def slugs():
    out = set()
    for p in glob.glob("notes/*.html"):
        b = os.path.basename(p)
        s = re.sub(r"\.(ko|ja)?\.?html$", "", b)
        if s not in SKIP:
            out.add(s)
    return sorted(out)


def subpages(path):
    """개요 쪽 맨 아래 「다음에 볼 것」 목록이 하위 쪽의 순서를 정한다."""
    s = io.open(path, encoding="utf-8").read()
    m = re.search(r"<article.*?</article>", s, re.S)
    if not m:
        return []
    order = []
    for a in re.finditer(r'<li><a href="([a-z0-9-]+)(?:\.(?:ko|ja))?\.html">', m.group(0)):
        if a.group(1) not in order:
            order.append(a.group(1))
    return order


def anchors(path):
    """아직 안 쪼갠 용어는 자기 절을 앵커로 담는다."""
    s = io.open(path, encoding="utf-8").read()
    m = re.search(r"<article.*?</article>", s, re.S)
    if not m:
        return []
    out = []
    for h in re.finditer(r'<h2 id="([^"]+)"[^>]*>(.*?)</h2>', m.group(0), re.S):
        t = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", h.group(2))).strip().rstrip("#").strip()
        out.append([h.group(1), t, 0])
    return out


def title_of(path):
    s = io.open(path, encoding="utf-8").read()
    m = re.search(r"<h1>(.*?)(?:<br>|</h1>)", s, re.S)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", m.group(1))).strip() if m else ""


def build():
    """쪼갠 용어는 쪽 목록, 아직 안 쪼갠 용어는 절 앵커."""
    nav = {}
    allslugs = set(slugs())
    bases = [x for x in allslugs if not any(x.startswith(o + "-") for o in allslugs if o != x)]
    for sl in sorted(bases):
        e = {}
        for lang, suf in SUFFIX.items():
            p = "notes/%s%s" % (sl, suf)
            if not os.path.exists(p):
                continue
            subs = [x for x in subpages(p) if os.path.exists("notes/%s%s" % (x, suf))]
            if subs:
                pages = [[sl, OVERVIEW[lang], 1]]
                pages += [[x, title_of("notes/%s%s" % (x, suf)), 1] for x in subs]
            else:
                pages = anchors(p)
            e[lang] = {"title": title_of(p), "sections": pages}
        if e:
            nav[sl] = e
    return nav


def render(nav):
    """한 용어가 한 줄이 되게 굽는다 — 들여쓴 JSON 은 절 하나에 여섯 줄을 쓴다."""
    rows = []
    for sl in sorted(nav):
        langs = []
        for lang in ("ko", "en", "ja"):
            if lang not in nav[sl]:
                continue
            e = nav[sl][lang]
            secs = ",".join(json.dumps(x, ensure_ascii=False, separators=(",", ":"))
                            for x in e["sections"])
            langs.append('%s:{t:%s,s:[%s]}' % (lang, json.dumps(e["title"], ensure_ascii=False), secs))
        rows.append("    %s: {%s}" % (json.dumps(sl), ", ".join(langs)))
    body = "{\n" + ",\n".join(rows) + "\n  }"
    return ("  /* 용어 노트의 절 목록. **손으로 고치지 않는다** —\n"
            "     `python3 tools/build-notes-nav.py` 가 파일에서 구워 넣고,\n"
            "     `--check` 가 어긋남을 잡는다. */\n"
            "  var NOTES_NAV = " + body + ";\n")


def main():
    nav = build()
    block = render(nav)
    p = "assets/content.js"
    s = io.open(p, encoding="utf-8").read()
    marker = re.search(r"  /\* 용어 노트의 절 목록\..*?\n  var NOTES_NAV = .*?\n  \};\n", s, re.S)
    check = "--check" in sys.argv
    if marker:
        if marker.group(0) == block:
            print("NOTES_NAV — 결과: OK (%d개 용어)" % len(nav))
            return 0
        if check:
            print("  ✘ NOTES_NAV 가 노트 파일과 다르다")
            print("     고치려면: python3 tools/build-notes-nav.py")
            print("\n결과: 실패 — 1건")
            return 1
        s = s[:marker.start()] + block + s[marker.end():]
    else:
        if check:
            print("  ✘ NOTES_NAV 가 없다\n\n결과: 실패 — 1건")
            return 1
        anchor = s.find("  var DATA = ")
        if anchor < 0:
            anchor = s.find("  var BASE = ")
        s = s[:anchor] + block + "\n" + s[anchor:]
    io.open(p, "w", encoding="utf-8").write(s)
    print("NOTES_NAV 를 %d개 용어로 구웠다" % len(nav))
    return 0


if __name__ == "__main__":
    sys.exit(main())
