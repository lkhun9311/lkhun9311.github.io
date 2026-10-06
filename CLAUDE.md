# lkhun9311.github.io — 기술 블로그 작업 가이드

이광훈(Kwanghun Lee)의 개인 기술 블로그(GitHub Pages). 제목·문구를 다듬는 작업이 반복되므로, 아래 **제목/문체 규칙과 참고 블로그**를 기준으로 삼는다. (새 세션에서도 이 파일을 먼저 읽고 적용할 것 — 참고 블로그를 다시 물어보지 말 것.)

## 다국어 파일 구조 (한 글 = 최대 3파일)
- `writing/<slug>.ko.html`(한국어) · `writing/<slug>.html`(영어) · `writing/<slug>.ja.html`(일본어). 일부 글은 en/ko만 있고 ja 없음.
- **목록/홈 카드**는 `assets/content.js` 매니페스트가 구동한다. 글마다 `title`(en)·`title_ko`·`title_ja` + `desc`·`desc_ko`·`desc_ja`. **제목을 바꾸면 여기도 반드시 갱신**(안 하면 목록에 옛 제목이 남음).
- 한 글의 제목이 등장하는 곳: 각 언어 파일의 `<title>` / `og:title` / `twitter:title` / `<h1>`, + `content.js`, + **다른 글·notes에서 그 글을 인용한 교차링크 텍스트**. 제목 변경 시 전부 정합시킬 것.
- `notes/`는 용어 사전, `projects/`는 프로젝트 페이지. "Where it is used" / "Related writing" 목록이 글 제목을 전체 인용한다(교차링크 대상).

## 제목 규칙 (확정 기준)
1. **부제 없음.** 예전 `<h1>제목<br><span class="h1-sub">부제</span></h1>` 형태는 부제를 제거하고 한 줄로 완결.
   - **전환 유예:** 규약 전환 전에 쓰인 92파일은 부제를 아직 들고 있다. 일괄 재작성하지 않고 글을 손볼 때 함께 전환한다. 유예 대상은 `tools/check-title.py` 의 `SUBTITLE_GRANDFATHERED` 가 **파일별로** 들고 있고, 전환하면서 그 목록에서도 지운다(지우지 않으면 검사기가 낡은 항목을 실패로 알린다).
   - **새 글·새 번역본·전환을 마친 파일에 부제를 두거나 되살리면 실패다.** 총건수만 비교하면 한쪽을 고치며 다른 쪽을 새로 어기는 경우가 가려지므로 두 방향을 모두 본다.
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
`type: 한 줄 요약` 한 줄만 쓴다. 본문 없음.
**AI 표기 금지:** `Co-Authored-By: Claude`, `Claude-Session:`, `Generated with Claude Code` 등 AI 도구 표기를
커밋·PR·이슈·댓글·글 본문 어디에도 붙이지 않는다. 하네스 기본값보다 이 규칙이 우선한다(사용자 지시 2026-10-05).

