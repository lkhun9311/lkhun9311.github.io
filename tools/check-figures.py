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
import io
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
    # 「~마다 · ~보다 · ~뿐」 처럼 `다` 로 끝나지만 문장이 아닌 꼬리는 뺀다.
    # 2026-09-08: 「갱신 cache · 60초마다」가 문장으로 잡혔다.
    if t.endswith(("마다", "보다", "이다", "만큼", "부터", "까지")) and "·" in t:
        return False
    # 「あいだ · からだ · ただ · まだ」 처럼 だ 로 끝나지만 명사인 꼬리도 뺀다.
    # 2026-09-08: 일본어판 도해 라벨 「文字と文字のあいだ」가 문장으로 잡혔다.
    if t.endswith(("あいだ", "からだ", "ただ", "まだ", "はだ", "ひだ")):
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

# ── <img> 속성 문법 (2026-09-08 추가)
# 치환 스크립트가 alt 를 반만 갈아 끼워 `alt="..."한국어..." loading=` 이 만들어졌는데
# 어떤 검사기도 못 잡았다. 속성 사이에 정체불명의 글자가 끼면 여기서 잡는다.
IMG = re.compile(r"<img\b[^>]*>")
ATTR = re.compile(r'\s+[a-zA-Z-]+="[^"]*"')
n_img = 0
for f in sorted(glob.glob("writing/*.html") + glob.glob("notes/*.html")):
    try:
        t = io.open(f, encoding="utf-8").read()
    except OSError:
        continue
    for m in IMG.finditer(t):
        n_img += 1
        body = m.group(0)[4:-1]
        rest = ATTR.sub("", body).strip().lstrip("/")
        if rest:
            fails.append("%s: <img> 속성 사이에 남은 것 — %r" % (f, rest[:60]))
        if 'alt="' not in m.group(0):
            fails.append("%s: <img> 에 alt 가 없다" % f)

# ── 규약 4: 그림 3장 이상 ────────────────────────────────────────────────────
# 2026-09-10 에 새 글을 2장으로 발행할 뻔했다. 개수를 세는 검사가 없어서 사람이 규약 문서를
# 다시 읽어야만 알 수 있었다. 그래서 여기서 센다.
#
# ⚠️ 기존 발행본 여럿이 이미 3장 미만이다(STYLE-KO 진행표의 「초판」·「용어」 단계).
#    그것들을 지금 실패로 만들면 검사기가 늘 빨간불이라 아무도 안 보게 된다. 그래서
#    **아래 목록은 봐주고 그 밖의 글만 잠근다.** 목록은 줄기만 해야 한다 — 채워 넣은 글은 여기서 뺀다.
FEW_FIGURES_OK = {
    "writing/bugs-that-return-exit-code-zero.html",
    "writing/gpu-node-readiness.html",
    "writing/gpu-quota-control-plane.html",
    "writing/iaas-backend-performance.html",
    "writing/parallelism-made-the-tail-worse.html",
    "writing/parallelism-made-the-tail-worse.ja.html",
    "writing/parallelism-made-the-tail-worse.ko.html",
    "writing/seven-of-eight-should-not-recover.html",
    "writing/seven-of-eight-should-not-recover.ja.html",
    "writing/seven-of-eight-should-not-recover.ko.html",
    "writing/the-only-control-that-caught-something.html",
    "writing/the-only-control-that-caught-something.ja.html",
    "writing/the-only-control-that-caught-something.ko.html",
    "writing/three-documents-on-a-false-premise.html",
    "writing/three-documents-on-a-false-premise.ja.html",
    "writing/three-documents-on-a-false-premise.ko.html",
    "writing/until-the-guarantee-was-a-sentence.html",
    "writing/until-the-guarantee-was-a-sentence.ja.html",
    "writing/until-the-guarantee-was-a-sentence.ko.html",
}

few = []
for f in sorted(glob.glob("writing/*.html")):
    if f.endswith("index.html") or f.endswith("tags.html"):
        continue
    n = open(f, encoding="utf-8").read().count('<figure class="diagram"')
    if n < 3 and f not in FEW_FIGURES_OK:
        few.append("%s: 그림 %d장 — 규약 4 는 3장 이상이다" % (f, n))
    if n >= 3 and f in FEW_FIGURES_OK:
        few.append("%s: 그림 %d장으로 채워졌다 — FEW_FIGURES_OK 에서 빼라" % (f, n))
fails.extend(few)

print("도해 %d개 · <img> %d개 검사" % (checked, n_img))
for f in fails:
    print("  실패:", f)
print("결과:", "OK" if not fails else "%d건 실패" % len(fails))
sys.exit(1 if fails else 0)
