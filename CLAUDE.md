# lkhun9311.github.io — 기술 블로그 작업 가이드

이광훈(Kwanghun Lee)의 개인 기술 블로그(GitHub Pages). 제목·문구를 다듬는 작업이 반복되므로, 아래 **제목/문체 규칙과 참고 블로그**를 기준으로 삼는다. (새 세션에서도 이 파일을 먼저 읽고 적용할 것 — 참고 블로그를 다시 물어보지 말 것.)

## 다국어 파일 구조 (한 글 = 최대 3파일)
- `writing/<slug>.ko.html`(한국어) · `writing/<slug>.html`(영어) · `writing/<slug>.ja.html`(일본어). 일부 글은 en/ko만 있고 ja 없음.
- **목록/홈 카드**는 `assets/content.js` 매니페스트가 구동한다. 글마다 `title`(en)·`title_ko`·`title_ja` + `desc`·`desc_ko`·`desc_ja`. **제목을 바꾸면 여기도 반드시 갱신**(안 하면 목록에 옛 제목이 남음).
- 한 글의 제목이 등장하는 곳: 각 언어 파일의 `<title>` / `og:title` / `twitter:title` / `<h1>`, + `content.js`, + **다른 글·notes에서 그 글을 인용한 교차링크 텍스트**. 제목 변경 시 전부 정합시킬 것.
- `notes/`는 용어 사전, `projects/`는 프로젝트 페이지. "Where it is used" / "Related writing" 목록이 글 제목을 전체 인용한다(교차링크 대상).

## 제목 규칙 (확정 기준)
1. **부제 없음.** 예전 `<h1>제목<br><span class="h1-sub">부제</span></h1>` 형태는 부제를 제거하고 한 줄로 완결.
2. **영어인 용어는 영문으로 표기.** 발음이 외래어이거나 원래 영어인 기술어는 한글 음차 금지: 노드→Node, 스위치→Switch, 프로세스→Process, 펜싱→Fencing, 호스트→Host, 스케줄러→Scheduler, 벤치→Benchmark, 캐시→Cache, 타임아웃→Timeout, 컨트롤러→Controller. 이미 영문인 것 유지(Quorum, evacuate, GPU Instance, HeartBeat, Probe, Compute, Keystone, Swap). **복구/신호/장애/전원/판정/자원/목록/조회/화면** 같은 한국어 일반어는 한글 유지(무리한 영어화 금지).
3. **질문형을 우선한다.** 역설·의외성이 있는 글은 질문형("~는 왜 ~했나?", "~는 어떻게 ~하나?")이 가장 잘 읽힌다. 결론이 한 마디로 딱 떨어지는 글만 **명사 종결**, 원인/정답을 붙일 땐 **콜론형**("훅: 핵심 정답"). 8편이 한 리듬으로 안 읽히게 형식을 교차.
4. **콜론(:)은 제목 내부 '정답' 연결 전용.** 연작 회차 표기는 **마침표 + 아라비아 숫자**: `Instance HA 1.` ~ `8.` (동그라미 `①` 금지, 대시 금지).
5. **사실만.** 글에 없는 수치·주장 금지. 은유·과장 금지(과거 "빨간불/red-light", "착시", "계약" 같은 표현은 걷어냄). 결과·원인 프레이밍, "궁금증 훅 → 구체 정답" 구조 선호.
6. 한국어 문법 정확 + **한 번에 읽히는 전달력**. 수식어를 2~3겹 쌓아 서술어 없이 명사로 끝나는 애매한 조각(예: "…가 만든 …의 …") 금지.

### 본문 검토 시(제목과 함께) 체크
- 음차 교정(벤치→Benchmark 등), 남은 은유 제거, 제목과 본문 용어 일관성.
- 리터럴 라벨은 제목 표기와 통일(예: 「잔여 없음」→ [잔여 없음]). "①편/앞 편/part six" 같은 연작·산문 인용은 유지.

## 참고 기술 블로그 (말투·문장 구성 기준 — 이미 확정된 목록)
- 국내: 토스 `toss.tech`(구어체·질문 후킹) · 네이버 D2 `d2.naver.com`(담백 회고, "~기/N편") · CLOVA `clova.ai/tech-blog`(시적 훅 + 콜론 기술 페이로드) · LINE/LY `engineering.linecorp.com/ko/blog`(화두:부제 균형) · 오늘의집 `bucketplace.com/culture/Tech`("#2. 소제목") · 당근(질문형 강함) · `velopers.kr`.
- 해외: AWS `aws.amazon.com/blogs`(How [Company] …) · NVIDIA `developer.nvidia.com/blog`(명령형 튜토리얼, 제품·버전) · OpenAI `developers.openai.com/blog`(How/gerund + 제품명) · Anthropic(How we…/effective) · Google Research(명명형 콜론) · Waymo/Tesla(개념 명사 + 콜론, "From X to Y").
- 공통 교훈: 완결 문장/질문형, 문장 케이스(영어), 고유명사 1개, 콜론 부제로 시리즈·범위, 순번은 "Part 1"/"N." 표기, 영어 기술어는 원어 표기.

## 작업 워크플로 (배치 단위)
연작 또는 5편 단위로: **① 제목·형태(부제 제거)** → **② 본문 상세 검토(은유·음차·단어)** → **③ ko·en·ja 반영 + `content.js`(title_x·desc_x) + 교차링크 정합** → **④ codex 문법·전달력 검토** → **⑤ 커밋·푸시**. ("한국어만 우선"처럼 ko 먼저 갈 수 있음 — 그땐 en/ja는 다음 패스.)

### codex 검토 (제목/문장 QA 게이트)
비대화 실행: 프롬프트를 파일로 만들고
```bash
codex exec --skip-git-repo-check -c sandbox_mode=read-only - < prompt.md
```
codex에 사실 요약 + 후보안 + 위 규칙을 주고, 편별 최선안·형식·이유를 받는다. 파일 수정은 시키지 말 것(제목 문구만 검토).

### 커밋 메시지
한국어, 무엇을·왜 요약. 끝에:
`Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

## 진행 상태 (2026-09-22 기준)
- **배치1 완료**(커밋 e315774d): bugs-that-return-exit-code-zero / every-rejection-opened-a-new-connection / it-deleted-the-tenant / slow-screens-6-polling-pileup / two-lines-that-asked-nothing — ko·en·ja 제목·부제·description + content.js + 교차링크.
- **배치2 ko 완료**(커밋 d01d1d7d): slow-screens 1·2·3·4·7 ko 제목(codex 문장형). en·ja 미반영(다음 패스).
- **Instance HA 1~8 제목**: 질문형 우선·영어 용어 영문화로 codex 확정안 도출됨. 아직 파일 미반영(확정 대기). 슬러그: 1=the-hard-part-of-ha-was-not-recovery, 2=instance-ha-2-what-each-signal-can-say, 3=seven-of-eight-should-not-recover, 4=instance-ha-4-no-fencing-no-recovery, 5=instance-ha-5-quorum-does-not-cut-power, 6=instance-ha-6-100-seconds-is-a-service-decision, 7=recovery-host-must-have-the-device, 8=what-recovery-leaves-behind.
- 남은 일: 배치2 en·ja, slow-screens 8, monitoring 연작, 그리고 전 연작 회차표기 `①→N.` 통일.