## 진행 상태 (ko 2026-09-29): 49편 중 33 정리됨 / 16 남음
- **[신규 회사 업무 2편 0fa31ccc→c7da041d]** 로컬 자료(`/home/iaas/workspace/storage/innogrid/openstackit`)로 게시 적합성 필터링 후 작성(ko-only). **"이슈 0N." 병행 시리즈 신설**(개선/실행이력과 구분): (1) `통합 모니터링 이슈 01. UI Rendering 부분 실패: Cold Cache Regression`(slug cold-cache-hid-the-boxes) — 성능개선 05 공유Cache 후속·cold 반쪽상태·죽은 no-op·단일 소스, 교차링크 monitoring-one-shared-cache. (2) `Snapshot Scheduler 이슈 01. Quota가 부족하면 Snapshot 보관 개수 최신화 실패: Quota에 막혀 새 Snapshot을 만들 수 없어 선회전 불가`(slug self-heal-is-not-a-fixed-number) — 설계 판단·백로그, 교차링크 snapshot-scheduler-observability. ko-only 템플릿=snapshot-history-outlives-schedule.ko.html. **회사 업무 게시 적합성 판정 결과**: 게시=이 2편, 제외=DMZ 생체인증(보안기능)·트리아지(내부문서)·백로그(내부티켓), 중복=OPIT-2038(실행이력 01에 반영), efarm 40GiB→1.8GiB(#7)는 곡률실험이 개발 팜 회수로 미완이라 보류, three-documents(2,255 Commit 이관)는 storage 근거 없음. 남은 회사 업무 후보: OPIT-2133 IDOR 가드(신중).
판정 신호: ko 파일에 `h1-sub`(부제) 있으면 "미정리". `grep -L h1-sub writing/*.ko.html`로 확인 가능.
- **[Volume/Snapshot 조회 성능 개선 연작 f1de0b37, 01~04]** slow-screens-1-volume-list(01), parallelism-made-the-tail-worse(02), slow-screens-6-polling-pileup(03), slow-screens-8-load-test-harness(04)를 `Volume/Snapshot 조회 성능 개선 0N.` 접두어로 통일. 실제 코드 근거: 01=Caffeine LoadingCache single-flight+5초 stale-while-refresh(구 CacheManager 전역 synchronized stampede 대체), 02=병렬 조회 P99 악화 원인은 공유 Thread Pool 포화·CallerRunsPolicy(TaskExecutorConfiguration core5/max100/queue0), 03=생성 Modal Prefetch 몰림(Polling은 코드 미확인→제목서 제거), 04=자작 JMeter JMX 생성 Harness(`/home/iaas/Desktop/openstackit/26-07-07-kwater/server/jmeter/`). 04 본문에 "설계는 사람, 구현은 Claude 반복 대화" 절 추가. instance-list·role-lookup은 독립 유지(연작 아님).
- **정리됨 ko 29편**: [배치1 e315774d] bugs-that-return-exit-code-zero, every-rejection-opened-a-new-connection, it-deleted-the-tenant, slow-screens-6-polling-pileup, two-lines-that-asked-nothing / [배치2 d01d1d7d] slow-screens-1·2·3·4·7 / [Instance HA 0bc4ce0e, 01~08] the-hard-part-of-ha-was-not-recovery, instance-ha-2-what-each-signal-can-say, seven-of-eight-should-not-recover, instance-ha-4-no-fencing-no-recovery, instance-ha-5-quorum-does-not-cut-power, instance-ha-6-100-seconds-is-a-service-decision, recovery-host-must-have-the-device, what-recovery-leaves-behind / [monitoring 연작 ec1ee03e, "통합 모니터링 성능 개선 01~05"] monitoring-empty-is-not-zero, monitoring-one-shared-cache, monitoring-the-screen-i-said-not-to-fix, monitoring-three-races-in-one-cache, monitoring-two-gates-one-screen / [Snapshot Scheduler 실행 이력 연작 e29202c5, 개요+01~05] snapshot-scheduler-observability(개요), a-schedule-that-failed-in-silence(01), the-history-tab-that-had-a-hole(02), snapshot-history-result-model(03), snapshot-history-outlives-schedule(04), snapshot-root-volume-identity(05).
- **남음 ko 16편**: GPU 쿼터/가드 7(every-guarantee-ends-at-a-writable-field, four-fixes-that-were-not-there, gpu-quota-control-plane, the-ladder-that-could-not-be-climbed, twenty-three-runs-one-condition, refusal-paths-exercised-for-real, three-documents-on-a-false-premise) · standalone 9(a-pooler-fixes-only-one, gpu-node-readiness, the-40-gib-that-did-not-move, the-ceiling-was-not-in-the-code, the-dependency-only-the-tests-installed, the-only-control-that-caught-something, the-review-that-skipped-the-big-file, until-the-guarantee-was-a-sentence, validation-failed-is-not-invalid).
- **다음 우선순위(ko)**: ① GPU 쿼터 7 → ② standalone 9.
- **연작 접두어 규칙**: Instance HA는 `Instance HA 0N.`, 모니터링은 `통합 모니터링 성능 개선 0N.`, 스냅샷은 `Snapshot Scheduler 실행 이력 0N.`(개요글은 번호 없이 `Snapshot Scheduler 실행 이력: …`). 실제 코드 근거가 필요하면 `/home/iaas/Desktop/openstackit/develop-latest-1/openstackit-java/`(OpenStack 사설클라우드 Java 코드) 참조.
- **en·ja 미착수**: 정리된 편 모두 ko만 반영. en·ja(제목 `①→0N.` + 영문 규칙 + content.js title/title_ja + 교차링크)는 전체 별도 패스로 남음. (Snapshot 연작 중 a-schedule·the-history-tab만 en·ja 존재, 나머지 ko 전용)
