#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""제목 줄의 구조를 본다 — 부제는 문장이고, 맥락 표지는 별도 요소다.

왜 있나: 2026-09-12 외부 검토(codex)가 **23편 전부에서 같은 문법 파손**을 지적했다.
부제가 「…하나만 고칩니다. 출시 전 소셜 투표 플랫폼 점검」 꼴이었다. 뒤쪽은 서술어가 없어
문장이 아니고, 문장 뒤에 그냥 붙어 있어 부제로 읽히지 않는다.

  1) 모든 글에 머리의 `<a class="project-tag">#프로젝트</a>`
  1b) 제목은 **한 줄로 완결**한다 — 부제(`h1-sub`)는 두지 않는다(CLAUDE.md 제목 규칙 1).
      ⚠️ 2026-09-12 에는 이 검사기가 부제를 **전원에게 요구**했다. 그 뒤 규약이 뒤집혔고
      검사기만 따라가지 못해 **폐기된 요구사항이 42건의 진단**을 만들고 있었다. 지금은
      `SUBTITLE_GRANDFATHERED` 가 전환 전 파일을 유예하고, 그 밖에서는 부제가 실패다.
  2) 유예된 부제는 **문장으로 끝난다** — 한국어는 `다.`/`요.`, 영어는 `.`, 일본어는 `。`
  3) 부제 안에 맥락 표지가 다시 들어 있으면 안 된다 (‘사내 …’·‘A personal project…’)
  4) 프로젝트 태그는 **하나**이고 `#` 으로 시작한다
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

