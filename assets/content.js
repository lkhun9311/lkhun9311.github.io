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
      items: [
        {
          label: "Main Project",
          title: "GPUaaS Platform Control Plane: Kubernetes-native AI Infrastructure",
          authors: "Solo",
          date: "2026-02-06",
          dateLabel: "Feb 6, 2026",
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
      items: [
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
      items: [
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

  function cardMini(it) {
    return (
      '<div class="dated-card"><a class="mini-line-card" href="' + BASE + esc(it.url) + '">' +
      '<h3 class="notranslate">' + esc(it.title) + "</h3>" +
      '<span class="card-date notranslate">' + esc(it.dateLabel) + "</span>" +
      "<p>" + esc(it.desc) + "</p></a></div>"
    );
  }

  function cardArticle(it) {
    return (
      '<a class="article-card" href="' + BASE + esc(it.url) + '">' +
      '<div class="date notranslate">' + esc(it.dateLabel) + "</div>" +
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

  function cardProject(it) {
    var stacks = (it.stacks || []).map(function (s) {
      return '<span class="stack ' + esc(s[1]) + '">' + esc(s[0]) + "</span>";
    }).join("");
    return (
      '<div class="dated-card"><article class="content-card">' +
      '<div class="project-image" aria-hidden="true"></div>' +
      '<div class="card-content"><div class="project-top"><div>' +
      '<div class="label notranslate">' + esc(it.label) + "</div>" +
      '<h3 class="card-title notranslate">' + esc(it.title) + "</h3>" +
      '<p class="authors notranslate">' + esc(it.authors) + "</p>" +
      '<span class="card-date notranslate">' + esc(it.dateLabel) + "</span>" +
      '</div><div class="project-actions notranslate">' +
      '<a class="text-border-link compact" href="' + esc(it.github) + '" target="_blank" rel="noopener noreferrer">GitHub</a>' +
      "</div></div>" +
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
    var buttons = hasAll ? [allLabel].concat(tagList) : tagList;
    var initial = hasAll ? allLabel : (tagList[0] || null);

    if (tagRowEl) {
      tagRowEl.innerHTML = buttons.map(function (t, i) {
        return (
          '<button type="button" class="text-border-link tag' + (i === 0 ? " active" : "") +
          '" data-tag="' + esc(t) + '">#' + esc(t) + "</button>"
        );
      }).join("");
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
        var bs = tagRowEl.querySelectorAll(".tag");
        for (var i = 0; i < bs.length; i++) bs[i].classList.remove("active");
        btn.classList.add("active");
        draw(btn.getAttribute("data-tag"));
      });
    }

    draw(initial);
  }

  window.renderSection = render;

  /* Convenience wrappers (Home uses #Recent, index pages use #All). */
  window.renderHomeSection = function (key, tagRowEl, cardsEl, limit) {
    render(key, cardsEl, { card: "mini", limit: limit || 5, tagRow: tagRowEl, allLabel: "Recent" });
  };
  window.renderGrid = function (key, gridEl, tagRowEl) {
    render(key, gridEl, { card: "article", limit: 0, tagRow: tagRowEl, allLabel: "All" });
  };

  /* Sets a "+N" count element's text from a section's item count. */
  window.setCount = function (el, key) {
    if (el && DATA[key]) el.textContent = DATA[key].items.length;
  };
})();
