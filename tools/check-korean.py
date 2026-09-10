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

LATIN = r'(?<![A-Za-z0-9])((?:[A-Za-z][A-Za-z0-9._()\[\]′-]*|[0-9][0-9,]*(?:\.[0-9]+)?(?:ms|s|GiB|MiB|KB|MB|GB|%)?))'

# 조사를 두 벌로 나눈다.
#   LONG  두 글자 이상이라 다른 낱말의 앞머리로 오해될 일이 거의 없다. 뒤에 한글이 더 붙어도
#         잡는다(`Pod 에서든`). 그래서 뒤 글자 제한은 로마자만 본다.
#   SHORT 한 글자라 낱말 앞머리와 겹친다(`5 가지`의 「가」, `2 로그`의 「로」). 뒤에 한글이 오면 뺀다.
# ⚠️ 2026-09-09 실측: 옛 목록에 `라는·인지·입니다·만의·이고·이면·이었·다` 가 없어 28곳이 샜다.
JOSA_LONG = (r'에서|에게|으로|부터|까지|처럼|보다|만의|라는|인지|입니다|'
             r'이고|이면|이라|이었|이어|이다|니까|이란|끼리|였')
# ⚠️ `였` 는 LONG 에 둔다. SHORT 였으면 `5 였습니다` 의 「습」이 한글이라 가드에 걸려 빠진다.
#    한국어에 「였」로 시작하는 낱말이 없어 뒤 글자를 안 봐도 된다.
JOSA_SHORT = r'가|이|는|은|을|를|의|에|와|과|로|도|만|라|나|다|든|뿐|면|일|인|란'
JOSA = r'((?:' + JOSA_LONG + r')(?![A-Za-z])|(?:' + JOSA_SHORT + r')(?![A-Za-z가-힣]))'

# ⚠️ 문장이 끝난 자리 뒤의 한 글자는 조사가 아니라 **지시사**다.
#    「… 삼켜집니다.</strong> 이 문장은」의 「이」는 「이 문장」의 이지 주격 조사가 아니다.
#    2026-09-09 에 이 가드가 없어서 25곳을 붙여 버렸다. 앞 글자가 문장 끝 문장부호면 뺀다.
END = r'(?<![.!?」。])'
R20 = re.compile(LATIN + END + r' ' + JOSA)

# 닫는 태그 뒤의 조사도 규약 20 이다. `<code>RestClient</code> 나` 처럼 태그가 사이에 끼면
# 위 LATIN 이 못 본다. ⚠️ 실측: 이 구멍으로 84곳이 샜다(the-ceiling 한 편에만 18곳).
R20T = re.compile(END + r'(</(?:code|strong|em|a|b|span|i)>) ' + JOSA)

# ⚠️ 옛 R13 은 `, `(쉼표+공백)만 봤다. 그래서 **줄 끝에 온 쉼표**와
#    `있고</strong>,` 처럼 닫는 태그가 끼어든 쉼표를 전부 놓쳤다. 실측 96곳.
R13 = re.compile(r'([가-힣](?:고|며|면|지만|므로|는데|어서|아서))((?:</[a-z]+>)*),(?=\s|$)')
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


PRE = re.compile(r"<pre.*?</pre>", re.S)


