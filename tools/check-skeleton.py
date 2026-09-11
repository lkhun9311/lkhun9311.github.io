# -*- coding: utf-8 -*-
"""규약 3·7 — 발행 글에는 「예상 독자 · 무슨 내용인가요? · 마치며」가 있어야 한다.

이 뼈대가 없으면 독자가 **무엇에 관한 글인지 모른 채** 본문으로 들어간다. 실제로 2026-09-11 에
사용자 지적이 「제목도 내용도 문맥이 안 잡힌다」였고, 그때 6 편에 이 절들이 통째로 없었다.

세 언어를 같이 본다. 절 이름은 언어마다 다르므로 **id** 로 본다 — 본문 글자는 손질하면서 바뀌지만
id 는 링크가 걸려 있어 안 바뀐다.
"""
import glob
import io
import re
import sys

# ⚠️ 같은 절의 id 가 언어판·발행 시기마다 다르다(`what-is-in-here` · `どんな内容` · `Closing`).
# id 를 통일하면 이미 걸린 링크가 깨지므로, **검사기가 별명을 안다.**
WANT = {
    "ko": (("예상-독자",),
           ("무슨-내용", "어떤-화면", "어떤-서비스", "무슨-내용인가요"),
           ("마치며",)),
    "en": (("who-this-is-for",),
           ("what-this-is-about", "what-is-in-here", "what-this-is", "which-screen"),
           ("wrapping-up", "closing", "Closing")),
    "ja": (("想定読者",),
           ("この記事の内容", "どんな内容", "どの画面", "何の話"),
           ("おわりに",)),
}


def lang_of(path):
    if path.endswith(".ko.html"):
        return "ko"
    if path.endswith(".ja.html"):
        return "ja"
    return "en"


def main():
    fails = []
    n = 0
    for f in sorted(glob.glob("writing/*.html")):
        if f.endswith("index.html"):
            continue
        s = io.open(f, encoding="utf-8").read()
        m = re.search(r"<article\b.*?</article>", s, re.S)
        if not m:
            continue
        art = m.group(0)
        if art.count("<h2") < 4:          # 토막 글은 대상이 아니다
            continue
        n += 1
        ids = set(re.findall(r'<h2 id="([^"]+)"', art))
        auds, whats, wraps = WANT[lang_of(f)]
        missing = []
        if not (set(auds) & ids):
            missing.append(auds[0])
        if not (set(whats) & ids):
            missing.append(whats[0])
        if not (set(wraps) & ids) or "wrapup" not in art:
            missing.append(wraps[0])
        if missing:
            fails.append("%s: 뼈대 없음 — %s" % (f, " · ".join(missing)))
    print("본문 있는 글 %d 편 검사" % n)
    if fails:
        print("결과: %d 건 실패" % len(fails))
        for x in fails:
            print("  -", x)
        return 1
    print("결과: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
