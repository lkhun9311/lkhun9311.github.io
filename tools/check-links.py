# -*- coding: utf-8 -*-
"""내부 링크가 실제 파일을 가리키는가.

2026-09-11 에 「영어 용어를 대문자로」를 돌리면서 **파일 이름까지 바뀌어** `notes/fail-closed.html`
링크가 `notes/Fail-closed.html` 이 됐다. 14 곳이었고 전부 404 가 될 자리였다. check-langs 가
`data-authored` 만 보고 있어서 두 곳만 잡았다 — 나머지 12 곳은 아무도 안 봤다.

치환 규칙을 쓸 때 **태그 안(속성)을 안 가리면** 링크가 같이 바뀐다. 이 검사가 그것을 잡는다.
"""
import glob
import io
import os
import re
import sys

HREF = re.compile(r'(?:href|src)="([^"#?:]+\.(?:html|css|js|png|svg|jpg|pdf))(?:[#?][^"]*)?"')

# 아무 데도 가지 않는 링크. `href="#"` 는 **보이지만 안 눌리는** 것이라 없는 것보다 나쁘다 —
# 누른 사람은 자기가 잘못 눌렀다고 생각한다.
# ⚠️ 실측(2026-09-13): LinkedIn 아이콘이 163쪽에서, 이력서 내려받기가 1쪽에서 이 꼴이었다.
#    주소를 못 채우면 링크를 지우고, 채울 수 있으면 채운다. 둘 중 하나다.
DEAD = re.compile(r'<a\b[^>]*href="#"[^>]*>')


def main():
    fails = []
    n = 0
    for f in sorted(glob.glob("*.html") + glob.glob("*/*.html")):
        d = os.path.dirname(f) or "."
        s = io.open(f, encoding="utf-8").read()
        for m in HREF.finditer(s):
            n += 1
            target = os.path.normpath(os.path.join(d, m.group(1)))
            if not os.path.exists(target):
                fails.append("%s → %s (없음)" % (f, m.group(1)))
        for m in DEAD.finditer(s):
            lab = re.search(r'aria-label="([^"]*)"', m.group(0))
            fails.append("%s: 아무 데도 가지 않는 링크 — %s"
                         % (f, lab.group(1) if lab else m.group(0)[:40]))
    print("내부 링크 %d 개 검사" % n)
    if fails:
        print("결과: %d 건 실패" % len(fails))
        for x in fails[:25]:
            print("  -", x)
        return 1
    print("결과: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
