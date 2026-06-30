# Kwanghun Lee GitHub Pages Site

이 폴더를 `lkhun9311.github.io` 저장소 루트에 복사하면 됩니다.

## 구조

```text
lkhun9311.github.io/
├── index.html
├── assets/
│   └── styles.css
├── writing/
│   ├── index.html
│   ├── gpu-node-readiness.html
│   ├── gpu-quota-control-plane.html
│   ├── iaas-backend-performance.html
│   └── tags/
└── notes/
    ├── index.html
    ├── engineering.html
    ├── study-reading.html
    └── tags/
```

## 적용 명령어 예시

```bash
cd ~/Desktop/blog/lkhun9311.github.io

# 압축을 푼 뒤, 생성된 파일을 저장소 루트로 복사
cp -r /path/to/lkhun9311_github_pages_site/* .

git status
git add index.html assets writing notes
git commit -m "Update homepage and add writing notes pages"
git push origin main
```

## 수정할 부분

- `index.html` 안의 LinkedIn 링크 `href="#"`를 실제 LinkedIn URL로 교체하세요.
- CV PDF가 준비되면 `Download Full CV (PDF)`의 `href="#"`를 PDF 경로로 교체하세요.
- 글이 완성되면 writing/notes 하위 HTML의 본문을 실제 내용으로 교체하세요.