def outside_pre(text, fn):
    """코드 창 밖에만 `fn` 을 적용한다.

    규약 20 은 「코드 창(`<pre>`) 안에서는 하지 않는다」이다. 그 안의 줄맞춤에는 뜻이 있고
    한국어 주석은 실제 소스에 있는 그대로가 맞다. 규약 13 도 같은 이유로 여기서 뺀다.
    """
    out, last = [], 0
    for m in PRE.finditer(text):
        out.append(fn(text[last:m.start()]))
        out.append(m.group(0))
        last = m.end()
    out.append(fn(text[last:]))
    return "".join(out)


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
    # ⚠️ 13·20 도 코드 창 밖에서만 본다. 규약 20 이 「코드 창 안에서는 하지 않는다」고 못박고,
    #    같은 이유가 13 에도 그대로 걸린다 — 코드 창의 한국어 주석은 **실제 소스에 있는 그대로**가
    #    맞다. 2026-09-09 에 이 masked 를 안 쓴 채 --fix 를 돌려 인용한 주석의 쉼표를 지웠다.
    for m in R13.finditer(masked):
        found.append(("13", masked[:m.start()].count("\n") + 1, m.group(0).strip()))
    for m in R20.finditer(masked):
        found.append(("20", masked[:m.start()].count("\n") + 1, m.group(0)))
    for m in R20T.finditer(masked):
        found.append(("20", masked[:m.start()].count("\n") + 1, m.group(0)))
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
        def _rules(t):
            t = R13.sub(lambda m: m.group(1) + m.group(2), t)
            t = R20.sub(lambda m: m.group(1) + m.group(2), t)
            return R20T.sub(lambda m: m.group(1) + m.group(2), t)

        new = outside_pre(new, _rules)
        new = re.sub(r"\x00(\d+)\x00", lambda m: anchors[int(m.group(1))], new)

        # 머리말은 meta 설명과 h1-sub 안쪽만 고친다. 나머지는 손대지 않는다.
        def _clean(t):
            t = R13.sub(lambda m: m.group(1) + m.group(2), t)
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


# 한글이 든 자바스크립트 문자열. `content.js` 의 카드 문구와 `i18n.js` 의 한국어 표가 여기 있다.
# ⚠️ 규약 문서는 「`assets/content.js` 의 카드 문구」에도 규약이 적용된다고 적어 두었는데,
#    이 검사기는 `*.ko.html` 만 보고 있었다. 2026-09-09 실측으로 규약 13 이 17곳 남아 있었다.
JSSTR = re.compile(r'"((?:[^"\\\n]|\\.)*[가-힣](?:[^"\\\n]|\\.)*)"')
JSFILES = ["assets/content.js", "assets/i18n.js"]


def scan_js(path, fix=False):
    """자바스크립트 안의 한국어 문자열에 규약 13·20 을 적용한다.

    문자열 하나를 통째로 바꾸므로 따옴표·이스케이프는 건드리지 않는다.
    규약 12(줄표)와 15(음차)는 여기서 보지 않는다 — 줄표는 `check-dash.py`,
    음차는 문맥을 봐야 해서 사람이 고른다.
    """
    s = io.open(path, encoding="utf-8").read()
    found = []
    for m in JSSTR.finditer(s):
        lit = m.group(1)
        line = s[:m.start()].count("\n") + 1
        for r, rule in ((R13, "13"), (R20, "20")):
            for hit in r.finditer(lit):
                found.append((rule, line, hit.group(0).strip()))

    changed = False
    if fix:
        def one(m):
            lit = m.group(1)
            new = R13.sub(lambda x: x.group(1) + x.group(2), lit)
            new = R20.sub(lambda x: x.group(1) + x.group(2), new)
            return '"' + new + '"'
        new_s = JSSTR.sub(one, s)
        if new_s != s:
            io.open(path, "w", encoding="utf-8").write(new_s)
            changed = True
    return found, changed


def main():
    fix = "--fix" in sys.argv
    files = sorted(glob.glob("writing/*.ko.html") + glob.glob("notes/*.ko.html"))
    total, fixed, by_rule = 0, 0, {}

    for jf in JSFILES:
        if not glob.glob(jf):
            print("  ⚠️ %s 가 없다 — 검사에서 빠진다" % jf)
            continue
        _, ch = scan_js(jf, fix)
        if ch:
            fixed += 1
        for rule, line, what in scan_js(jf, False)[0]:
            by_rule.setdefault(rule, []).append("%s:%d %s" % (jf, line, what))
            total += 1

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
