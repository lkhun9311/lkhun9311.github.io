# -*- coding: utf-8 -*-
"""규약 18(2026-09-11 개정) — 한국어·일본어 본문의 영어 기술 용어는 낱말마다 대문자로 시작한다.

사용자 지시로 **뒤집힌 규약**이다. 그 전에는 「보통명사는 소문자」였고, 그래서 `cache`·`thread`·
`connection pool` 이 전부 소문자였다. 지금은 `Cache`·`Thread`·`Connection Pool` 이다.

세지 않는 곳: `<pre>`·`<code>`(인용한 소스와 식별자) · `<script>` · 태그 속성(`content=` 은 예외로 본다).
⚠️ **명령과 코드 식별자는 대상이 아니다.** `head -c` 를 `Head -c` 로 바꾸면 틀린 명령이 되고,
`computeIfAbsent` 를 바꾸면 소스에 없는 이름이 된다. 그래서 목록을 명시적으로 둔다.
"""
import glob
import io
import re
import sys

TERMS = ["connection pooler", "connection pool", "transaction pooling", "control plane",
         "cache", "connection", "transaction", "thread", "backend", "harness", "pooler",
         "pooling", "pool", "timeout", "stub", "instance", "worker", "monolith", "mutation",
         "console", "cloud", "lock", "arm", "swap", "client", "baseline", "executor",
         "payload", "loader", "plugin", "device", "polling", "producer",
         "fail-closed", "fail-open"]
PATS = [re.compile(r"(?<![A-Za-z0-9_/.-])" + t.replace(" ", r"\s+") + r"(?![A-Za-z0-9_/.-])")
        for t in TERMS]
SKIP = re.compile(r"<pre\b.*?</pre>|<code\b.*?</code>|<script\b.*?</script>|<[^>]+>", re.S)
META = re.compile(r'<meta[^>]*\scontent="([^"]*)"')


def texts(s):
    """태그 바깥 글자 + meta content."""
    out, last = [], 0
    for m in SKIP.finditer(s):
        out.append(s[last:m.start()])
        last = m.end()
    out.append(s[last:])
    out.extend(META.findall(s))
    return out


# ⚠️ 본문만 보면 **가장 많이 읽히는 자리를 안 본다.** 목록 페이지의 카드 제목·요약과
#    페이지 부제는 전부 `assets/i18n.js` · `assets/content.js` 의 문자열이다. 2026-09-12 에
#    거기서 「Kubernetes control plane」이 소문자로 남아 있는 것을 사용자가 화면으로 잡았고,
#    검사기는 그동안 OK 를 찍고 있었다. 한글·가나가 든 문자열 리터럴만 골라 같은 규약을 댄다.
DATA = ("assets/i18n.js", "assets/content.js")
LITERAL = re.compile(r'"((?:[^"\\]|\\.)*)"')
CJK = re.compile(r"[가-힣ぁ-んァ-ン一-龥]")


def data_strings(path):
    s = io.open(path, encoding="utf-8").read()
    return [m.group(1) for m in LITERAL.finditer(s) if CJK.search(m.group(1))]


def main():
    files = (sorted(glob.glob("writing/*.ko.html")) + sorted(glob.glob("writing/*.ja.html")) +
             sorted(glob.glob("notes/*.ko.html")) + sorted(glob.glob("notes/*.ja.html")))
    fails = []
    n_data = 0
    for f in DATA:
        for v in data_strings(f):
            n_data += 1
            for rx in PATS:
                m = rx.search(v)
                if m:
                    fails.append("%s: 소문자 영어 용어 — 「%s」 (…%s…)" % (f, m.group(0), v[:60]))
                    break
    for f in files:
        s = io.open(f, encoding="utf-8").read()
        for chunk in texts(s):
            for rx in PATS:
                m = rx.search(chunk)
                if m:
                    fails.append("%s: 소문자 영어 용어 — 「%s」 (…%s…)"
                                 % (f, m.group(0),
                                    re.sub(r"\s+", " ", chunk[max(0, m.start() - 26):m.end() + 14]).strip()))
                    break
            else:
                continue
            break
    print("한국어·일본어 %d 쪽 + 데이터 문자열 %d 개 검사" % (len(files), n_data))
    if fails:
        print("결과: %d 건 실패" % len(fails))
        for x in fails[:20]:
            print("  -", x)
        return 1
    print("결과: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
