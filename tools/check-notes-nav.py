#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""용어 나무가 노트 파일과 어긋나지 않았는지 본다.

`NOTES_NAV` 는 손으로 쓰는 것이 아니라 `tools/build-notes-nav.py` 가 파일에서 굽는다.
절을 하나 넣거나 빼고 다시 굽지 않으면 왼쪽 나무가 **없는 절을 가리키거나 있는 절을 빠뜨린다.**
링크는 멀쩡히 열리고 글자만 거짓말을 하므로 `check-links` 로는 안 잡힌다.

검사기와 생성기가 **같은 코드**를 쓴다 — 「생성기는 이렇게 굽는데 검사기는 저렇게 본다」를 막는다.
"""
import runpy
import sys


def main():
    mod = runpy.run_path("tools/build-notes-nav.py", run_name="__notcheck__")
    sys.argv = ["build-notes-nav.py", "--check"]
    return mod["main"]()


if __name__ == "__main__":
    sys.exit(main())
