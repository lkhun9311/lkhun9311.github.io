#!/usr/bin/env python3
"""`i18n.js` 가 `content.js` 보다 먼저 실려 있는지 잠근다.

왜 필요한가: 뒤에 실리면 카드가 **영어로 한 번 그려지고 그대로 남는다.** 오류는 없고
문단만 한국어라서, 화면을 대충 보면 「번역이 된 페이지」로 보인다. 실제로 홈에서 그렇게 돼 있었고
`check-i18n.py`(키 검사)도 `check-lang-render.html`(메뉴 검사)도 이걸 못 잡았다 —
둘 다 카드를 안 보고 있었기 때문이다."""
import glob
import re
import sys

I18N = re.compile(r'<script src="[^"]*assets/i18n\.js')
CONT = re.compile(r'<script src="[^"]*assets/content\.js')
fails, checked = [], 0
for f in sorted(glob.glob("**/*.html", recursive=True)):
    if f.startswith("tools/"):
        continue
    s = open(f, encoding="utf-8").read()
    mi, mc = I18N.search(s), CONT.search(s)
    if not mi:
        fails.append("%s: i18n.js 를 안 싣는다" % f)
        continue
    checked += 1
    if mc and mi.start() > mc.start():
        fails.append("%s: i18n.js 가 content.js 뒤에 있다 — 카드가 영어로 남는다" % f)
print("페이지 %d 검사" % checked)
for x in fails:
    print("  실패:", x)
print("결과:", "OK" if not fails else "%d건 실패" % len(fails))
sys.exit(1 if fails else 0)
