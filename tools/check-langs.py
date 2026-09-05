#!/usr/bin/env python3
"""손으로 쓴 언어판들이 서로 어긋나지 않았는지 검사한다.

검사 항목: HTML 태그 균형 · 목차와 h2 앵커 일치 · data-authored 가 실재 파일을 가리키는지 ·
hreflang 4종 · 본문 언어 링크 실재 · lang.js 가 element.js 보다 먼저 로드되는지 ·
인라인 googleTranslateElementInit 잔재 · <html lang> 과 og:locale 정합.

실패하면 종료코드 1. 검사한 묶음이 0 개여도 실패다(조용히 통과 금지)."""
import pathlib, re, json, sys
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent.parent
VOID = {'br','img','meta','link','input','hr','path','source'}
LOCALE = {'en':'en_US','ko':'ko_KR','ja':'ja_JP'}


class Balance(HTMLParser):
    def __init__(self):
        super().__init__(); self.stack=[]; self.err=[]
    def handle_starttag(self, t, a):
        if t not in VOID: self.stack.append(t)
    def handle_endtag(self, t):
        if t in VOID: return
        if not self.stack or self.stack[-1] != t:
            self.err.append(f"</{t}> 불일치 at {self.getpos()}")
            for i in range(len(self.stack)-1, -1, -1):
                if self.stack[i] == t:
                    del self.stack[i:]; break
        else:
            self.stack.pop()


def groups():
    """data-authored 를 가진 페이지를 묶음 단위로 모은다."""
    found = {}
    for f in sorted(ROOT.rglob('*.html')):
        s = f.read_text(encoding='utf-8')
        m = re.search(r"data-authored='([^']+)'", s)
        if not m: continue
        try:
            auth = json.loads(m.group(1))
        except Exception as e:
            found.setdefault('<파싱 실패>', []).append((f, s, {}, str(e)))
            continue
        found.setdefault(json.dumps(auth, sort_keys=True), []).append((f, s, auth, None))
    return found


def main():
    fail = []
    gs = groups()
    checked = 0

    for key, members in gs.items():
        for f, s, auth, err in members:
            rel = f.relative_to(ROOT)
            checked += 1
            if err:
                fail.append(f"{rel}: data-authored JSON 깨짐 — {err}"); continue

            b = Balance(); b.feed(s)
            if b.err or b.stack:
                fail.append(f"{rel}: HTML {b.err[:3]} 미닫힘{b.stack}")

            ids = sorted(re.findall(r'<h2 id="([^"]+)"', s))
            toc = sorted(re.findall(r'<li><a href="#([^"]+)"', s))
            if ids != toc:
                fail.append(f"{rel}: 목차/앵커 불일치 {sorted(set(ids) ^ set(toc))}")

            for lang, target in auth.items():
                if not (f.parent / target).exists():
                    fail.append(f"{rel}: data-authored[{lang}] → {target} 없음")

            hl = dict(re.findall(r'<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"', s))
            for lang in list(auth) + ['x-default']:
                if lang not in hl:
                    fail.append(f"{rel}: hreflang {lang} 없음")

            # 언어 전환은 상단 바의 셀렉트 하나로만 한다. 제목 아래 "다른 언어 …" 줄은 2026-09-05 에
            # 걷어냈고, 이 검사는 그게 되돌아오는 것을 막는다. 예전 검사는 "lang-alts 링크가 해석되는가"
            # 였는데, 줄을 전부 지우고 나니 findall 이 빈 리스트라 루프가 안 돌아 **공허하게 통과**했다.
            # 없어야 하는 것은 "없는지"를 검사해야 판정이 된다.
            if 'class="lang-alts' in s:
                fail.append(f"{rel}: lang-alts 줄이 남아 있다 — 언어 전환은 상단 셀렉트 하나로만 한다")

            # 코드 창은 highlight.js 가 정의한 CodeHighlight 를 article.js 가 쓴다. 순서가 뒤집히면
            # article.js 는 조용히 아무것도 안 하고 코드 블록이 예전 모습 그대로 남는다.
            i_hl, i_art = s.find('assets/highlight.js'), s.find('assets/article.js')
            if i_art >= 0 and not (0 <= i_hl < i_art):
                fail.append(f"{rel}: highlight.js 가 article.js 보다 앞이 아니다")

            # table-scroll 은 래퍼·힌트·뷰포트가 1:1:1 이어야 한다. 손으로 쓰다 뷰포트를 두 번 연
            # 실수가 두 번 나왔고, 그때 HTML 균형 검사는 통과했다(속성 안에 </div> 가 들어가 파서가
            # 텍스트로 읽었다). 개수 비교는 그 형태를 잡는다.
            n_wrap = len(re.findall(r'class="table-scroll"', s))
            n_hint = len(re.findall(r'class="table-scroll-hint"', s))
            n_view = len(re.findall(r'class="table-scroll-viewport"', s))
            if not (n_wrap == n_hint == n_view):
                fail.append(f"{rel}: table-scroll 짝이 안 맞는다 — 래퍼 {n_wrap} · 힌트 {n_hint} · 뷰포트 {n_view}")

            i_lang, i_el = s.find('assets/lang.js'), s.find('translate_a/element.js')
            if not (0 <= i_lang < i_el):
                fail.append(f"{rel}: lang.js 가 element.js 보다 앞이 아니다")
            if 'function googleTranslateElementInit' in s:
                fail.append(f"{rel}: 인라인 googleTranslateElementInit 잔재")

            m = re.search(r'<html lang="([^"]+)"', s)
            lang = m.group(1) if m else None
            if lang not in LOCALE:
                fail.append(f"{rel}: <html lang> 이 {lang}")
            elif f'content="{LOCALE[lang]}"' not in s:
                fail.append(f"{rel}: og:locale 이 {LOCALE[lang]} 아님")

        # 묶음 안의 모든 언어판이 실제로 존재하는지
        if members and members[0][2]:
            langs = set(members[0][2])
            present = {re.search(r'<html lang="([^"]+)"', s).group(1)
                       for _, s, _, _ in members if re.search(r'<html lang="([^"]+)"', s)}
            if langs != present:
                fail.append(f"묶음 {sorted(langs)}: 실제 페이지는 {sorted(present)} — data-authored 와 불일치")

    if checked == 0:
        print("FATAL: data-authored 를 가진 페이지가 0 개다. 검사가 아무것도 안 봤다.", file=sys.stderr)
        return 2
    if fail:
        print(f"실패 {len(fail)} 건 (페이지 {checked} 개 검사)", file=sys.stderr)
        for x in fail: print("  -", x, file=sys.stderr)
        return 1
    print(f"통과 — 페이지 {checked} 개, 묶음 {len(gs)} 개")
    return 0


if __name__ == '__main__':
    sys.exit(main())