# 「부제 없음」으로 전환하기 **전**에 쓰인 파일들이다. 부제를 아직 들고 있고, 이번 주에
# 일괄 재작성하지 않는다 — 전환은 글을 손볼 때 함께 한다.
#
# 목록을 두는 이유는 필수 검사를 그냥 지우면 **부제가 선택사항이 되기** 때문이다. 그러면
# 「부제 없음」을 구현한 것이 아니라 아무것도 보지 않게 된다. 그래서 두 방향을 본다 —
#   목록 밖에 부제가 생기면  : 신규 도입·복원이므로 실패
#   목록 안에 부제가 없으면  : 전환을 마쳤다는 뜻이므로 목록에서 지우라고 실패
# 뒤쪽이 없으면 목록이 조용히 낡아 「안 걸림」과 「통과」를 구분할 수 없게 된다.
SUBTITLE_GRANDFATHERED = {
    "a-pooler-fixes-only-one.html",
    "a-pooler-fixes-only-one.ja.html",
    "a-pooler-fixes-only-one.ko.html",
    "a-schedule-that-failed-in-silence.html",
    "a-schedule-that-failed-in-silence.ja.html",
    "every-guarantee-ends-at-a-writable-field.html",
    "every-guarantee-ends-at-a-writable-field.ja.html",
    "every-guarantee-ends-at-a-writable-field.ko.html",
    "four-fixes-that-were-not-there.html",
    "four-fixes-that-were-not-there.ja.html",
    "four-fixes-that-were-not-there.ko.html",
    "gpu-input-length-in-characters.ko.html",
    "gpu-node-readiness.html",
    "gpu-node-readiness.ko.html",
    "gpu-quota-control-plane.html",
    "gpu-quota-control-plane.ko.html",
    "iaas-backend-performance.html",
    "instance-ha-2-what-each-signal-can-say.html",
    "instance-ha-2-what-each-signal-can-say.ja.html",
    "instance-ha-4-no-fencing-no-recovery.html",
    "instance-ha-4-no-fencing-no-recovery.ja.html",
    "instance-ha-5-quorum-does-not-cut-power.html",
    "instance-ha-5-quorum-does-not-cut-power.ja.html",
    "instance-ha-6-100-seconds-is-a-service-decision.html",
    "instance-ha-6-100-seconds-is-a-service-decision.ja.html",
    "monitoring-empty-is-not-zero.html",
    "monitoring-empty-is-not-zero.ja.html",
    "monitoring-one-shared-cache.html",
    "monitoring-one-shared-cache.ja.html",
    "monitoring-the-screen-i-said-not-to-fix.html",
    "monitoring-the-screen-i-said-not-to-fix.ja.html",
    "monitoring-three-races-in-one-cache.html",
    "monitoring-three-races-in-one-cache.ja.html",
    "monitoring-two-gates-one-screen.html",
    "monitoring-two-gates-one-screen.ja.html",
    "parallelism-made-the-tail-worse.html",
    "parallelism-made-the-tail-worse.ja.html",
    "recovery-host-must-have-the-device.html",
    "recovery-host-must-have-the-device.ja.html",
    "refusal-paths-exercised-for-real.html",
    "refusal-paths-exercised-for-real.ja.html",
    "refusal-paths-exercised-for-real.ko.html",
    "seven-of-eight-should-not-recover.html",
    "seven-of-eight-should-not-recover.ja.html",
    "slow-screens-1-volume-list.html",
    "slow-screens-1-volume-list.ja.html",
    "slow-screens-2-instance-list.html",
    "slow-screens-2-instance-list.ja.html",
    "slow-screens-3-role-lookup.html",
    "slow-screens-3-role-lookup.ja.html",
    "slow-screens-4-client-per-loop.html",
    "slow-screens-4-client-per-loop.ja.html",
    "slow-screens-7-nothing-to-fix.html",
    "slow-screens-7-nothing-to-fix.ja.html",
    "slow-screens-8-load-test-harness.html",
    "slow-screens-8-load-test-harness.ja.html",
    "the-40-gib-that-did-not-move.html",
    "the-40-gib-that-did-not-move.ja.html",
    "the-40-gib-that-did-not-move.ko.html",
    "the-ceiling-was-not-in-the-code.html",
    "the-ceiling-was-not-in-the-code.ja.html",
    "the-ceiling-was-not-in-the-code.ko.html",
    "the-dependency-only-the-tests-installed.html",
    "the-dependency-only-the-tests-installed.ja.html",
    "the-dependency-only-the-tests-installed.ko.html",
    "the-hard-part-of-ha-was-not-recovery.html",
    "the-hard-part-of-ha-was-not-recovery.ja.html",
    "the-history-tab-that-had-a-hole.html",
    "the-history-tab-that-had-a-hole.ja.html",
    "the-ladder-that-could-not-be-climbed.html",
    "the-ladder-that-could-not-be-climbed.ja.html",
    "the-ladder-that-could-not-be-climbed.ko.html",
    "the-only-control-that-caught-something.html",
    "the-only-control-that-caught-something.ja.html",
    "the-only-control-that-caught-something.ko.html",
    "the-review-that-skipped-the-big-file.html",
    "the-review-that-skipped-the-big-file.ja.html",
    "the-review-that-skipped-the-big-file.ko.html",
    "three-documents-on-a-false-premise.html",
    "three-documents-on-a-false-premise.ja.html",
    "three-documents-on-a-false-premise.ko.html",
    "twenty-three-runs-one-condition.html",
    "twenty-three-runs-one-condition.ja.html",
    "twenty-three-runs-one-condition.ko.html",
    "until-the-guarantee-was-a-sentence.html",
    "until-the-guarantee-was-a-sentence.ja.html",
    "until-the-guarantee-was-a-sentence.ko.html",
    "validation-failed-is-not-invalid.html",
    "validation-failed-is-not-invalid.ja.html",
    "validation-failed-is-not-invalid.ko.html",
    "what-recovery-leaves-behind.html",
    "what-recovery-leaves-behind.ja.html",
}

# content.js 에 실제로 있는 태그 — 「눌러도 안 걸러지는 태그」를 잡으려면 이것이 필요하다.
TAGS = set(re.findall(r'"([^"]+)"', " ".join(
    re.findall(r"tags: \[(.*?)\]", io.open("assets/content.js", encoding="utf-8").read()))))


def lang_of(name):
    return "ko" if name.endswith(".ko.html") else ("ja" if name.endswith(".ja.html") else "en")


# 노트 쪽의 날짜는 content.js 가 원본이다. 세 언어의 표기를 여기서 만든다 —
# 사이트가 dateLabel() 로 만드는 것과 같은 규칙이다.
MONTH_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def _note_dates():
    src = io.open("assets/content.js", encoding="utf-8").read()
    i = src.find("notes:")
    seg = src[i:src.find("\n  };", i)]
    out = {}
    for m in re.finditer(r'url: "notes/([^".]+)\.html"[\s\S]{0,900}?date: "([0-9-]+)", dateLabel: "([^"]+)"', seg):
        slug, date, lab = m.group(1), m.group(2), m.group(3)
        y, mo = date.split("-")[0], int(date.split("-")[1])
        out[slug] = {"ko": "%s년 %d월" % (y, mo),
                     "ja": "%s年%d月" % (y, mo),
                     "en": lab or "%s %s" % (MONTH_EN[mo - 1], y)}
    # 하위 쪽(percentile-average …)은 목록에 없다 — 개요 쪽의 날짜를 쓴다.
    return out


