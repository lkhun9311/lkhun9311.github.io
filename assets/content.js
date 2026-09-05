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

  var DATA = {
    news: {
      items: [
        { date: "2026-02-06", dateLabel: "Feb 6, 2026", text: "Started building a Kubernetes-native GPUaaS platform control plane." },
        { date: "2026-02-04", dateLabel: "Feb 4, 2026", text: "Preparing technical notes on GPU scheduling, inference serving, and observability." },
        { date: "2026-02-01", dateLabel: "Feb 1, 2026", text: "Built this technical homepage with GitHub Pages." }
      ]
    },

    projects: {
      /* Writing 과 같은 축으로 나눈다 — 섹션마다 기준이 달라지면 왼쪽 레일을 매번 다시 배운다. */
      tagGroups: {
        "영역": ["GPU", "Kubernetes", "Backend", "Postgres", "IaaS", "Control Plane"],
        "관점": ["Operations", "Privacy"]
      },
      items: [
        {
          label: "Commercial Project",
          title: "Social Polling Platform: Anonymous Voting and Published Aggregates",
          authors: "Solo",
          date: "2026-09-05",
          dateLabel: "Sep 5, 2026",
          private: true,
          desc: "A Kotlin and Spring Boot service where people post a question, others vote anonymously, and the results are published as aggregates \u2014 totals, per-option counts, demographic axes and a trend over time \u2014 with min-n suppression and rounded shares so that a published change cannot be traced back to one person. Pre-launch work covered transaction boundaries and the connection budget, an aggregate-privacy track closed by writing the guarantee down as a sentence, and a moderation gate that runs outside the transaction.",
          tags: ["Backend", "Privacy", "Postgres"],
          stacks: [["Kotlin", "kotlin"], ["Spring Boot", "spring"], ["PostgreSQL", "postgres"], ["Flyway", "flyway"], ["Operations", "operations"]]
        },
        {
          label: "Main Project",
          title: "GPUaaS Platform Control Plane: Kubernetes-native AI Infrastructure",
          authors: "Solo",
          date: "2026-02-06",
          dateLabel: "Feb 6, 2026",
          url: "projects/gpuaas-control-plane.html",
            github: "https://github.com/lkhun9311/gpu-platform-control-plane",
          desc: "A control-plane project for GPU-based AI workloads, focused on node readiness, tenant-level GPU governance, admission control, inference workload management, and operational observability.",
          tags: ["GPU", "Kubernetes", "Control Plane"],
          stacks: [["Kubernetes", "kubernetes"], ["Python", "python"], ["Go", "go"], ["GPU", "gpu"], ["vLLM", "vllm"], ["Prometheus", "prometheus"], ["Grafana", "grafana"], ["AWS", "aws"]]
        },
        {
          label: "Company Work",
          title: "IaaS Backend Engineering: Cloud Control Plane and Operations",
          authors: "Company",
          date: "2026-01-28",
          dateLabel: "Jan 28, 2026",
          github: "https://github.com/lkhun9311",
          desc: "Backend engineering experience across IaaS infrastructure systems, including compute, storage, identity, monitoring, automation, production troubleshooting, Linux-based operations, and operational response.",
          tags: ["IaaS", "Backend", "Operations"],
          stacks: [["Java", "java"], ["Spring Boot", "spring"], ["IaaS", "iaas"], ["OpenStack", "openstack"], ["Linux", "linux"], ["Monitoring", "monitoring"], ["Operations", "operations"]]
        }
      ]
    },

    writing: {
      /* 왼쪽 필터의 묶음. "무엇에 대한 글인가"(영역)와 "무엇을 다루는 글인가"(관점)는 고르는
         이유가 다르다 — 한 줄에 섞어 두면 열다섯 개를 매번 처음부터 읽게 된다. */
      tagGroups: {
        "영역": ["GPU", "Kubernetes", "Backend", "Postgres", "IaaS", "Control Plane"],
        "관점": ["Method", "Observability", "Reliability", "Performance",
                "Security", "Privacy", "Cost", "Operations", "Migration"]
      },
      items: [
        {
          title: "The Track Did Not End Until the Guarantee Was a Sentence",
          url: "writing/until-the-guarantee-was-a-sentence.html",
          date: "2026-09", dateLabel: "Sep 2026",
          source: "commercial", sourceLabel: "Commercial project",
          desc: "A defence written per dimension breaks the moment a dimension is added. Five tickets in, what ended the privacy track was not a sixth repair but writing the guarantee as a sentence — and computing the difference between the goal and what was already true. Also in Korean and Japanese.",
          tags: ["Privacy", "Security", "Method"]
        },
        {
          title: "The Throughput Ceiling Was Not in the Code",
          url: "writing/the-ceiling-was-not-in-the-code.html",
          date: "2026-09", dateLabel: "Sep 2026",
          source: "commercial", sourceLabel: "Commercial project",
          desc: "Post creation would not go past 6.27 req/s. Four times the write threads did nothing, three times the database pool did nothing. The limit was a default of five connections per host, inside an HTTP client the AWS SDK pulled in for S3 — a layer only on the runtime classpath, which reading could never have found. Also in Korean and Japanese.",
          tags: ["Performance", "Backend", "Method"]
        },
        {
          title: "The Connection Exhaustion RDS Proxy Cannot Fix",
          url: "writing/a-pooler-fixes-only-one.html",
          date: "2026-09", dateLabel: "Sep 2026",
          source: "commercial", sourceLabel: "Commercial project",
          desc: "A pre-launch review of a social polling platform. Connection exhaustion has two causes behind one symptom and a pooler fixes only one of them \u2014 then a JMeter harness put numbers on it: an unrelated read path at 4 ms against 6,047 ms, and a second fix that halved post-create latency. Also in Korean and Japanese.",
          tags: ["Postgres", "Backend", "Method"]
        },
        {
          title: "Every Guarantee Ends at a Field the Tenant Can Write",
          url: "writing/every-guarantee-ends-at-a-writable-field.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "Four quota defences broken the same way, each found by attacking it. Forged ownerReferences, a self-granted exemption, a grace period the victim sets, and a reservation for Pods that can never exist. Also in Korean and Japanese.",
          tags: ["Kubernetes", "Security", "GPU"]
        },
        {
          title: "The Only Control That Has Ever Caught a Cost Error",
          url: "writing/the-only-control-that-caught-something.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "Several layers of cost control on a GPU lab account, and the one that caught an error in the cost itself was a hand-made budget alert Terraform nearly deleted. Also in Korean and Japanese.",
          tags: ["Cost", "Operations", "Method"]
        },
        {
          title: "It Did Not Protect the Tail. It Deleted the Tenant.",
          url: "writing/it-deleted-the-tenant.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "A four-arm experiment on one A10G. The arm that rejected nothing completed exactly the premium request count, and every check was a tail ratio. Also in Korean and Japanese.",
          tags: ["GPU", "Method", "Observability"]
        },
        {
          title: "Three Documents I Wrote Rested on a False Premise",
          url: "writing/three-documents-on-a-false-premise.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "A migration across 2,255 commits. Reasoning from documents could not say where it breaks, so the old version went up in an isolated container and broke once. Also in Korean and Japanese.",
          tags: ["Migration", "Method"]
        },
        {
          title: "Seven of Eight Failures Should Not Be Recovered",
          url: "writing/seven-of-eight-should-not-recover.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "A switch failure made live compute nodes look dead and recovery ran at scale. Grading what each signal is entitled to testify to left seven of eight scenarios on hold. Also in Korean and Japanese.",
          tags: ["Reliability", "Method"]
        },
        {
          title: "Adding Threads Made the Tail Longer",
          url: "writing/parallelism-made-the-tail-worse.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "With the cache held fixed, going parallel took p99 from 42.6s to 79.0s. An external call inside computeIfAbsent, and the six-configuration test that made it visible. Also in Korean and Japanese.",
          tags: ["Performance", "Method"]
        },
        {
          title: "Ten Bugs, Zero Failed Tests",
          url: "writing/bugs-that-return-exit-code-zero.html",
          date: "2026-08", dateLabel: "Aug 2026",
          desc: "Control-plane verification on a Kubernetes GPU operator. What each defect broke, how it was found, and the guard that now holds it.",
          tags: ["Kubernetes", "Observability", "GPU"]
        },
        {
          title: "GPU Node Readiness for Kubernetes-native GPU Platforms",
          url: "writing/gpu-node-readiness.html",
          date: "2026-02", dateLabel: "Feb 2026",
          desc: "A practical write-up for validating GPU nodes before admitting AI workloads.",
          tags: ["GPU", "Kubernetes"]
        },
        {
          title: "Designing a Multi-tenant GPU Quota Control Plane",
          url: "writing/gpu-quota-control-plane.html",
          date: "2026-02", dateLabel: "Feb 2026",
          desc: "Notes on tenant isolation, ResourceQuota, admission policy, and Gateway-level rate limits.",
          tags: ["GPU", "Kubernetes", "Observability"]
        },
        {
          title: "Lessons from IaaS Backend Performance Optimization",
          url: "writing/iaas-backend-performance.html",
          date: "2026-01", dateLabel: "Jan 2026",
          desc: "How control-plane API design, caching, and parallelization changed user-visible latency.",
          tags: ["Observability"]
        }
      ]
    },

    notes: {
      /* 왼쪽 필터의 묶음. 용어 노트(#Harness 처럼 말 자체가 태그인 것)와 분류를 갈라 놓는다 —
         한 줄에 섞여 있으면 "무엇으로 고르는 목록인지"를 매번 다시 읽어야 한다. */
      tagGroups: {
        "용어": ["Harness", "Percentile", "Warm-up", "Arm", "Connection Pool", "Connection Pooler",
                "Transaction Pooling", "Mutation Testing", "Fail-closed"],
        "분류": ["Performance", "Database", "Verification", "Design",
                "Troubleshooting", "Operating", "Debugging", "Chore", "Certification"]
      },
      items: [
        {
          title: "Harness: 하네스란?",
          url: "notes/load-test-harness.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "하네스는 부하를 만들어 걸고 결과를 같은 방식으로 반복 측정할 수 있게 묶어 둔 도구 모음입니다.",
          tags: ["Harness", "Performance"]
        },
        {
          title: "Percentile: p50 · p95 · p99 란?",
          url: "notes/percentile.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "응답시간을 줄 세웠을 때 특정 위치의 값. p95 는 5%가 그보다 느렸다는 뜻입니다.",
          tags: ["Percentile", "Performance"]
        },
        {
          title: "Connection Pooler: 커넥션 풀러란?",
          url: "notes/connection-pooler.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "앱 커넥션 수천 개를 DB 커넥션 수십 개로 묶어 주는 중간 서버. RDS Proxy·PgBouncer 등.",
          tags: ["Connection Pooler", "Database"]
        },
        {
          title: "Transaction Pooling: 트랜잭션 풀링이란?",
          url: "notes/transaction-pooling.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "커넥션 풀러가 트랜잭션 단위로 커넥션을 빌려주고 돌려받는 방식.",
          tags: ["Transaction Pooling", "Database"]
        },
        {
          title: "Connection Pool: 커넥션 풀이란?",
          url: "notes/connection-pool.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "앱이 DB 커넥션을 재사용하려고 들고 있는 목록. Spring Boot 기본은 HikariCP.",
          tags: ["Connection Pool", "Database"]
        },
        {
          title: "Mutation Testing: 뮤테이션 테스트란?",
          url: "notes/mutation-testing.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "코드를 일부러 망가뜨린 뒤 테스트가 빨간불이 되는지 보는 방법.",
          tags: ["Mutation Testing", "Verification"]
        },
        {
          title: "Fail-closed: fail-closed 란?",
          url: "notes/fail-closed.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "고장 났을 때 막는 쪽으로 넘어지는 설계. 반대는 fail-open.",
          tags: ["Fail-closed", "Design"]
        },
        {
          title: "Warm-up: 워밍업이란?",
          url: "notes/warmup.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "측정 앞부분을 버리는 구간. 그 구간은 정상 상태가 아니다.",
          tags: ["Warm-up", "Performance"]
        },
        {
          title: "Arm: arm(대조군)이란?",
          url: "notes/arm.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "비교 실험에서 한 갈래의 실행. 한 변수만 다르고 나머지는 같아야 한다.",
          tags: ["Arm", "Performance"]
        },
        {
          title: "Engineering Notes",
          url: "notes/engineering.html",
          date: "2026-02", dateLabel: "Feb 2026",
          desc: "GPUaaS build logs, Kubernetes operator implementation notes, and observability records.",
          tags: ["Troubleshooting", "Operating", "Debugging"]
        },
        {
          title: "Study / Reading Notes",
          url: "notes/study-reading.html",
          date: "2026-01", dateLabel: "Jan 2026",
          desc: "Conference notes, reading notes, code interview notes, and short technical memos.",
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
    return '<span class="card-source ' + esc(it.source) + '">' + esc(it.sourceLabel) + "</span>";
  }

  function cardMini(it) {
    return (
      '<div class="dated-card"><a class="mini-line-card" href="' + BASE + esc(it.url) + '">' +
      '<h3 class="notranslate">' + esc(it.title) + "</h3>" +
      '<span class="card-date notranslate">' + esc(it.dateLabel) + "</span>" + sourceTag(it) +
      "<p>" + esc(it.desc) + "</p></a></div>"
    );
  }

  function cardArticle(it) {
    return (
      '<a class="article-card" href="' + BASE + esc(it.url) + '">' +
      '<div class="date notranslate">' + esc(it.dateLabel) + "</div>" + sourceTag(it) +
      '<h2 class="notranslate">' + esc(it.title) + "</h2>" +
      "<p>" + esc(it.desc) + "</p></a>"
    );
  }

  function cardNews(it) {
    return (
      '<article class="news-card">' +
      '<span class="date notranslate">' + esc(it.dateLabel) + "</span>" +
      "<p>" + esc(it.text) + "</p></article>"
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
    var title = esc(it.title);
    if (it.url) {
      title = '<a class="card-link" href="' + BASE + esc(it.url) + '">' + title + "</a>";
    }
    /* A private repository gets a Private badge where the GitHub link would be. Linking anyway would
       hand every reader a 404, and leaving the slot empty would read as "no code exists". */
    var repo = it.private
      ? '<span class="repo-private notranslate" translate="no">Private</span>'
      : githubLink(it.github, esc(it.title) + " on GitHub");

    return (
      '<div class="dated-card"><article class="content-card' + (it.url ? " is-linked" : "") + '">' +
      '<div class="project-image" aria-hidden="true"></div>' +
      '<div class="card-content"><div class="project-top"><div>' +
      '<div class="label notranslate">' + esc(it.label) + "</div>" +
      '<h3 class="card-title notranslate">' + title + "</h3>" +
      '<p class="authors notranslate">' + esc(it.authors) + "</p>" +
      '<span class="card-date notranslate">' + esc(it.dateLabel) + "</span>" +
      '</div><div class="project-actions notranslate">' + repo + "</div></div>" +
      '<div class="detail-block"><p>' + esc(it.desc) + "</p>" +
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
    } else if (tagRowEl) {
      // 섹션이 tagGroups 를 선언하면 그 순서·묶음대로, 아니면 한 덩어리로 그린다.
      var groups = sec.tagGroups || null;
      var html = hasAll ? facetRow(allLabel, true) : "";
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
                  inGroup.map(function (t) { return facetRow(t, false); }).join("") + "</div>";
        });
        var rest = tagList.filter(function (t) { return !placed[t]; })
          .sort(function (a, b) { return countOf(b) - countOf(a) || a.localeCompare(b); });
        if (rest.length) {
          html += '<div class="facet-group"><h3>기타</h3>' +
                  rest.map(function (t) { return facetRow(t, false); }).join("") + "</div>";
        }
      } else {
        html += '<div class="facet-group">' +
                tagList.slice()
                  .sort(function (a, b) { return countOf(b) - countOf(a) || a.localeCompare(b); })
                  .map(function (t) { return facetRow(t, false); }).join("") + "</div>";
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

  /* Sets a "+N" count element's text from a section's item count. */
  window.setCount = function (el, key) {
    if (el && DATA[key]) el.textContent = DATA[key].items.length;
  };
})();
