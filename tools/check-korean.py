#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""한국어판 본문이 blog/STYLE-KO.md 의 기계로 볼 수 있는 규약을 지키는지 본다.

보는 것은 4가지다. 사람이 눈으로 잡던 것이고, 놓쳐서 적대적 검토에 걸렸다.

  규약 12  줄표(—)를 쓰지 않는다. 표의 「해당 없음」 칸만 예외
  규약 13  연결어미 뒤에 쉼표를 찍지 않는다
  규약 15  굳어진 기술 용어는 영어로 적는다(음차 금지 목록)
  규약 20  영문·숫자 뒤의 조사는 붙여 쓴다

`--fix` 를 주면 12·13·20 을 고친다. 15 는 문맥을 봐야 해서 보고만 한다.

검사 대상은 <article> 안쪽뿐이다. 머리말·목차·바닥글은 뺀다.
"""
import glob
import io
import re
import sys

LATIN = r'(?<![A-Za-z0-9])((?:[A-Za-z][A-Za-z0-9._()\[\]-]*|[0-9][0-9,]*(?:\.[0-9]+)?(?:ms|s|GiB|MiB|KB|MB|GB|%)?))'
JOSA = r'(가|이|는|은|을|를|의|에|에서|에게|와|과|로|으로|도|만|라|부터|까지|처럼|보다)'
R20 = re.compile(LATIN + r' ' + JOSA + r'(?![A-Za-z가-힣])')
R13 = re.compile(r'([가-힣](?:고|며|면|지만|므로|는데|어서|아서))(, )')
R12 = re.compile(r'—')
# 짧은 낱말은 다른 말 안에 들어 있다. 「락」은 연락처·누락에도 있으므로 앞뒤를 본다.
LOANWORDS = ["커넥션", "트랜잭션", "쓰레드", "스레드", "캐시", "인스턴스", "타임아웃",
             "백엔드", "뮤테이션", "모놀리스", "하네스", "스텁", "풀러", "워커"]
GUARDED = {"락": r"(?<![가-힣])락(?![가-힣])|(?<![가-힣])락(?=[은을이가에의과와도만])"}

# 뜻이 정반대로 뒤집히는 상습 오기. 2026-09-07 G③, 09-08 G⑥ 에서 두 번 났다.
# 「가르지 못합니다」를 쓰려다 「가릅니다」로 적으면 유보가 단정으로 바뀐다.
TYPOS = {"가릅니다": "「가르지 못합니다」의 오기가 아닌지 보라"}

SKIP12 = "해당 없음"


def body(s):
    """<article> 안쪽만 돌려준다. 없으면 (None, None)."""
    try:
        i = s.index("<article")
        j = s.index("</article>")
    except ValueError:
        return None, None
    return i, j


def scan(path, fix=False):
    s = io.open(path, encoding="utf-8").read()
    i, j = body(s)
    if i is None:
        return [], s, False
    head, mid, tail = s[:i], s[i:j], s[j:]
    found = []

    # 머리말의 meta 설명과 제목 아래 부제목도 발행되는 글이다.
    # 2026-09-08: 규약 13 위반 3건이 meta 에만 남아 검사기를 빠져나갔다.
    meta = " ".join(re.findall(r'(?:name|property)="(?:description|og:description|twitter:description)"'
                               r'\s+content="([^"]*)"', head))
    meta += " " + " ".join(re.findall(r'<span class="h1-sub">([^<]*)</span>', head))
    for m in R13.finditer(meta):
        found.append(("13", 0, "meta: " + m.group(0).strip()))
    for m in R20.finditer(meta):
        found.append(("20", 0, "meta: " + m.group(0)))

    # 줄표는 표의 「해당 없음」 칸과 코드 창 안에서만 봐준다.
    masked = re.sub(r"<pre.*?</pre>", lambda m: " " * len(m.group(0)), mid, flags=re.S)
    for m in R12.finditer(masked):
        line = masked[:m.start()].count("\n") + 1
        around = masked[max(0, m.start() - 12):m.start() + 12]
        if re.search(r"<td[^>]*>\s*—\s*</td>", around) or SKIP12 in around:
            continue
        found.append(("12", line, "줄표 " + around.strip()[:30]))
    for m in R13.finditer(mid):
        found.append(("13", mid[:m.start()].count("\n") + 1, m.group(0).strip()))
    for m in R20.finditer(mid):
        found.append(("20", mid[:m.start()].count("\n") + 1, m.group(0)))
    for w in LOANWORDS:
        for m in re.finditer(re.escape(w), mid):
            found.append(("15", mid[:m.start()].count("\n") + 1, w))
    for w, pat in GUARDED.items():
        for m in re.finditer(pat, mid):
            found.append(("15", mid[:m.start()].count("\n") + 1, w))
    for w, hint in TYPOS.items():
        for m in re.finditer(re.escape(w), mid):
            found.append(("오기", mid[:m.start()].count("\n") + 1, "%s — %s" % (w, hint)))

    changed = False
    if fix:
        # ⚠️ 앵커(id·href)는 건드리지 않는다. 손대면 목차와 어긋나고 링크가 죽는다.
        #    2026-09-08 에 음차 일괄 치환이 앵커까지 바꿔 check-langs 가 3건을 잡았다.
        anchors = []
        def stash(m):
            anchors.append(m.group(0))
            return "\x00%d\x00" % (len(anchors) - 1)
        new = re.sub(r'(?:id|href)="[^"]*"', stash, mid)
        new = R13.sub(lambda m: m.group(1) + " ", new)
        new = R20.sub(lambda m: m.group(1) + m.group(2), new)
        new = re.sub(r"\x00(\d+)\x00", lambda m: anchors[int(m.group(1))], new)

        # 머리말은 meta 설명과 h1-sub 안쪽만 고친다. 나머지는 손대지 않는다.
        def _clean(t):
            t = R13.sub(lambda m: m.group(1) + " ", t)
            return R20.sub(lambda m: m.group(1) + m.group(2), t)
        newhead = re.sub(
            r'((?:name|property)="(?:description|og:description|twitter:description)"\s+content=")([^"]*)(")',
            lambda m: m.group(1) + _clean(m.group(2)) + m.group(3), head)
        newhead = re.sub(r'(<span class="h1-sub">)([^<]*)(</span>)',
                         lambda m: m.group(1) + _clean(m.group(2)) + m.group(3), newhead)
        head = newhead
        if new != mid or head != s[:i]:      # 본문이든 머리말이든 바뀌면 쓴다
            changed = True
            io.open(path, "w", encoding="utf-8").write(head + new + tail)
    return found, s, changed


def main():
    fix = "--fix" in sys.argv
    files = sorted(glob.glob("writing/*.ko.html") + glob.glob("notes/*.ko.html"))
    total, fixed, by_rule = 0, 0, {}
    for f in files:
        found, _, changed = scan(f, fix)
        if changed:
            fixed += 1
        # 고친 뒤 남은 것만 다시 센다
        found, _, _ = scan(f, False)
        for rule, line, what in found:
            by_rule.setdefault(rule, []).append("%s:%d %s" % (f, line, what))
        total += len(found)

    if fix:
        print("고침 — 파일 %d 개" % fixed)
    for rule in sorted(by_rule):
        hits = by_rule[rule]
        print("규약 %s — %d 건" % (rule, len(hits)))
        for h in hits[:6]:
            print("   %s" % h)
        if len(hits) > 6:
            print("   … 외 %d 건" % (len(hits) - 6))
    if total:
        print("결과: %d 건 실패 (페이지 %d 개 검사)" % (total, len(files)))
        return 1
    print("통과 — 페이지 %d 개, 규약 12·13·15·20" % len(files))
    return 0


if __name__ == "__main__":
    sys.exit(main())
