#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""고친 자리가 **되돌아가 있지 않은지** 본다.

왜 있나: 2026-09-12 에 문장 둘을 고쳤다고 보고했는데 **실제로는 안 들어갔다.**
치환 패턴에 빈칸이 있던 자리가 원문에서는 줄바꿈이라 매치가 안 됐고, 검증이
「옛 문자열이 사라졌나」만 봐서 **없던 패턴을 지워도 0건**이라 통과로 보였다.

여기 적은 것은 **다시는 그 문장으로 돌아가면 안 되는 자리**다.
고친 문장이 왜 고쳐졌는지도 같이 적는다 — 이유를 모르면 다음 사람이 되돌린다.
"""
import glob
import io
import sys

# (금지 문자열, 어느 글, 왜 금지인가)
BANNED = [
    ("한쪽만 고치면 화면은 안 빨라집니다", "monitoring-two-gates-one-screen",
     "늦게 끝나는 쪽이 정한다면 느린 쪽을 고치면 화면은 빨라진다 — 앞 문장이 뒤 문장을 반박한다"),
    ("코드를 읽어서는 찾을 수\n        없고 재야만 나옵니다", "the-ceiling-was-not-in-the-code",
     "거짓 양자택일 — 의존성 트리로도 나온다"),
    ("고칠 게 없다고 쓴 모니터링 화면", "monitoring-the-screen-i-said-not-to-fix",
     "원문은 「고칠 근거를 못 찾았다」. 이 블로그가 지키자던 구별을 제목이 무너뜨린다"),
    ("나머지 안전장치는 울린 적도 연결된 적도 없었습니다", "the-only-control-that-caught-something",
     "도입은 「TTL은 발화를 증명했다」고 한다 — 정면 충돌"),
    ("운영 DB라 무중단이 불가능", "three-documents-on-a-false-premise",
     "운영 DB라는 사실만으로 안 나온다. 실제 이유는 인증 변경과 스키마 병합"),
    ("여섯 번을 같게 쟀습니다", "slow-screens-8-load-test-harness",
     "도입은 「같게 만든 것은 선언한 조건」이라고 물러선다"),
    ("그중 하나만 새 값으로 발행", "monitoring-empty-is-not-zero",
     "본문은 둘을 발행한다고 쓴다"),
]

# (있어야 하는 문자열, 어느 글) — 고친 결과가 실제로 들어가 있는지
REQUIRED = [
    ("한쪽을 고쳐도 화면은 그만큼 빨라지지 않습니다", "monitoring-two-gates-one-screen.ko.html"),
    ("의존성 트리를 펼치거나 재 봐야 나옵니다", "the-ceiling-was-not-in-the-code.ko.html"),
    ("리포트가 거절 0건이라고 적은 Arm", "it-deleted-the-tenant.ko.html"),
]


def main():
    bad = []
    files = sorted(glob.glob("writing/*.html") + glob.glob("notes/*.html") + ["assets/content.js"])
    text = {f: io.open(f, encoding="utf-8").read() for f in files}

    for phrase, where, why in BANNED:
        for f, s in text.items():
            if phrase in s:
                bad.append("%s: 되돌아간 문장 — 「%s」\n      왜 고쳤나: %s" % (f, phrase[:40], why))

    for phrase, f in REQUIRED:
        p = "writing/" + f
        if p not in text:
            bad.append("%s: 파일이 없다" % f)
        elif phrase not in text[p]:
            bad.append("%s: 고친 문장이 없다 — 「%s」" % (f, phrase[:40]))

    if bad:
        print("\n".join("  ✘ " + x for x in bad))
        print("\n결과: 실패 — %d건" % len(bad))
        return 1
    print("되돌아가면 안 되는 문장 %d개 · 있어야 하는 문장 %d개 — 결과: OK"
          % (len(BANNED), len(REQUIRED)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
