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
7. **강조는 대괄호 `[]` (남용 금지, 저자 결정).** 볼드 대신 `[]`를 쓰되 **기본은 미사용**이다. 강조가 꼭 필요하고 문맥상 자연스러울 때만 핵심어 하나에 쓴다(예: `[Down]`). 어색하면 쓰지 않는다. 리터럴 라벨은 `[]`(예: [잔여 없음]). 쓸지 말지는 저자가 편별로 판단.
8. **질문 종결은 `~까/~ㄹ까/~일까`**를 쓰고 물음표(`?`)는 붙이지 않는다(예: "판정할까", "하나뿐일까"). "A가 아니라 B" 같은 상투적(AI투) 대비 구문은 피한다.

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

## 진행 상태 (ko 전수조사 2026-09-22): 47편 중 18 정리됨 / 29 남음
판정 신호: ko 파일에 `h1-sub`(부제) 있으면 "미정리". `grep -L h1-sub writing/*.ko.html`로 확인 가능.
- **정리됨 ko 18편**: [배치1 e315774d] bugs-that-return-exit-code-zero, every-rejection-opened-a-new-connection, it-deleted-the-tenant, slow-screens-6-polling-pileup, two-lines-that-asked-nothing / [배치2 d01d1d7d] slow-screens-1·2·3·4·7 / [Instance HA 0bc4ce0e] the-hard-part-of-ha-was-not-recovery(1), instance-ha-2-what-each-signal-can-say(2), seven-of-eight-should-not-recover(3), instance-ha-4-no-fencing-no-recovery(4), instance-ha-5-quorum-does-not-cut-power(5), instance-ha-6-100-seconds-is-a-service-decision(6), recovery-host-must-have-the-device(7), what-recovery-leaves-behind(8).
- **남음 ko 29편**: monitoring 연작 5(empty-is-not-zero, one-shared-cache, the-screen-i-said-not-to-fix, three-races-in-one-cache, two-gates-one-screen) · snapshot 연작 6(history-outlives-schedule, history-result-model, root-volume-identity, scheduler-observability, a-schedule-that-failed-in-silence, the-history-tab-that-had-a-hole) · slow-screens 잔여 2(slow-screens-8-load-test-harness, parallelism-made-the-tail-worse) · GPU 쿼터/가드 7(every-guarantee-ends-at-a-writable-field, four-fixes-that-were-not-there, gpu-quota-control-plane, the-ladder-that-could-not-be-climbed, twenty-three-runs-one-condition, refusal-paths-exercised-for-real, three-documents-on-a-false-premise) · standalone 9(a-pooler-fixes-only-one, gpu-node-readiness, the-40-gib-that-did-not-move, the-ceiling-was-not-in-the-code, the-dependency-only-the-tests-installed, the-only-control-that-caught-something, the-review-that-skipped-the-big-file, until-the-guarantee-was-a-sentence, validation-failed-is-not-invalid).
- **다음 우선순위(ko)**: ① monitoring 연작 5 → ② snapshot 6 → ③ slow-8·parallelism → ④ GPU 쿼터 7 → ⑤ standalone 9.
- **en·ja 미착수**: 정리된 18편 모두 ko만 반영. en·ja(제목 `①→N.` + 영문 규칙 + content.js title/title_ja + 교차링크)는 전체 별도 패스로 남음.
