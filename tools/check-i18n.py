#!/usr/bin/env python3
"""세 언어가 **실제로** 다 있는지 잠근다.

왜 필요한가: 번역이 빠진 자리는 오류를 내지 않는다. 키가 표에 없으면 영어 원문이 그대로 남고,
그건 「번역이 없다」와 「원래 영어다」를 구별할 수 없는 모양이다. 실제로 이 사이트는
`aria-label="태그로 거르기"` 를 영어 페이지에 달고 있었고, 용어 노트는 한국어 본문을
영어 URL 로 내보내고 있었다. 둘 다 아무도 실패하지 않았다.

보는 것:
  1. HTML 이 쓰는 모든 키가 ko·ja 표에 다 있는가
  2. ko 와 ja 의 키 집합이 같은가
  3. 표에 있는데 아무도 안 쓰는 키가 있는가(지워진 문구의 잔해)
  4. `data-i18n-full` 을 선언한 페이지에 **키가 안 붙은 보이는 글**이 남아 있는가
     — 선언은 「이 페이지는 위젯 없이 그 언어를 감당한다」는 뜻이라, 남아 있으면 그 문장만 영어로 남는다
"""
import glob
import json
import re
import sys

SRC = open("assets/i18n.js", encoding="utf-8").read()


def table(lang):
    m = re.search(r"\n    %s: \{\n(.*?)\n    \}" % lang, SRC, re.S)
    if not m:
        return {}
    out = {}
    for line in m.group(1).split("\n"):
        km = re.match(r'\s*"([^"]+)": (".*?"),?\s*$', line)
        if km:
            out[km.group(1)] = json.loads(km.group(2))
    return out


KO, JA = table("ko"), table("ja")
pages = [f for f in sorted(glob.glob("**/*.html", recursive=True)) if not f.startswith("tools/")]

used = set()
fails = []

KEY = re.compile(r'data-i18n(?:-html)?="([^"]+)"')
ATTR = re.compile(r'data-i18n-attr="([^"]+)"')

for f in pages:
    s = open(f, encoding="utf-8").read()
    for k in KEY.findall(s):
        used.add(k)
    for spec in ATTR.findall(s):
        for part in spec.split(";"):
            bits = part.split(":")
            if len(bits) == 2:
                used.add(bits[1].strip())

# content.js 가 코드에서 부르는 키
CJS = open("assets/content.js", encoding="utf-8").read()
for k in re.findall(r'tr\("([^"]+)"[,)]', CJS):
    used.add(k)
# LABEL_KEY 의 값도 실제로 쓰이는 키다
for k in re.findall(r':\s*"(cards\.[A-Za-z]+)"', CJS):
    used.add(k)
# 태그 묶음 이름은 세 언어 모두 영어다(UI 라벨). 표를 타지 않는다.

for k in sorted(used):
    if k not in KO:
        fails.append("키 %s 가 ko 표에 없다" % k)
    if k not in JA:
        fails.append("키 %s 가 ja 표에 없다" % k)

for k in sorted(set(KO) ^ set(JA)):
    fails.append("키 %s 가 한쪽 표에만 있다" % k)

for k in sorted(set(KO) - used):
    fails.append("키 %s 는 표에 있는데 아무도 쓰지 않는다" % k)

# 4) 통째로 감당한다고 선언한 페이지에 키 없는 글이 남았는가
STRIP = re.compile(r"<(script|style|svg)\b.*?</\1>", re.S)
COMMENT = re.compile(r"<!--.*?-->", re.S)
TAGGED = re.compile(r"<([a-z0-9]+)\b[^>]*data-i18n[^>]*>.*?</\1>", re.S | re.I)
SELFC = re.compile(r'<(p|span|div|h[1-3]|a|li)\b[^>]*class="[^"]*notranslate[^"]*"[^>]*/?>[^<]*', re.I)
NOTR = re.compile(r'<([a-z0-9]+)\b[^>]*class="[^"]*notranslate[^"]*"[^>]*>.*?</\1>', re.S | re.I)

for f in pages:
    s = open(f, encoding="utf-8").read()
    if 'data-i18n-full' not in s:
        continue
    body = s[s.index("<body"):s.index("</body>")]
    body = STRIP.sub(" ", body)
    body = COMMENT.sub(" ", body)
    # `notranslate` 는 「세 언어 모두 이대로 둔다」는 표시다. UI 라벨(메뉴·버튼·바닥글)이
    # 여기 해당한다 — 사용자 지시(2026-09-07): 그 자리는 번역하지 않고 영어로 둔다.
    for _ in range(8):                       # 중첩된 것까지 걷어낸다
        body, k1 = TAGGED.subn(" ", body)
        body, k2 = NOTR.subn(" ", body)
        body, k3 = SELFC.subn(" ", body)
        if not (k1 or k2 or k3):
            break
    text = re.sub(r"<[^>]+>", " ", body)
    text = re.sub(r"&[a-z]+;|&#\d+;", " ", text)
    leftover = [w for w in (t.strip() for t in text.split("\n")) if len(w) >= 3]
    for w in leftover[:4]:
        fails.append("%s: 키 없는 글이 남아 있다 — 「%s」" % (f, w[:60]))

print("페이지 %d · 키 %d(ko) / %d(ja) · 쓰인 키 %d" % (len(pages), len(KO), len(JA), len(used)))
for x in fails:
    print("  실패:", x)
print("결과:", "OK" if not fails else "%d건 실패" % len(fails))
sys.exit(1 if fails else 0)