NOTE_DATE = _note_dates()
for _s in list(NOTE_DATE):
    pass


def _fill_subpages():
    import glob as _g
    for f in _g.glob("notes/*.html"):
        slug = re.sub(r"\.(ko|ja)\.html$|\.html$", "", os.path.basename(f))
        if slug in NOTE_DATE:
            continue
        for k in NOTE_DATE:
            if slug.startswith(k + "-"):
                NOTE_DATE[slug] = NOTE_DATE[k]
                break


_fill_subpages()


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
        ctx = re.search(r'<div class="article-meta">(.*?)</div>', s, re.S)
        if not ctx:
            bad.append("%s: 머리(article-meta)가 없다" % b)
            continue
        chips = re.findall(r'<(a) class="project-tag[^"]*"[^>]*>(.*?)</\1>', ctx.group(1), re.S)
        if len(chips) != 1:
            bad.append("%s: 프로젝트 태그가 하나가 아니다 — %d개" % (b, len(chips)))
        for kind, txt in chips:
            t = re.sub(r"<[^>]+>", "", txt).strip()
            if not t.startswith("#"):
                bad.append("%s: 태그 꼴이 아니다 — 「%s」" % (b, t))
        for href in re.findall(r'<a class="project-tag[^"]*" href="([^"]+)"', ctx.group(1)):
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
        if b not in SUBTITLE_GRANDFATHERED:
            # 전환을 마친 파일과 새 글. 부제가 **없는 것**이 통과다.
            if sub:
                bad.append("%s: 부제(h1-sub)를 새로 뒀다 — 현행 규약은 부제 없음이다" % b)
            continue
        if not sub:
            bad.append("%s: 부제를 지웠으면 SUBTITLE_GRANDFATHERED 에서도 지워라" % b)
            continue
        t = re.sub(r"<[^>]+>", "", sub.group(1)).strip()
        if not END[lang].search(t):
            bad.append("%s: 부제가 문장으로 끝나지 않는다 — 「…%s」" % (b, t[-24:]))
        mm = CTX_IN_SUB[lang].search(t)
        if mm:
            bad.append("%s: 부제 안에 맥락 표지가 다시 있다 — 「%s」" % (b, mm.group(0)))

    # 용어 노트에는 부제를 두지 않는다(사용자 지시, 2026-09-12).
    # 제목이 곧 용어이고 바로 아래 첫 절이 그 뜻을 말한다 — 부제는 그 절을 한 번 더 말한다.
    #
    # 그리고 제목 아래 한 줄은 **그 쪽의 날짜**다(사용자 지시, 2026-09-12).
    # ⚠️ 왜 이 검사가 생겼나: 노트 45쪽이 껍데기를 빌려 오면서 그 줄을 그대로 물려받아
    #    전부 「성능 측정 · #Warm-up」 이라고 적고 있었다. 태그가 TAGS 안에 있으니 위의 검사는
    #    통과했다 — **그 쪽 자신의 것인지**를 아무도 안 봤다. 날짜와 대조하면 그 구멍이 막힌다.
    for p in sorted(glob.glob("notes/*.html")):
        b = os.path.basename(p)
        if re.sub(r"\.(ko|ja)?\.?html$", "", b) in ("index", "tags"):
            continue
        s2 = io.open(p, encoding="utf-8").read()
        if 'class="h1-sub"' in s2:
            bad.append("%s: 용어 노트에 부제가 있다 — 첫 절이 그 일을 한다" % b)
        md = re.search(r'<p class="article-date[^"]*">(.*?)</p>', s2, re.S)
        if not md:
            bad.append("%s: 제목 아래 날짜 줄이 없다" % b)
            continue
        line = re.sub(r"<[^>]+>", "", md.group(1)).strip()
        want = NOTE_DATE.get(re.sub(r"\.(ko|ja)\.html$|\.html$", "", b),
                             {}).get(lang_of(b))
        if want and line != want:
            bad.append("%s: 날짜 줄이 그 쪽의 것이 아니다 — 「%s」 (맞는 값 「%s」)"
                       % (b, line[:32], want))

    if bad:
        print("\n".join("  ✘ " + x for x in bad))
        print("\n결과: 실패 — %d건" % len(bad))
        return 1
    print("제목 줄 %d편 — 결과: OK" % n)
    return 0


if __name__ == "__main__":
    sys.exit(main())
