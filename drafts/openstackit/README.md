# OpenStack 기반 IaaS 엔지니어링 기록

> 상태: 비공개 초안 모음  
> 작성 기준일: 2026-09-10  
> 공개 등록: 하지 않음

운영 이슈와 개발 기록을 기술 주제별로 다시 쓴 초안이다. 고객명, 사내 시스템명, 주소, 계정, 저장소 경로, 티켓 번호와 실제 클래스명은 제거했다. 코드가 필요한 글도 제품 코드를 복제하지 않고 의사코드와 일반화된 이름만 사용한다.

## 초안 목록

1. [SQL 버킷을 없애자 메뉴 트리의 깊이 제한도 사라졌다](01-unbounded-menu-tree.md)
2. [버전 업그레이드는 바이너리 교체가 아니라 데이터 보존 문제다](02-upgrade-is-data-migration.md)
3. [가속기 서비스를 붙이기 전에 조사 기준부터 만든 이유](03-accelerator-integration-investigation.md)
4. [스냅샷 스케줄러를 설명하며 드러난 제품의 진짜 계약](04-snapshot-scheduler-demo-qna.md)
5. [CSP를 풀지 않고 교차 오리진 로그아웃을 고친 방법](05-cross-origin-sso-logout.md)
6. [요구사항을 받자마자 코딩하지 않는 법](06-requirement-triage.md)
7. [애플리케이션 자격증명에 RBAC를 붙일 때의 경계](07-application-credential-rbac.md)
8. [두 인증 방식에 하나의 세션 정책을 강요하면 생기는 일](08-auth-strategy-session-policy.md)
9. [상류 인증 장애를 조용한 로그아웃으로 만들지 않기](09-upstream-instability-forced-logout.md)
10. [60초 토큰이 인증 의존점을 장애 증폭기로 만든 과정](10-auth-spof-timeline.md)
11. [72개의 메뉴 숨김 규칙을 프론트엔드에서 데이터로 옮기기](11-menu-visibility-data-policy.md)
12. [서버 데이터는 최신인데 버튼은 비활성인 이유](12-volume-group-stale-selection.md)
13. [스케줄러가 실행됐다는 로그만 믿으면 안 되는 이유](13-scheduler-stale-metadata.md)
14. [쿼터 실패를 상태와 이력으로 바꾸는 스케줄러 설계](14-snapshot-quota-observability.md)
15. [사용자가 기다린 것은 REST가 아니라 SSE의 첫 데이터였다](15-dashboard-serve-stale.md)
16. [물리 노드 모니터링에서 빈 배열은 성공이 아니었다](16-node-last-known-good.md)
17. [가상자원 화면은 두 개의 병목을 모두 없애야 빨라졌다](17-instance-quota-n-plus-one.md)
18. [세 개의 serve-stale 캐시를 하나로 합치며 다시 배운 공유 상태의 의미](18-shared-cache-semantics.md)
19. [배치 로그를 사용자에게 보여 준다고 실행 이력이 되지는 않는다](19-snapshot-run-history.md)
20. [성능 개선 연재를 만드는 측정 자료 구성법](20-monitoring-performance-series-notes.md)
21. [운영 기록에서 재사용 가능한 여섯 가지 기술 노트](21-engineering-note-candidates.md)

## 공개 전 공통 점검

- 수치가 특정 고객 환경을 식별하지 않는지 다시 확인한다.
- 실제 URL, IP, 사용자 식별자, 설정 키와 로그의 요청 ID를 넣지 않는다.
- 제품 소스 대신 최소 의사코드만 사용한다.
- “원인 확정”과 “가능성”을 구분하고, 실측 조건과 표본 수를 함께 적는다.
- 이미 공개된 글과 겹치면 새 글 대신 기존 글의 개정 재료로 사용한다.
