#!/usr/bin/env python3
"""도해가 **보이는지**를 잠근다.

왜 필요한가: 예전에 그림 1 의 마지막 줄이 `y="244"` 인데 viewBox 높이가 226 이었다.
브라우저는 오류를 내지 않고 그냥 잘라 버려서, 그 문장은 **한 번도 렌더링된 적이 없었다.**
사람 눈으로는 "원래 없는 줄"과 구별되지 않는다. 그래서 좌표로 단언한다.

같이 보는 것:
  · SVG 조각이 XML 로 파싱되는가 (닫히지 않은 tspan 이 실제로 있었다)
  · 그림 안에 문장(종결어미)이 남아 있지 않은가 — 설명은 캡션이 한 번만 한다
"""
import glob
import re
import sys
import xml.etree.ElementTree as ET

SVG = re.compile(r"<svg\b.*?</svg>", re.S)
VIEWBOX = re.compile(r'viewBox="([\d.\s-]+)"')
# 문장 종결: 그림 안에는 라벨만 둔다.
# 문장 종결. 그림 안에는 라벨만 둔다 — 설명은 캡션이 한 번만 한다.
KO_JA_END = ("다", "요", "죠", "ます", "です", "である", "だ")
TEXT = re.compile(r"<text\b[^>]*>(.*?)</text>", re.S)
MARKUP = re.compile(r"<[^>]*>")

def is_sentence(body):
    t = MARKUP.sub("", body).replace("\n", " ").strip().rstrip(".。")
    if len(t) < 8:
        return False
    if t.endswith(KO_JA_END):
        return True
    # 영문: 마침표로 끝나고 낱말이 넷 이상이면 문장으로 본다.
    return MARKUP.sub("", body).strip().endswith(".") and len(t.split()) >= 4

fails = []
checked = 0

for path in sorted(glob.glob("writing/*.html") + glob.glob("notes/*.html")):
    html = open(path, encoding="utf-8").read()
    for m in SVG.finditer(html):
        svg = m.group(0)
        if 'class="arrow-icon"' in svg or "icon-link" in html[max(0, m.start() - 120):m.start()]:
            continue
        vb = VIEWBOX.search(svg)
        if not vb:
            continue
        parts = vb.group(1).split()
        if len(parts) != 4:
            continue
        checked += 1
        height = float(parts[3])
        width = float(parts[2])
        name = "%s#%s" % (path, (re.search(r'aria-labelledby="([^" ]+)', svg) or ["", "?"])[1])

        try:
            ET.fromstring(svg)
        except ET.ParseError as e:
            fails.append("%s: XML 파싱 실패 — %s" % (name, e))
            continue

        for tag in re.finditer(r"<(text|rect|line)\b[^>]*>", svg):
            t = tag.group(0)
            if 'viewBox' in t:
                continue
            y = re.search(r'\by="(-?[\d.]+)"', t)
            x = re.search(r'\bx="(-?[\d.]+)"', t)
            h = re.search(r'\bheight="(-?[\d.]+)"', t)
            if y:
                bottom = float(y.group(1)) + (float(h.group(1)) if h else 0)
                if bottom > height + 0.5:
                    fails.append("%s: %s 의 아래끝 %.0f 이 viewBox 높이 %.0f 을 넘는다 (안 보임)"
                                 % (name, tag.group(1), bottom, height))
            if x and float(x.group(1)) > width + 0.5:
                fails.append("%s: %s 의 x=%s 가 viewBox 폭 %.0f 을 넘는다" % (name, tag.group(1), x.group(1), width))

        # <title>·<desc> 는 화면에 안 그려지는 대체 텍스트다. 거기서는 문장이 맞다.
        visible = re.sub(r"<(title|desc)\b.*?</\1>", "", svg, flags=re.S)
        for tm in TEXT.finditer(visible):
            if is_sentence(tm.group(1)):
                flat = MARKUP.sub("", tm.group(1)).replace("\n", " ").strip()
                fails.append("%s: 그림 안에 문장이 남아 있다 — 「%s」" % (name, flat[:52]))

print("도해 %d개 검사" % checked)
for f in fails:
    print("  실패:", f)
print("결과:", "OK" if not fails else "%d건 실패" % len(fails))
sys.exit(1 if fails else 0)
