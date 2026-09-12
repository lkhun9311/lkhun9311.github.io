#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""사용자가 지시한 화면 규칙이 되돌아가지 않았는지 본다.

이 파일이 있는 이유: **같은 지시를 두 번 받았다.** 2026-09-11 에 「부제목은 회색으로」를 받고
`.page-hero h1 .h1-sub` 만 고쳤는데, 목록 페이지의 부제인 `.lead` 는 `--text-soft`(#3b3344,
거의 검정) 그대로였다. 2026-09-12 에 같은 지시가 다시 왔다. 눈으로 보고 고치는 규칙은
**고친 자리만 고쳐지고 나머지는 남는다.**

  1) 날짜·배지는 제목 **위**에 둔다 → `.entry-row` 가 왼쪽 칸을 만드는 grid 면 안 된다.
  2) 부제는 회색(`--muted`) 이다 → `.lead` · `.h1-sub` · `.entry-desc` 셋 다.
  3) 관련 글에는 제목 밑에 한 줄이 붙는다 → 렌더러가 `aside-more-sub` 를 낸다.
"""
import io
import re
import sys

CSS = "assets/styles.css"
GRAY = ("lead", "h1-sub", "entry-desc")


def rule(css, selector, prop=None):
    """그 선택자의 마지막 선언 블록을 돌려준다 — 뒤에 오는 것이 이긴다.

    ⚠️ `prop` 을 주면 **그 속성을 실제로 정하는** 마지막 블록을 찾는다. 미디어 쿼리 안의
    `.entry-desc` 처럼 색을 안 건드리는 블록이 뒤에 있으면, 그냥 마지막을 보면 「색이 없다」가 된다.
    """
    out = None
    for m in re.finditer(r"(^|\n)([^\n{}]*)\{([^}]*)\}", css):
        sels = [x.strip() for x in m.group(2).split(",")]
        if not any(s == selector or s.endswith(" " + selector) for s in sels):
            continue
        if prop and not re.search(r"\b%s\s*:" % re.escape(prop), m.group(3)):
            continue
        out = m.group(3)
    return out


def main():
    css = io.open(CSS, encoding="utf-8").read()
    bad = []

    r = rule(css, ".entry-row")
    if r is None:
        bad.append(".entry-row 규칙이 없다")
    elif "grid-template-columns" in r or re.search(r"display:\s*grid", r):
        bad.append(".entry-row 가 격자다 — 날짜가 제목 왼쪽으로 돌아갔다")

    for sel, name in ((".lead", "lead"), (".page-hero h1 .h1-sub", "h1-sub"), (".entry-desc", "entry-desc")):
        r = rule(css, sel.split()[-1] if " " in sel else sel, "color")
        if r is None:
            bad.append("%s 규칙이 없다" % sel)
        elif "var(--muted)" not in r:
            m = re.search(r"color:\s*([^;]+)", r)
            bad.append("%s 의 색이 회색(--muted)이 아니다 — %s" % (sel, (m.group(1).strip() if m else "color 없음")))

    js = io.open("assets/content.js", encoding="utf-8").read()
    if "aside-more-sub" not in js:
        bad.append("관련 글에 제목 밑 한 줄(aside-more-sub)이 없다")
    if re.search(r"it\.source === me\.source;\s*\n\s*\}\)\.slice", js):
        bad.append("관련 글을 주제가 아니라 출처로 고르고 있다")

    if bad:
        print("\n".join("  ✘ " + x for x in bad))
        print("\n결과: 실패 — %d건" % len(bad))
        return 1
    print("화면 규칙 3가지 — 결과: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
