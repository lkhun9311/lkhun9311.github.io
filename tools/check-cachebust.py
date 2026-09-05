#!/usr/bin/env python3
"""자산 URL 의 `?v=` 토큰이 **파일 내용과 일치하는지** 검사한다.

왜 필요한가
-----------
2026-09-06 에 `assets/styles.css` 를 여섯 번 고치는 동안 모든 페이지가 계속
`styles.css?v=20260817-icons` 를 가리켰다. 서버는 새 파일을 주는데 브라우저는 같은 URL 을
캐시에서 꺼내 쓰므로, **배포는 됐는데 화면은 안 바뀌는** 상태가 된다. 배포 실패와 구분되지
않아서 원인을 찾는 데 시간이 든다.

손으로 올리는 날짜 토큰은 잊는다. 그래서 토큰을 **내용 해시**로 두고, 파일이 바뀌면 검사가
빨간불이 나게 한다. 고치는 것은 `--fix` 가 한다.

검사한 참조가 0 개여도 실패다(조용히 통과 금지).
"""
import hashlib, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
REF = re.compile(r'((?:\.{1,2}/)*assets/[A-Za-z0-9_.-]+\.(?:css|js))\?v=([A-Za-z0-9_.-]+)')


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()[:10]


def main(fix=False):
    pages = sorted(ROOT.rglob('*.html'))
    checked = 0
    stale = []
    missing = []
    changed_files = 0

    for page in pages:
        text = page.read_text(encoding='utf-8')
        out = []
        last = 0
        dirty = False
        for m in REF.finditer(text):
            rel, token = m.group(1), m.group(2)
            target = (page.parent / rel).resolve()
            if not target.exists():
                missing.append(f"{page.relative_to(ROOT)}: {rel} 없음")
                continue
            checked += 1
            want = digest(target)
            if token == want:
                continue
            stale.append(f"{page.relative_to(ROOT)}: {rel} ?v={token} → {want}")
            if fix:
                out.append(text[last:m.start(2)])
                out.append(want)
                last = m.end(2)
                dirty = True
        if fix and dirty:
            out.append(text[last:])
            page.write_text(''.join(out), encoding='utf-8')
            changed_files += 1

    if checked == 0:
        print("FATAL: 검사한 자산 참조가 0 개다. 검사가 아무것도 안 봤다.", file=sys.stderr)
        return 2
    if missing:
        print(f"실패 {len(missing)} 건 — 가리키는 파일이 없다", file=sys.stderr)
        for x in missing:
            print("  -", x, file=sys.stderr)
        return 1
    if fix:
        print(f"갱신 — 페이지 {changed_files} 개, 참조 {len(stale)} 건 (전체 {checked} 건 검사)")
        return 0
    if stale:
        print(f"실패 {len(stale)} 건 — 토큰이 파일 내용과 다르다 (전체 {checked} 건 검사)", file=sys.stderr)
        print("  파일을 고치고 토큰을 안 올리면 브라우저가 예전 것을 계속 쓴다.", file=sys.stderr)
        print("  고치려면: python3 tools/check-cachebust.py --fix", file=sys.stderr)
        for x in stale[:12]:
            print("  -", x, file=sys.stderr)
        if len(stale) > 12:
            print(f"  … 외 {len(stale) - 12} 건", file=sys.stderr)
        return 1
    print(f"통과 — 자산 참조 {checked} 건이 파일 내용과 일치")
    return 0


if __name__ == '__main__':
    sys.exit(main(fix='--fix' in sys.argv[1:]))
