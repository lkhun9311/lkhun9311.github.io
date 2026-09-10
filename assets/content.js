/* ============================================================
   Single source of truth for News, Projects, Writing & Notes.

   ► Add an entry to the relevant section below and it shows up on
     the Home page (capped at 5) and on that section's own index
     page (full list), kept in sync automatically.

   ► Tags are derived from each item's `tags` array (sorted by name).
     Adding a #keyword to an item auto-adds its filter button.

   Sorting: newest first (by `date`); ties broken by name (A→Z).
   ============================================================ */
(function () {
  "use strict";

  var BASE = window.CONTENT_BASE || ""; // "" on home, "../" on subpages

  /* 카드의 언어. `i18n.js` 가 먼저 실려서 이번 로드의 언어를 정해 둔다(없으면 영어).
     ⚠️ 카드 제목에는 `notranslate` 가 붙어 있다 — 고유명사가 뭉개지지 말라고 붙인 것인데,
     그 탓에 **한국어 독자에게 제목만 영어로 남아 있었다.** 위젯으로는 고칠 수 없고,
     항목마다 `title_ko`·`desc_ja` 를 두어야 고쳐진다. */
  var LANG = (window.I18N && window.I18N.lang) || null;

  function tr(key, fallback) {
    var v = window.I18N ? window.I18N.t(key, LANG) : null;
    return v === null || v === undefined ? fallback : v;
  }

  /* 항목의 필드를 언어에 맞게 고른다. 번역이 없으면 영어가 남는다 — 카드가 비는 것보다 낫다. */
  function f(it, field) {
    return window.I18N ? window.I18N.pick(it, field, LANG) : (it[field] || "");
  }

  /* 되풀이되는 짧은 라벨은 항목마다 번역하지 않는다. 세 군데에 같은 「Commercial project」가 있는데
     항목마다 `sourceLabel_ko` 를 달면 곧 그중 하나만 고쳐지는 날이 온다. */
  var LABEL_KEY = {
    "Commercial project": "cards.commercial", "Commercial Project": "cards.commercial",
    "Company Work": "cards.company", "Company work": "cards.company",
    "Main Project": "cards.main", "Solo": "cards.solo", "Company": "cards.companyAuthor",
    "Personal project": "cards.personal"
  };

  function trLabel(v) {
    return LABEL_KEY[v] ? tr(LABEL_KEY[v], v) : v;
  }

  /* 날짜는 항목에 적지 않고 **만든다.** `dateLabel` 을 언어마다 손으로 적으면 20개가 넘고,
     그중 하나만 안 고쳐진 날이 반드시 온다. `date` 는 이미 `2026-09` 또는 `2026-09-05` 형식이다. */
  var MONTH_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  function dateLabel(it) {
    var parts = String(it.date || "").split("-");
    var y = +parts[0], m = +parts[1], d = parts.length > 2 ? +parts[2] : 0;
    if (!y || !m) return it.dateLabel || "";
    if (LANG === "ko") return d ? y + "년 " + m + "월 " + d + "일" : y + "년 " + m + "월";
    if (LANG === "ja") return d ? y + "年" + m + "月" + d + "日" : y + "年" + m + "月";
    return it.dateLabel || (MONTH_EN[m - 1] + (d ? " " + d + "," : "") + " " + y);
  }

  var DATA = {
    /* 「무엇을 하고 있다」가 아니라 **무엇을 냈고 무엇을 고쳤는지** 적는다. 앞의 형태로는
       2월에 멈춘 세 줄이 9월의 발행과 정정을 하나도 보여 주지 못했다. */
    news: {
      items: [
        { date: "2026-09-07", dateLabel: "Sep 7, 2026",
          text: "Korean, English and Japanese are now written, not machine-translated: the menus, the section pages and every card carry authored text.",
          text_ko: "한국어 · 영어 · 일본어를 기계번역이 아니라 손으로 씁니다. 메뉴와 목록 페이지, 카드 문구까지 사람이 쓴 문장으로 바뀌었습니다.",
          text_ja: "韓国語・英語・日本語を機械翻訳ではなく人が書きます。メニューと一覧ページ、カードの文言まで書き下ろしに変えました。" },
        { date: "2026-09-06", dateLabel: "Sep 6, 2026",
          text: "Published “The Throughput Ceiling Was Not in the Code” in three languages. The limit was a default of five connections per host in a library the AWS SDK pulled in.",
          text_ko: "「처리량 상한은 코드에 없었습니다」를 세 언어로 냈습니다. 상한은 AWS SDK가 끌고 온 라이브러리의 「호스트당 5」 기본값이었습니다.",
          text_ja: "「スループットの上限はコードになかった」を三言語で公開しました。上限は AWS SDK が引き連れてきたライブラリの「ホストあたり5」という既定値でした。" },
        { date: "2026-09-05", dateLabel: "Sep 5, 2026",
          text: "Corrected the connection-exhaustion article: the claims without numbers were replaced with harness measurements, and what is still unmeasured is now said so.",
          text_ko: "connection 고갈 글을 정정했습니다. 수치 없이 하던 주장을 harness 실측으로 바꾸고 아직 재지 않은 것은 재지 않았다고 적었습니다.",
          text_ja: "connection 枯渇の記事を訂正しました。数字のない主張を harness の実測に置き換え、まだ測っていないものは測っていないと書きました。" },
        { date: "2026-02-06", dateLabel: "Feb 6, 2026",
          text: "Started building a Kubernetes-native GPUaaS platform control plane.",
          text_ko: "Kubernetes 기반 GPUaaS 플랫폼 control plane를 만들기 시작했습니다.",
          text_ja: "Kubernetes ネイティブな GPUaaS プラットフォームのコントロールプレーンを作り始めました。" },
        { date: "2026-02-01", dateLabel: "Feb 1, 2026",
          text: "Built this technical homepage with GitHub Pages.",
          text_ko: "이 기술 홈페이지를 GitHub Pages로 만들었습니다.",
          text_ja: "この技術ホームページを GitHub Pages で作りました。" }
      ]
    },

    projects: {
      /* Writing 과 같은 축으로 나눈다 — 섹션마다 기준이 달라지면 왼쪽 레일을 매번 다시 배운다. */
      tagGroups: {
        "Area": ["GPU", "Kubernetes", "Backend", "Postgres", "IaaS", "Control Plane"],
        "Perspective": ["Operations", "Privacy"]
      },
      items: [
        {
          label: "Commercial Project",
          title: "Social Polling Platform: Anonymous Voting and Published Aggregates",
          title_ko: "소셜 투표 플랫폼: 익명 투표와 공개되는 집계",
          title_ja: "ソーシャル投票プラットフォーム: 匿名投票と公開される集計",
          authors: "Solo",
          date: "2026-09-05",
          dateLabel: "Sep 5, 2026",
          private: true,
          desc: "A Kotlin and Spring Boot service where people post a question, others vote anonymously, and the results are published as aggregates \u2014 totals, per-option counts, demographic axes and a trend over time. Min-n suppression and rounded shares narrow what a published change can reveal; the guarantee is written down as a sentence, and so are its limits, since small samples can still be identifiable. Pre-launch work covered transaction boundaries, the connection budget, and a moderation gate that runs outside the transaction.",
          desc_ko: "질문을 올리면 다른 사람들이 익명으로 투표하고 결과는 집계로 공개되는 Kotlin · Spring Boot 서비스입니다. 총계 · 선택지별 수 · 인구 축 · 시간 추이를 냅니다. 최소 표본 억제와 반올림으로 공개된 변화가 드러내는 것을 좁혔고 보장선을 문장으로 적어 두되 그 한계도 같이 적었습니다. 표본이 작으면 식별 가능성이 남기 때문입니다. 출시 전에는 transaction 경계와 connection 예산, transaction 밖에서 도는 모더레이션 게이트를 다뤘습니다.",
          desc_ja: "質問を投稿すると他の人が匿名で投票し、結果は集計として公開される Kotlin・Spring Boot のサービスです。総数・選択肢ごとの数・人口軸・時間推移を出します。最小標本の抑制と丸めで公開された変化が明かすものを狭め、保証線を文として書き、その限界も併記しました。標本が小さければ識別可能性は残るからです。公開前は transaction の境界と connection の予算、transaction の外で回るモデレーションゲートを扱いました。",

          tags: ["Backend", "Privacy", "Postgres"],
          stacks: [["Kotlin", "kotlin"], ["Spring Boot", "spring"], ["PostgreSQL", "postgres"], ["Flyway", "flyway"], ["Operations", "operations"]]
        },
        {
          label: "Main Project",
          title: "GPUaaS Platform Control Plane: Kubernetes-native AI Infrastructure",
          title_ko: "GPUaaS 플랫폼 control plane: Kubernetes 기반 AI 인프라",
          title_ja: "GPUaaS プラットフォームのコントロールプレーン: Kubernetes ネイティブな AI インフラ",
          authors: "Solo",
          date: "2026-02-06",
          dateLabel: "Feb 6, 2026",
          url: "projects/gpuaas-control-plane.html",
            github: "https://github.com/lkhun9311/gpu-platform-control-plane",
          desc: "A control-plane project for GPU-based AI workloads, focused on node readiness, tenant-level GPU governance, admission control, inference workload management, and operational observability.",
          desc_ko: "GPU 기반 AI 워크로드를 위한 control plane 프로젝트입니다. 노드 준비 상태, 테넌트 단위 GPU 거버넌스, 어드미션 제어, 추론 워크로드 관리, 운영 관측을 다룹니다.",
          desc_ja: "GPU ベースの AI ワークロードのためのコントロールプレーンのプロジェクトです。ノードの準備状態、テナント単位の GPU ガバナンス、アドミッション制御、推論ワークロード管理、運用の可観測性を扱います。",
          tags: ["GPU", "Kubernetes", "Control Plane"],
          stacks: [["Kubernetes", "kubernetes"], ["Python", "python"], ["Go", "go"], ["GPU", "gpu"], ["vLLM", "vllm"], ["Prometheus", "prometheus"], ["Grafana", "grafana"], ["AWS", "aws"]]
        },
        {
          label: "Company Work",
          title: "IaaS Backend Engineering: Cloud Control Plane and Operations",
          title_ko: "IaaS 백엔드 엔지니어링: 클라우드 control plane과 운영",
          title_ja: "IaaS バックエンドエンジニアリング: クラウドのコントロールプレーンと運用",
          authors: "Company",
          date: "2026-01-28",
          dateLabel: "Jan 28, 2026",
          github: "https://github.com/lkhun9311",
          desc: "Backend engineering experience across IaaS infrastructure systems, including compute, storage, identity, monitoring, automation, production troubleshooting, Linux-based operations, and operational response.",
          desc_ko: "IaaS 인프라 시스템 전반의 백엔드 엔지니어링 경험입니다. 컴퓨트 · 스토리지 · 인증 · 모니터링 · 자동화와 운영 장애 대응, 리눅스 기반 운영을 포함합니다.",
          desc_ja: "IaaS インフラ全般のバックエンドエンジニアリング経験です。コンピュート・ストレージ・認証・監視・自動化と、本番障害対応、Linux ベースの運用を含みます.",
          tags: ["IaaS", "Backend", "Operations"],
          stacks: [["Java", "java"], ["Spring Boot", "spring"], ["IaaS", "iaas"], ["OpenStack", "openstack"], ["Linux", "linux"], ["Monitoring", "monitoring"], ["Operations", "operations"]]
        }
      ]
    },

    writing: {
      /* 왼쪽 필터의 묶음. "무엇에 대한 글인가"(영역)와 "무엇을 다루는 글인가"(관점)는 고르는
         이유가 다르다 — 한 줄에 섞어 두면 열다섯 개를 매번 처음부터 읽게 된다. */
      tagGroups: {
        "Area": ["GPU", "Kubernetes", "Backend", "Postgres", "IaaS", "Control Plane"],
        "Perspective": ["Method", "Observability", "Reliability", "Performance",
                "Security", "Privacy", "Cost", "Operations", "Migration"]
      },
      items: [
        {
          title: "The Track Did Not End Until the Guarantee Was a Sentence",
          url: "writing/until-the-guarantee-was-a-sentence.html",
          title_ko: "보장선을 문장으로 쓰기 전까지 끝나지 않았다",
          desc_ko: "방어를 차원별로 짜면 차원이 늘 때 자동으로 뚫린다. min-n은 인구 축에만 걸려 있었고 시간 축은 나중에 생겼다. 잔차를 파는 데는 종료 조건이 없어서 보장선을 문장으로 쓰고 나서야 남은 일이 유한해졌다.",
          title_ja: "保証線を文にするまで、このトラックは終わらなかった",
          desc_ja: "防御を次元ごとに組むと、次元が増えた瞬間に自動で破れる。min-n は人口軸にしか掛かっておらず、時間軸は後からできた。残差を掘る作業には終了条件がなく、保証線を文にしてはじめて残りの仕事が有限になった。",
          date: "2026-09", dateLabel: "Sep 2026",
          source: "commercial", sourceLabel: "Commercial project",
          desc: "A defence written per dimension breaks the moment a dimension is added. Five tickets in, what ended the privacy track was not a sixth repair but writing the guarantee as a sentence — and computing the difference between the goal and what was already true. Also in Korean and Japanese.",
          tags: ["Privacy", "Security", "Method"]
        },
        {
          title: "The Throughput Ceiling Was Not in the Code",
          url: "writing/the-ceiling-was-not-in-the-code.html",
          title_ko: "처리량 상한은 코드에 없었습니다",
          desc_ko: "콘텐츠 검열 경로의 처리량이 6.27 req/s에서 안 올라갔습니다. 쓰기를 2배로 올려도 DB pool을 3배로 키워도 그대로였습니다. 원인은 S3를 쓰려고 넣은 AWS SDK가 끌고 들어온 HTTP 클라이언트의 기본값 5였고 그 층은 컴파일 클래스패스에 없어서 읽어서는 찾을 수 없었습니다.",
          title_ja: "スループットの上限はコードになかった",
          desc_ja: "投稿作成のスループットが 6.27 req/s から動きませんでした。書き込みスレッドを2倍にしても、DB プールを3倍にしても同じです。原因は S3 を使うために入れた AWS SDK が連れてきた HTTP クライアントの既定値「ホストあたり5」でした。この層はランタイムのクラスパスにしかなく、コードを読んでも見つかりません。",
          date: "2026-09", dateLabel: "Sep 2026",
          source: "commercial", sourceLabel: "Commercial project",
          desc: "Post creation would not go past 6.27 req/s. Twice the write threads did nothing, three times the database pool did nothing. The limit was a default of five connections per host, inside an HTTP client the AWS SDK pulled in for S3 — a layer only on the runtime classpath, which reading could never have found. Also in Korean and Japanese.",
          tags: ["Performance", "Backend", "Method"]
        },
        {
          title: "The Connection Exhaustion RDS Proxy Cannot Fix",
          url: "writing/a-pooler-fixes-only-one.html",
          title_ko: "RDS Proxy로는 못 고치는 connection 고갈",
          desc_ko: "출시 전 소셜 투표 플랫폼을 점검하다가 connection pooler를 붙이려고 했습니다. 그런데 connection 고갈에는 원인이 두 가지 있고 connection pooler는 그중 하나만 고칩니다. 왜 못 고치는지는 제품 문서가 아니라 transaction pooling의 정의에서 나옵니다.",
          title_ja: "RDS Proxy では直せないコネクション枯渇",
          desc_ja: "リリース前のソーシャル投票プラットフォームを点検していて、コネクションプーラーを前に立てようとしました。ところがコネクション枯渇には原因が二つあり、プーラーはそのうち一つしか直しません。なぜ直せないのかは製品ドキュメントではなくトランザクションプーリングの定義から出てきます。",
          date: "2026-09", dateLabel: "Sep 2026",
          source: "commercial", sourceLabel: "Commercial project",
          desc: "A pre-launch review of a social polling platform. Connection exhaustion has two causes behind one symptom and a pooler fixes only one of them \u2014 then a JMeter harness put numbers on it: an unrelated read path at 4 ms against 6,047 ms, and a second fix that halved post-create latency. Also in Korean and Japanese.",
          tags: ["Postgres", "Backend", "Method"]
        },
        {
          title: "Every Guarantee Ends at a Field the Tenant Can Write",
          url: "writing/every-guarantee-ends-at-a-writable-field.html",
          source: "side", sourceLabel: "Personal project",
          title_ko: "모든 보장은 테넌트가 쓸 수 있는 필드에서 끝난다",
          desc_ko: "같은 방식으로 뚫린 방어 4건. 전부 읽어서가 아니라 공격해서 찾았다. 검사는 자기가 읽은 것에 대해 옳았고 틀린 것은 테넌트가 쓰는 값을 테넌트에 관한 증거로 읽은 쪽이었다.",
          title_ja: "すべての保証は、テナントが書けるフィールドで終わる",
          desc_ja: "同じやり方で破られた防御が 4 件。すべて読んで見つけたのではなく攻撃して見つけた。検査は自分が読んだものについては正しく、誤っていたのはテナントが書く値をテナントについての証拠として読んだ側だった。",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "Four quota defences broken the same way, each found by attacking it. Forged ownerReferences, a self-granted exemption, a grace period the victim sets, and a reservation for Pods that can never exist. Also in Korean and Japanese.",
          tags: ["Kubernetes", "Security", "GPU"]
        },
        {
          title: "The Only Control That Has Ever Caught a Cost Error",
          url: "writing/the-only-control-that-caught-something.html",
          source: "side", sourceLabel: "Personal project",
          title_ko: "비용 오류를 잡은 통제는 예산 알람 하나뿐이었다",
          desc_ko: "개인 GPU 랩 계정의 비용 통제 기록. 손으로 만든 예산 알람 하나가 내 추정에서 통째로 빠져 있던 항목을 찾아냈고 Terraform이 그 알람을 조용히 지울 뻔했다.",
          title_ja: "コストの誤りを捕まえた統制は、予算アラート1つだけだった",
          desc_ja: "個人の GPU ラボアカウントにおけるコストとアカウント運用の記録。手で作った予算アラート 1 つが、私の見積りから丸ごと抜けていた項目を見つけた。そして Terraform がそのアラートを静かに消すところだった。",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "Several layers of cost control on a GPU lab account, and the one that caught an error in the cost itself was a hand-made budget alert Terraform nearly deleted. Also in Korean and Japanese.",
          tags: ["Cost", "Operations", "Method"]
        },
        {
          title: "It Did Not Protect the Tail. It Deleted the Tenant.",
          url: "writing/it-deleted-the-tenant.html",
          source: "side", sourceLabel: "Personal project",
          title_ko: "꼬리를 지킨 게 아니라 테넌트를 지웠다",
          desc_ko: "GPU 한 장 위의 4-arm 실험. 거절을 0건 했다는 arm이 완료 수는 프리미엄 요청 수와 정확히 같았다. 리포트의 판정이 전부 비율이라, 네 번의 유료 실행 동안 아무도 그것을 보지 못했다.",
          title_ja: "テールを守ったのではなく、テナントを消していた",
          desc_ja: "GPU 1 枚の上での 4-arm 実験。拒否 0 件だという arm の完了数が、プレミアムの要求数とぴったり同じだった。レポートの判定がすべて比だったため、4 回の有料実行の間それは見えなかった。",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "A four-arm experiment on one A10G. The arm that rejected nothing completed exactly the premium request count, and every check was a tail ratio. Also in Korean and Japanese.",
          tags: ["GPU", "Method", "Observability"]
        },
        {
          title: "Three Documents I Wrote Rested on a False Premise",
          url: "writing/three-documents-on-a-false-premise.html",
          source: "company", sourceLabel: "Company work",
          title_ko: "내가 쓴 절차서 세 편이 틀린 전제 위에 있었다",
          desc_ko: "2,255 커밋을 건너뛰는 버전 이관. 문서 추론으로는 어디서 깨질지 알 수 없어 격리 환경에 옛 버전을 세우고 한 번 깨뜨려 봤다. 그러자 내 앞선 문서 세 편의 전제가 틀렸다는 게 나왔다.",
          title_ja: "私が書いた手順書3本は誤った前提の上にあった",
          desc_ja: "2,255 コミットを飛び越えるバージョン移行。文書からの推論ではどこで壊れるか分からないので、隔離環境に旧バージョンを立てて一度壊してみた。すると私が先に書いた文書 3 本の前提が誤りだと分かった。",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "A migration across 2,255 commits. Reasoning from documents could not say where it breaks, so the old version went up in an isolated container and broke once. Also in Korean and Japanese.",
          tags: ["Migration", "Method"]
        },
        {
          title: "Seven of Eight Failures Should Not Be Recovered",
          url: "writing/seven-of-eight-should-not-recover.html",
          source: "company", sourceLabel: "Company work",
          title_ko: "여덟 가지 장애 중 일곱은 복구하지 않기로 했다",
          desc_ko: "스위치 장애로 살아 있는 컴퓨트 노드가 장애로 판정돼 복구가 대량 실행됐다. 감지를 정교하게 만드는 대신 신호에 자격을 매겼고 시나리오 여덟 중 일곱이 보류로 남았다.",
          title_ja: "8つの障害のうち7つは復旧しないと決めた",
          desc_ja: "スイッチ障害で生きているコンピュートノードが障害と判定され、復旧が大量に実行された。検知を精緻にする代わりに、どの信号が何を証言できるかを決めた。8 シナリオのうち 7 つが保留になった。",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "A switch failure made live compute nodes look dead and recovery ran at scale. Grading what each signal is entitled to testify to left seven of eight scenarios on hold. Also in Korean and Japanese.",
          tags: ["Reliability", "Method"]
        },
        {
          title: "The State I Reported as Fixed Was Not in the Commits",
          url: "writing/four-fixes-that-were-not-there.html",
          source: "side", sourceLabel: "Personal project",
          title_ko: "고쳤다고 보고한 상태가 커밋에 없었습니다",
          desc_ko: "처음으로 돈을 내고 GPU를 빌리기 직전에, 완료로 보고한 가드 4건이 코드에서는 그 모습이 아니었습니다. 셋은 과금이 계속되는 것을 막는 장치입니다. 저장소에 물어보니 넷 다 제 커밋에서 처음 들어왔는데 git은 잃어버린 편집과 하지 않은 편집을 가르지 못합니다. 나머지를 세는 스크립트를 짰더니 이번엔 판정식이 틀렸습니다.",
          title_ja: "直したと報告した状態がコミットにありませんでした",
          desc_ja: "はじめてお金を払って GPU を借りる直前に、完了と報告したガード 4 件がコードではその姿ではありませんでした。3 つは課金が続くのを止める装置です。リポジトリに聞くと 4 つとも私のコミットではじめて入っていましたが、git は失った編集と書かなかった編集を分けられません。残りを数えるスクリプトを書いたら、今度は判定式が誤っていました。",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "Right before renting a GPU with real money for the first time, four guards I had reported complete did not look that way in the code. Three of them stop billing from continuing. The repository says all four first appear in my own commits, though git cannot tell a lost edit from one never made. Then I wrote a script to count the rest, and its own test was wrong. Also in Korean and Japanese.",
          tags: ["Verification", "Method", "GPU"]
        },
        {
          title: "Every Cut I Could Measure Landed Inside a Character",
          url: "writing/the-review-that-skipped-the-big-file.html",
          source: "commercial", sourceLabel: "Commercial project",
          title_ko: "자른 자리를 재 보니 전부 글자 안이었습니다",
          desc_ko: "설계 문서를 고치면 외부 리뷰가 자동으로 돌게 해 뒀습니다. 폴더에는 결과가 쌓이고 있었는데 head -c가 글자가 아니라 바이트를 세는 바람에 잘린 자리가 글자 한가운데였습니다. 6만 바이트를 넘긴 커밋 4개를 재 보니 전부 그랬습니다. 그리고 같은 결함을 저는 세 번 틀리게 적었습니다.",
          title_ja: "切った位置を測ったら全部文字の中でした",
          desc_ja: "設計文書を直すと外部レビューが自動で回るようにしていました。フォルダには結果が溜まっていたのに、head -c が文字ではなくバイトを数えるせいで切れた位置が文字の真ん中でした。6 万バイトを超えたコミット 4 つを測ると全部そうでした。そして同じ欠陥を私は三度書き間違えました。",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "Editing a design document was set up to trigger an outside review, and the folder kept filling up. But head -c counts bytes, not characters, and every one of the four commits over 60,000 bytes is cut inside a character. I also wrote the same defect down wrong three times. Also in Korean and Japanese.",
          tags: ["Tooling", "Method", "Verification"]
        },
        {
          title: "Fixing One Side Left the Screen Where It Was",
          url: "writing/monitoring-two-gates-one-screen.html",
          source: "company", sourceLabel: "Company work",
          title_ko: "한쪽만 고치면 화면은 그대로였습니다",
          desc_ko: "가상자원 화면에는 따로 시작하는 경로가 둘 있어 한쪽만 고쳐서는 빨라지지 않았습니다. 프로젝트마다 도는 호출을 병렬화 대신 요청에서 떼어 냈고 빈 목록을 성공으로 받으면 기존 값이 0으로 덮인다는 지적을 받았습니다. 그리고 SSE가 빨라지자 숨어 있던 순서 의존이 드러났습니다. 연작 「통합 모니터링」 ④.",
          title_ja: "片方だけ直しても画面はそのままでした",
          desc_ja: "仮想リソース画面には別々に始まる経路が二つあり、片方だけ直しても速くなりませんでした。プロジェクトごとに回る呼び出しを並列化ではなくリクエストから外し、空のリストを成功として受け取ると既存の値が 0 で塗り替えられるという指摘を受けました。そして SSE が速くなると隠れていた順序依存が表に出ました。連載「統合モニタリング」④。",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "The virtual resources screen had two independently starting paths, so fixing one did not make it faster. The per-project fan-out came off the request instead of being parallelised, a review caught that an empty list accepted as success overwrites the value with zero, and speeding up SSE exposed a hidden ordering dependency. Unified Monitoring, part four. Also in Korean and Japanese.",
          tags: ["Performance", "Method", "Observability"]
        },
        {
          title: "An Empty List Is Not a Zero",
          url: "writing/monitoring-empty-is-not-zero.html",
          source: "company", sourceLabel: "Company work",
          title_ko: "빈 목록을 0대라고 발행하면 안 됐습니다",
          desc_ko: "물리 노드 화면에 같은 serve-stale 패턴을 옮기다가 「빈 결과를 0대로 발행해도 되는가」에서 멈췄습니다. 대상이 없어서 빈 것과 못 가져와서 빈 것이 같은 모양으로 옵니다. 빈 결과를 다섯 갈래로 갈라 둘만 새 값으로 발행하고 나머지는 마지막 정상값을 유지하도록 했습니다. 연작 「통합 모니터링」 ③.",
          title_ja: "空のリストを 0 台として公開してはいけませんでした",
          desc_ja: "物理ノード画面に同じ serve-stale のパターンを移す途中で「空の結果を 0 台として公開してよいのか」で止まりました。対象が無くて空なのと、取れなくて空なのが同じ形で届きます。空の結果を五つに分け、二つだけを新しい値として公開しました。連載「統合モニタリング」③。",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "Carrying the same serve-stale pattern to the physical nodes screen stopped at one question: may an empty result be published as zero nodes? Empty because nothing is there and empty because nothing could be fetched arrive in the same shape. Empty results were split five ways, two published as new values and the rest keeping the last good one. Unified Monitoring, part three. Also in Korean and Japanese.",
          tags: ["Observability", "Reliability", "Method"]
        },
        {
          title: "One Cache, Three Races Hiding Inside It",
          url: "writing/monitoring-three-races-in-one-cache.html",
          source: "company", sourceLabel: "Company work",
          title_ko: "cache 하나 넣는 일에 경합이 셋 숨어 있었습니다",
          desc_ko: "대시보드의 첫 데이터가 6.8초였던 이유는 접속이 곧 계산이었기 때문입니다. 요청 경로에서 계산을 떼어 내 10ms가 됐는데 그 과정에서 갱신이 취소되는 것·같은 값을 전체에 여러 번 뿌리는 것·timeout 하나가 남의 쿼리를 끊는 것, 경합 셋이 나왔습니다. 연작 「통합 모니터링」 ②.",
          title_ja: "cache を一つ入れる話に競合が三つ隠れていました",
          desc_ja: "ダッシュボードの最初のデータが 6.8 秒だった理由は、接続がそのまま計算だったからです。リクエスト経路から計算を外して 10ms になりましたが、その過程で更新が取り消されること・同じ値を全体に何度も配ること・timeout 一つが他人のクエリを切ることという競合が三つ出てきました。連載「統合モニタリング」②。",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "First data on the dashboard took 6.8 seconds because connecting was computing. Moving the computation off the request path brought it to 10 ms, and along the way three races appeared: a cancelled refresh, the same value broadcast many times, and one timeout cutting somebody else's query. Unified Monitoring, part two. Also in Korean and Japanese.",
          tags: ["Performance", "Concurrency", "Method"]
        },
        {
          title: "The Screen I Said Not to Fix Took 6.8 Seconds",
          url: "writing/monitoring-the-screen-i-said-not-to-fix.html",
          source: "company", sourceLabel: "Company work",
          title_ko: "고칠 게 없다고 쓴 화면이 6.8초였습니다",
          desc_ko: "모니터링 화면 3개를 검토하고 「고칠 근거를 못 찾았다」고 발행했는데 같은 화면의 첫 데이터가 6.8초였습니다. 저는 REST 응답을 쟀고 사용자는 SSE의 첫 data를 기다리고 있었습니다. 요청 경로에서 계산을 떼어 내자 세 화면 모두 약 23ms가 됐습니다. 연작 「통합 모니터링」 ①.",
          title_ja: "直す必要がないと書いた画面が 6.8 秒でした",
          desc_ja: "モニタリング画面 3 つをレビューして「直す根拠が見つからなかった」と公開したのに、同じ画面の最初のデータが 6.8 秒でした。私は REST の応答を測り、利用者は SSE の最初の data を待っていました。リクエスト経路から計算を外すと、三画面とも約 23ms になりました。連載「統合モニタリング」①。",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "I reviewed three monitoring screens, published that there was no case for a change, and first data on the same screen took 6.8 seconds. I had measured the REST response while users waited for the first SSE data event. Taking the computation off the request path brought all three screens to about 23 ms. Unified Monitoring, part one. Also in Korean and Japanese.",
          tags: ["Performance", "Method", "Verification"]
        },
        {
          title: "I Wrote a Generator So Six Runs Would Share One Condition",
          url: "writing/slow-screens-8-load-test-harness.html",
          source: "company", sourceLabel: "Company work",
          title_ko: "여섯 번 같은 조건으로 재려고 생성기를 짰습니다",
          desc_ko: "구성 6가지를 비교하려면 같은 조건으로 6번을 돌려야 합니다. 부하 조건을 상수로 옮겨 JMX를 생성하는 harness를 짰습니다. 그런데 결과 파일이 하나도 없어도 실행 스크립트는 「완료」를 찍고 0으로 끝났고 어느 회차가 어느 구성이었는지는 도구 밖에만 남았습니다. 연작 「느린 화면」 ⑧, 마지막 편.",
          title_ja: "6 回を同じ条件で測るために生成器を書きました",
          desc_ja: "構成 6 通りを比べるには同じ条件で 6 回まわす必要があります。負荷条件を定数に移して JMX を生成する harness を書きました。ところが結果ファイルが 1 つもなくても実行スクリプトは「完了」と出して 0 で終わり、どの回がどの構成だったかは道具の外にしか残りませんでした。連載「遅い画面」⑧、最終編。",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "Comparing six configurations means six runs under the same conditions. I moved the load conditions into constants and generated the JMX from them. Then I found the run script printing a completion message and exiting zero with no result files at all, and nothing in the output naming which run was which. Slow Screens, part eight and last. Also in Korean and Japanese.",
          tags: ["Performance", "Tooling", "Method"]
        },
        {
          title: "A Performance Review That Found No Case to Change Anything",
          url: "writing/slow-screens-7-nothing-to-fix.html",
          source: "company", sourceLabel: "Company work",
          title_ko: "모니터링 성능 검토에서 고칠 근거를 못 찾았습니다",
          desc_ko: "모니터링 화면 3개를 검토했는데 새로 최적화할 근거를 못 찾았습니다. cache를 더 넣으려던 자리는 줄일 것이 작아 보였고 과해 보이던 설정 하나는 화면 깜빡임을 막고 있었습니다. 부하 시험은 돌리지 않았고 왜 안 돌렸는지도 적었습니다. 연작 「느린 화면」 ⑦.",
          title_ja: "モニタリングの性能レビューで、直す根拠が見つかりませんでした",
          desc_ja: "モニタリング画面 3 つをレビューしましたが、新しく最適化する根拠が見つかりませんでした。cache を足そうとした場所は削れるものが小さく、過剰に見えた設定 1 つはグラフのちらつきを防いでいました。負荷試験は回しておらず、なぜ回さなかったのかも書きます。連載「遅い画面」⑦。",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "I reviewed three monitoring screens and found no case for a new optimisation. Where a cache would have gone there was little to save, and a setting that looked excessive was keeping the graph from flickering. I never ran a load test, and the article says why. Slow Screens, part seven. Also in Korean and Japanese.",
          tags: ["Performance", "Method"]
        },
        {
          title: "A Dialog That Would Not Open Had Two Causes",
          url: "writing/slow-screens-6-polling-pileup.html",
          source: "company", sourceLabel: "Company work",
          title_ko: "볼륨 생성 창이 안 열린 이유는 2개였습니다",
          desc_ko: "버튼을 눌러도 창이 안 열리고 로딩만 돌았습니다. 개발자 도구에는 끝나지 않은 요청이 4건 남아 있었습니다. 목록 조회가 10초 넘게 걸리는데 화면은 5초마다 다시 불렀고 창이 열려 있는 동안에도 멈추지 않았습니다. 그리고 그 5초가 backend cache 결정의 근거가 됐습니다. 연작 「느린 화면」 ⑥.",
          title_ja: "ボリューム作成ダイアログが開かなかった理由は 2 つでした",
          desc_ja: "ボタンを押してもダイアログが開かず、ローディングだけが回っていました。開発者ツールには未完了のリクエストが 4 件。一覧の取得に 10 秒以上かかるのに画面は 5 秒ごとに取り直し、ダイアログが開いているあいだも止まりませんでした。そしてその 5 秒が backend cache の判断の根拠になりました。連載「遅い画面」⑥。",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "Clicking the create button left the dialog spinning. DevTools showed four requests still pending. The list query took over ten seconds while the screen re-fetched it every five, and kept doing so while the dialog was open — and those five seconds became the reason behind a backend cache setting. Slow Screens, part six. Also in Korean and Japanese.",
          tags: ["Frontend", "Performance", "Method"]
        },
        {
          title: "A Monitoring Screen Authenticated Once Per Project",
          url: "writing/slow-screens-4-client-per-loop.html",
          source: "company", sourceLabel: "Company work",
          title_ko: "모니터링 화면이 프로젝트 수만큼 인증했습니다",
          desc_ko: "시계열 그래프를 그리는 화면이라 쿼리를 의심했는데 아니었습니다. 초기 로드가 프로젝트마다 client를 새로 만들고 있었고 우리가 쓰던 팩터리는 client를 줄 때마다 Keystone에 인증합니다. 다만 이 글에는 전후를 잰 숫자가 없습니다. 왜 없는지가 글의 절반입니다. 연작 「느린 화면」 ④.",
          title_ja: "モニタリング画面がプロジェクトの数だけ認証していました",
          desc_ja: "時系列グラフを描く画面なのでクエリを疑いましたが違いました。初期ロードがプロジェクトごとに client を作り直しており、使っていたファクトリは client を渡すたびに Keystone へ認証します。ただしこの記事には前後を測った数値がありません。なぜ無いのかが記事の半分です。連載「遅い画面」④。",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "It draws time-series graphs, so the query looked like the suspect. It was not. The initial load built a new client per project, and that factory authenticates to Keystone every time it hands one out. This article has no before-and-after numbers, and why it does not is half the story. Slow Screens, part four. Also in Korean and Japanese.",
          tags: ["Performance", "Backend", "Method"]
        },
        {
          title: "A Role Lookup Went From 1,409 ms to 1 ms",
          url: "writing/slow-screens-3-role-lookup.html",
          source: "company", sourceLabel: "Company work",
          title_ko: "역할 조회 1,409ms가 1ms가 됐습니다",
          desc_ko: "화면에 cache가 이미 있었는데 그 cache 때문에 느렸습니다. 찾은 8줄은 전부 0ms였고 못 찾은 6줄을 더하면 1,409ms로 타이머가 찍은 총계와 같았습니다. 못 찾을 때마다 프로젝트 전체 목록을 다시 부르고 있었는데 그 6개 id는 다시 받아도 없는 프로젝트였습니다. 연작 「느린 화면」 ③.",
          title_ja: "ロール取得の 1,409ms が 1ms になりました",
          desc_ja: "画面にはすでに cache があり、その cache のせいで遅くなっていました。解決できた 8 行はすべて 0ms、できなかった 6 行を足すと 1,409ms でタイマーの合計と同じでした。解決できないたびにプロジェクト全件を取り直しており、その 6 つの id は取り直しても存在しません。連載「遅い画面」③。",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "The screen already had a cache, and the cache was why it was slow. The eight rows that resolved cost 0 ms; the six that did not sum to 1,409 ms, the whole recorded span. Every failed lookup refetched the entire project list, and those six ids were never in it. Slow Screens, part three. Also in Korean and Japanese.",
          tags: ["Performance", "Backend", "Method"]
        },
        {
          title: "Listing Instances Went from 54 Seconds to One",
          url: "writing/slow-screens-2-instance-list.html",
          source: "company", sourceLabel: "Company work",
          title_ko: "instance 목록 조회가 54초에서 1초가 됐습니다",
          desc_ko: "instance는 20개인데 목록이 timeout이 났습니다. CLI로 불러도 54초여서 느린 구간이 backend 아래에 있다는 것까지는 알았습니다. swap이 8.0GiB 전부 차 있었고 instances 테이블에는 삭제 표시만 된 행이 1,021개 남아 있었습니다. 그리고 제가 쓴 명령은 운영에서 쓰면 안 되는 것이었습니다. 연작 「느린 화면」 ②.",
          title_ja: "instance 一覧が 54 秒から 1 秒になりました",
          desc_ja: "instance は 20 個なのに一覧が timeout しました。同じ取得を CLI で実行しても 54 秒で、コードが容疑から外れました。swap が 8.0GiB すべて埋まり、instances テーブルには削除の印だけが付いた行が 1,021 件。そして私が使ったコマンドは本番で使ってはいけないものでした。連載「遅い画面」②。",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "Twenty instances, and the list screen timed out. The same query from the CLI also took 54 seconds, which ruled the application code out. Swap was full and the instances table held 1,021 rows only marked deleted. The commands that fixed it are not ones to run in production, and this article says so. Slow Screens, part two. Also in Korean and Japanese.",
          tags: ["Performance", "Backend", "Method"]
        },
        {
          title: "A Volume List Went From a Ten-Minute Timeout to 23 ms",
          url: "writing/slow-screens-1-volume-list.html",
          source: "company", sourceLabel: "Company work",
          title_ko: "볼륨 목록 P99가 10분에서 23ms가 됐습니다",
          desc_ko: "관리 볼륨 목록이 6번에 5번 timeout이 났습니다. 고친 뒤 구성을 6가지로 나눠 같은 부하로 따로 쟀더니, 초를 가장 많이 줄인 것은 cache 하나였고 병렬화는 중앙값과 꼬리를 반대 방향으로 움직였습니다. 연작 「느린 화면」 ①.",
          title_ja: "ボリューム一覧の P99 が 10 分の timeout から 23ms になりました",
          desc_ja: "管理ボリューム一覧が 6 回に 5 回 timeout しました。直したあと構成を 6 通りに分けて同じ負荷で測ると、秒を最も減らしたのは cache 1 つで、並列化は中央値と裾を逆方向に動かしました。連載「遅い画面」①。",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "An admin volume list timed out five runs out of six. Measured across six configurations under the same load: one cache bought the largest drop in seconds, and parallelising moved the median and the tail in opposite directions. Slow Screens, part one. Also in Korean and Japanese.",
          tags: ["Performance", "Backend", "Method"]
        },
        {
          title: "Adding Threads Made the Tail Longer",
          url: "writing/parallelism-made-the-tail-worse.html",
          source: "company", sourceLabel: "Company work",
          title_ko: "thread를 늘렸더니 꼬리가 길어졌다",
          desc_ko: "cache 설정을 고정한 채 순차를 병렬로 바꾸니 P99가 42.6초에서 79.0초로 악화됐다. computeIfAbsent 안에서 외부 API를 부르면 그 자리가 잠긴다. 여섯 구성을 같은 조건으로 재고 나서야 보인 것.",
          title_ja: "スレッドを増やしたらテールが伸びた",
          desc_ja: "キャッシュ設定を固定したまま逐次を並列に変えると、p99 が 42.6 秒から 79.0 秒へ悪化した。computeIfAbsent の中で外部 API を呼ぶとそのビンがロックされる。6 構成を同条件で測って初めて見えたこと。",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "With the cache held fixed, going parallel took p99 from 42.6s to 79.0s. An external call inside computeIfAbsent, and the six-configuration test that made it visible. Also in Korean and Japanese.",
          tags: ["Performance", "Method"]
        },
        {
          title: "Ten Bugs, Zero Failed Tests",
          url: "writing/bugs-that-return-exit-code-zero.html",
          source: "side", sourceLabel: "Personal project",
          date: "2026-08", dateLabel: "Aug 2026",
          desc: "Control-plane verification on a Kubernetes GPU operator. What each defect broke, how it was found, and the guard that now holds it.",
          tags: ["Kubernetes", "Observability", "GPU"]
        }
      ]
    },

    notes: {
      /* 왼쪽 필터의 묶음. 용어 노트(#Harness 처럼 말 자체가 태그인 것)와 분류를 갈라 놓는다 —
         한 줄에 섞여 있으면 "무엇으로 고르는 목록인지"를 매번 다시 읽어야 한다. */
      tagGroups: {
        "Term": ["Harness", "Percentile", "Warm-up", "Arm", "Connection Pool", "Connection Pooler",
                "Transaction Pooling", "Mutation Testing", "Fail-closed"],
        "Kind": ["Performance", "Database", "Verification", "Design",
                "Troubleshooting", "Operating", "Debugging", "Chore", "Certification"]
      },
      items: [
        {
          title: "Harness",
          url: "notes/load-test-harness.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "A set of tools bundled so load can be generated and the result measured the same way, repeatedly.",
          desc_ko: "부하를 만들어 걸고 결과를 같은 방식으로 반복 측정할 수 있게 묶어 둔 도구 모음.",
          desc_ja: "負荷をかけて結果を同じやり方で繰り返し測れるようにまとめた道具一式。",
          tags: ["Harness", "Performance"]
        },
        {
          title: "Percentile",
          url: "notes/percentile.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "p50 · p95 · p99. Line the response times up and take the value at one position. p95 means 5% were slower.",
          desc_ko: "p50 · p95 · p99. 응답시간을 줄 세웠을 때 특정 위치의 값. p95는 5%가 그보다 느렸다는 뜻.",
          desc_ja: "p50 · p95 · p99。応答時間を並べたときの特定の位置の値。p95 は 5% がそれより遅かったという意味。",
          tags: ["Percentile", "Performance"]
        },
        {
          title: "Connection Pooler",
          url: "notes/connection-pooler.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "A middle server that folds thousands of app connections into dozens of database connections. RDS Proxy, PgBouncer.",
          desc_ko: "앱 connection 수천 개를 DB connection 수십 개로 묶어 주는 중간 서버. RDS Proxy·PgBouncer 등.",
          desc_ja: "アプリの connection 数千本を DB の connection 数十本にまとめる中間サーバ。RDS Proxy・PgBouncer など。",
          tags: ["Connection Pooler", "Database"]
        },
        {
          title: "Transaction Pooling",
          url: "notes/transaction-pooling.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "The mode in which a connection pooler lends out a connection per transaction and takes it back.",
          desc_ko: "connection pooler가 transaction 단위로 connection을 빌려주고 돌려받는 방식.",
          desc_ja: "connection pooler が transaction 単位で connection を貸し出して返してもらう方式。",
          tags: ["Transaction Pooling", "Database"]
        },
        {
          title: "Connection Pool",
          url: "notes/connection-pool.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "The list of database connections an app holds in order to reuse them. HikariCP by default in Spring Boot.",
          desc_ko: "앱이 DB connection을 재사용하려고 들고 있는 목록. Spring Boot 기본은 HikariCP.",
          desc_ja: "アプリが DB connection を再利用するために持っている一覧。Spring Boot の既定は HikariCP。",
          tags: ["Connection Pool", "Database"]
        },
        {
          title: "Mutation Testing",
          url: "notes/mutation-testing.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "Break the code on purpose and see whether a test goes red.",
          desc_ko: "코드를 일부러 망가뜨린 뒤 테스트가 빨간불이 되는지 보는 방법.",
          desc_ja: "コードをわざと壊して、テストが赤くなるかを見る方法。",
          tags: ["Mutation Testing", "Verification"]
        },
        {
          title: "Fail-closed",
          url: "notes/fail-closed.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "A design that falls towards blocking when it breaks. The opposite is fail-open.",
          desc_ko: "고장 났을 때 막는 쪽으로 넘어지는 설계. 반대는 fail-open.",
          desc_ja: "壊れたときに止める側へ倒れる設計。反対は fail-open。",
          tags: ["Fail-closed", "Design"]
        },
        {
          title: "Warm-up",
          url: "notes/warmup.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "The stretch at the front of a measurement that gets thrown away. It is not steady state.",
          desc_ko: "측정 앞부분을 버리는 구간. 그 구간은 정상 상태가 아니다.",
          desc_ja: "測定の先頭を捨てる区間。そこは定常状態ではない。",
          tags: ["Warm-up", "Performance"]
        },
        {
          title: "Arm",
          url: "notes/arm.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "One branch of a comparison run. One variable differs; everything else is held the same.",
          desc_ko: "비교 실험에서 한 갈래의 실행입니다. 한 변수만 다르고 나머지는 같아야 합니다.",
          desc_ja: "比較実験の一方の実行。変数は一つだけ違い、残りは同じにする。",
          tags: ["Arm", "Performance"]
        },
        {
          title: "Engineering Notes",
          title_ko: "엔지니어링 노트",
          title_ja: "エンジニアリングノート",
          url: "notes/engineering.html",
          date: "2026-02", dateLabel: "Feb 2026",
          desc: "GPUaaS build logs, Kubernetes operator implementation notes, and observability records.",
          desc_ko: "GPUaaS 빌드 기록, Kubernetes 오퍼레이터 구현 노트, 관측 기록.",
          desc_ja: "GPUaaS のビルドログ、Kubernetes オペレータの実装ノート、可観測性の記録。",
          tags: ["Troubleshooting", "Operating", "Debugging"]
        },
        {
          title: "Study / Reading Notes",
          title_ko: "학습 · 독서 노트",
          title_ja: "学習・読書ノート",
          url: "notes/study-reading.html",
          date: "2026-01", dateLabel: "Jan 2026",
          desc: "Conference notes, reading notes, code interview notes, and short technical memos.",
          desc_ko: "콘퍼런스 노트, 독서 노트, 코딩 인터뷰 노트, 짧은 기술 메모.",
          desc_ja: "カンファレンスノート、読書ノート、コーディング面接ノート、短い技術メモ。",
          tags: ["Performance", "Chore", "Certification"]
        }
      ]
    }
  };

  // News items are filtered by year — derive a "#YYYY" tag from each date.
  DATA.news.items.forEach(function (it) {
    if (!it.tags) it.tags = [String(it.date).slice(0, 4)];
  });

  window.SITE_CONTENT = DATA;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function tagsOf(items) {
    var seen = {}, out = [];
    items.forEach(function (it) {
      (it.tags || []).forEach(function (t) { if (!seen[t]) { seen[t] = 1; out.push(t); } });
    });
    out.sort(function (a, b) { return a.localeCompare(b); });
    return out;
  }

  function nameOf(it) { return it.title || it.text || ""; }

  function sortItems(items) {
    return items.slice().sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return nameOf(a).localeCompare(nameOf(b));
    });
  }

  /* "이건 사이드 프로젝트인가 회사 일인가"는 독자가 주장의 무게를 정할 때 먼저 묻는 것이다.
     source 가 없는 항목에는 아무것도 그리지 않는다: 확인하지 않은 분류를 붙이면 배지 전체가
     못 믿을 것이 된다. */
  function sourceTag(it) {
    if (!it.source || !it.sourceLabel) return "";
    return '<span class="card-source ' + esc(it.source) + '">' + esc(trLabel(it.sourceLabel)) + "</span>";
  }

  function cardMini(it) {
    return (
      '<div class="dated-card"><a class="mini-line-card" href="' + BASE + esc(it.url) + '">' +
      '<h3 class="notranslate">' + esc(f(it, "title")) + "</h3>" +
      '<span class="card-date notranslate">' + esc(dateLabel(it)) + "</span>" + sourceTag(it) +
      "<p>" + esc(f(it, "desc")) + "</p></a></div>"
    );
  }

  /* 섹션 인덱스는 **행**으로 그린다.
     카드 격자였을 때는 열세 장이 전부 같은 무게로 서 있고 카드마다 요약이 네댓 줄이라
     "먼저 읽을 것"이 보이지 않았다. 행으로 바꾸면 제목이 왼쪽 한 줄로 정렬돼 훑는 축이 하나가
     되고, 요약을 한 줄로 자르면 행 높이가 균일해져 눈이 흔들리지 않는다. 테두리도 사라진다.
     날짜·배지는 왼쪽 칸에 따로 두어 제목 줄을 밀어내지 않게 한다. */
  function cardArticle(it) {
    return (
      '<a class="entry-row" href="' + BASE + esc(it.url) + '">' +
      '<div class="entry-meta"><span class="notranslate">' + esc(dateLabel(it)) + "</span>" +
      sourceTag(it) + "</div>" +
      '<div class="entry-main">' +
      '<h2 class="entry-title notranslate">' + esc(f(it, "title")) + "</h2>" +
      '<p class="entry-desc">' + esc(f(it, "desc")) + "</p></div></a>"
    );
  }

  function cardNews(it) {
    return (
      '<article class="news-card">' +
      '<span class="date notranslate">' + esc(dateLabel(it)) + "</span>" +
      "<p>" + esc(f(it, "text")) + "</p></article>"
    );
  }

  /* The GitHub mark, inlined because the page loads no icon font and a CSP blocks remote images.
     aria-label carries what the removed word said, so nothing is lost to a screen reader. */
  function githubLink(href, label) {
    return (
      '<a class="icon-link" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer"' +
      ' aria-label="' + esc(label) + '" title="' + esc(label) + '">' +
      '<svg viewBox="0 0 16 16" width="19" height="19" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/>' +
      "</svg></a>"
    );
  }

  function cardProject(it) {
    var stacks = (it.stacks || []).map(function (s) {
      return '<span class="stack ' + esc(s[1]) + '">' + esc(s[0]) + "</span>";
    }).join("");
    /* The whole card is the link to the detail page, not a "Details" button beside the title. A card that
       looks clickable and is not is a worse affordance than no affordance, and a reader who wants the detail
       page is aiming at the title anyway. The anchor stays on the title and stretches over the card with a
       pseudo-element, because nesting the GitHub link inside an anchor would be invalid; the actions row is
       raised above it so that link still receives its own clicks. */
    var title = esc(f(it, "title"));
    if (it.url) {
      title = '<a class="card-link" href="' + BASE + esc(it.url) + '">' + title + "</a>";
    }
    /* A private repository gets a Private badge where the GitHub link would be. Linking anyway would
       hand every reader a 404, and leaving the slot empty would read as "no code exists". */
    var repo = it.private
      ? '<span class="repo-private notranslate" translate="no">' + esc("Private") + "</span>"
      : githubLink(it.github, esc(it.title) + " on GitHub");

    return (
      '<div class="dated-card"><article class="content-card' + (it.url ? " is-linked" : "") + '">' +
      '<div class="project-image" aria-hidden="true"></div>' +
      '<div class="card-content"><div class="project-top"><div>' +
      '<div class="label notranslate">' + esc(trLabel(f(it, "label"))) + "</div>" +
      '<h3 class="card-title notranslate">' + title + "</h3>" +
      '<p class="authors notranslate">' + esc(trLabel(f(it, "authors"))) + "</p>" +
      '<span class="card-date notranslate">' + esc(dateLabel(it)) + "</span>" +
      '</div><div class="project-actions notranslate">' + repo + "</div></div>" +
      '<div class="detail-block"><p>' + esc(f(it, "desc")) + "</p>" +
      '<div class="stack-list notranslate">' + stacks + "</div></div>" +
      "</div></article></div>"
    );
  }

  var CARDS = { mini: cardMini, article: cardArticle, news: cardNews, project: cardProject };

  /* Generic renderer.
     opts: { card, limit (0=all), tagRow (element|null), allLabel }
       allLabel: label for the leading "show-all" button ("Recent"/"All"/"Main Project"…)
                 pass null/false to omit it (only the real tags are shown). */
  function render(key, cardsEl, opts) {
    var sec = DATA[key];
    if (!sec || !cardsEl) return;
    opts = opts || {};
    var limit = opts.limit || 0;
    var card = CARDS[opts.card] || cardMini;
    var tagRowEl = opts.tagRow || null;
    var hasAll = !(opts.allLabel === null || opts.allLabel === false);
    var allLabel = hasAll ? (opts.allLabel || "Recent") : null;

    var tagList = tagsOf(sec.items);
    var initial = hasAll ? allLabel : (tagList[0] || null);

    /* 기사에서 `?tag=Performance` 로 넘어오면 그 태그를 켠 채로 연다. 링크를 눌렀는데 전체
       목록이 나오면 "누른 것이 안 먹었나"를 다시 확인하게 된다. 없는 태그면 무시한다. */
    try {
      var wanted = decodeURIComponent((/[?&]tag=([^&]+)/.exec(location.search) || [])[1] || "");
      if (wanted && tagList.indexOf(wanted) !== -1) initial = wanted;
    } catch (e) { /* 잘못 인코딩된 주소는 그냥 무시한다 */ }

    /* 태그는 **왼쪽 세로 목록**으로만 그린다. 18개가 칩 한 줄로 세 줄씩 감기면 고르는 게 아니라
       읽는 일이 된다. 세로로 세우면 묶어서 나눌 수 있고 개수도 붙일 수 있다(AWS 문서의 좌측 내비와
       같은 형태). 홈에는 태그 줄 자체가 없다 — 미리보기 5건에 필터는 번잡하기만 하다. */

    function countOf(tag) {
      if (tag === allLabel) return sec.items.length;
      return sec.items.filter(function (it) { return (it.tags || []).indexOf(tag) !== -1; }).length;
    }

    function facetRow(t, active) {
      return (
        '<button type="button" class="facet' + (active ? " active" : "") + '" data-tag="' + esc(t) + '">' +
        '<span class="facet-label">' + (t === allLabel ? esc(t) : "#" + esc(t)) + "</span>" +
        '<span class="n">' + countOf(t) + "</span></button>"
      );
    }

    // 아무것도 걸러내지 못하는 레일은 숨긴다. 태그가 없거나(항목에 tags 가 없음), 있어도 모든
    // 태그가 전체 건수와 같으면(News 의 #2026 처럼 연도 하나뿐) 눌러도 목록이 그대로다 —
    // 고를 것이 없는 필터는 자리만 차지하고 "여기서 뭘 고르지"를 매번 다시 묻게 만든다.
    var narrows = tagList.some(function (t) { return countOf(t) < sec.items.length; });
    if (tagRowEl && !narrows) {
      tagRowEl.hidden = true;
      var browse = tagRowEl.closest && tagRowEl.closest(".section-browse");
      if (browse) browse.classList.add("no-facets");
      // 레일이 없으면 본문을 바깥으로 밀 이유도 없다 — 컨테이너에도 표시해 CSS 가 밀기를 끈다.
      var page = tagRowEl.closest && tagRowEl.closest(".container");
      if (page) page.classList.add("no-facets");
    } else if (tagRowEl) {
      // 섹션이 tagGroups 를 선언하면 그 순서·묶음대로, 아니면 한 덩어리로 그린다.
      var groups = sec.tagGroups || null;
      var html = hasAll ? facetRow(allLabel, initial === allLabel) : "";
      if (groups) {
        var placed = {};
        Object.keys(groups).forEach(function (name) {
          // 묶음 안에서는 **개수 많은 순**으로. 큰 덩어리가 먼저 보여야 훑는 값이 있다.
          // 같은 개수면 이름순 — 순서가 실행마다 바뀌면 "어디 있었더라"가 매번 새로 시작된다.
          var inGroup = groups[name]
            .filter(function (t) { return tagList.indexOf(t) !== -1; })
            .sort(function (a, b) { return countOf(b) - countOf(a) || a.localeCompare(b); });
          if (!inGroup.length) return;
          inGroup.forEach(function (t) { placed[t] = 1; });
          html += '<div class="facet-group"><h3>' + esc(name) + "</h3>" +
                  inGroup.map(function (t) { return facetRow(t, t === initial); }).join("") + "</div>";
        });
        var rest = tagList.filter(function (t) { return !placed[t]; })
          .sort(function (a, b) { return countOf(b) - countOf(a) || a.localeCompare(b); });
        if (rest.length) {
          html += '<div class="facet-group"><h3>' + esc("Other") + "</h3>" +
                  rest.map(function (t) { return facetRow(t, t === initial); }).join("") + "</div>";
        }
      } else {
        html += '<div class="facet-group">' +
                tagList.slice()
                  .sort(function (a, b) { return countOf(b) - countOf(a) || a.localeCompare(b); })
                  .map(function (t) { return facetRow(t, t === initial); }).join("") + "</div>";
      }
      tagRowEl.innerHTML = html;
    }

    function draw(tag) {
      var items = sortItems(sec.items);
      if (tag && tag !== allLabel) {
        items = items.filter(function (it) { return (it.tags || []).indexOf(tag) !== -1; });
      }
      if (limit > 0) items = items.slice(0, limit);
      cardsEl.innerHTML = items.map(card).join("");
    }

    if (tagRowEl) {
      tagRowEl.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-tag]");
        if (!btn) return;
        var bs = tagRowEl.querySelectorAll(".facet");
        for (var i = 0; i < bs.length; i++) bs[i].classList.remove("active");
        btn.classList.add("active");
        draw(btn.getAttribute("data-tag"));
      });
    }

    draw(initial);
  }

  window.renderSection = render;

  /* Convenience wrappers (Home uses #Recent, index pages use #All). */
  window.renderHomeSection = function (key, cardsEl, limit) {
    render(key, cardsEl, { card: "mini", limit: limit || 5, allLabel: "Recent" });
  };
  window.renderGrid = function (key, gridEl, tagRowEl) {
    render(key, gridEl, { card: "article", limit: 0, tagRow: tagRowEl, allLabel: "All" });
  };

  /* 기사 왼쪽 레일.
     오른쪽은 이 글 안을 오가는 목차이고, 왼쪽은 **이 글 밖으로** 나가는 길이다 —
     같은 주제의 다른 글과 같은 프로젝트의 다른 글. 글 끝에 붙이면 끝까지 읽은 사람만 보지만,
     레일에 두면 읽는 도중에도 "이 얘기 딴 데서 더 봤나"에 답할 수 있다.

     slug 는 언어 접미사를 뗀 이름이다(`a-pooler-fixes-only-one`). 한국어판에서 눌러도
     lang.js 가 저장된 언어 선호를 보고 손으로 쓴 판으로 데려간다. */
  window.renderArticleAside = function (el, key, slug) {
    if (!el || !DATA[key]) return;
    var items = DATA[key].items;
    var me = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].url && items[i].url.split("/").pop() === slug + ".html") { me = items[i]; break; }
    }
    if (!me) return;   // 데이터에 없는 글이면 레일을 그리지 않는다 — 빈 상자보다 낫다.

    /* 레일 제목은 **읽는 사람의 언어**를 따른다. 페이지 언어를 따르게 두면, 한국어 독자가
       한국어판이 없는 영문 글을 볼 때 메뉴는 한국어인데 이 레일만 영어로 남는다. */
    var lang = LANG || (document.documentElement.lang || "en").slice(0, 2);
    var L = ({
      ko: { tags: "태그", more: "관련 글" },
      ja: { tags: "タグ", more: "関連記事" }
    })[lang] || { tags: "Tags", more: "Related" };

    var html = "";
    var tags = me.tags || [];
    if (tags.length) {
      html += '<div class="aside-group"><p class="aside-label notranslate">' + esc(L.tags) + '</p><ul>' +
        tags.map(function (t) {
          return '<li><a class="notranslate" href="' + BASE + esc(key) + "/index.html?tag=" +
            encodeURIComponent(t) + '">#' + esc(t) + "</a></li>";
        }).join("") + "</ul></div>";
    }

    var siblings = items.filter(function (it) {
      return it !== me && it.source && it.source === me.source;
    }).slice(0, 4);
    if (siblings.length) {
      html += '<div class="aside-group"><p class="aside-label">' + esc(L.more) +
        '</p><ul>' + siblings.map(function (it) {
          return '<li><a class="notranslate" href="' + BASE + esc(it.url) + '">' + esc(f(it, "title")) + "</a></li>";
        }).join("") + "</ul></div>";
    }

    if (!html) return;
    el.innerHTML = html;
  };

  /* Sets a "+N" count element's text from a section's item count. */
  window.setCount = function (el, key) {
    if (el && DATA[key]) el.textContent = DATA[key].items.length;
  };
})();
