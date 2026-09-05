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
      items: [
        {
          title: "The Only Control That Has Ever Caught a Cost Error",
          url: "writing/the-only-control-that-caught-something.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "Several layers of cost control on a GPU lab account, and the one that caught something was a hand-made budget alert Terraform nearly deleted. Also in Korean and Japanese.",
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
          title: "Parallelising It Made the Tail Three Times Worse",
          url: "writing/parallelism-made-the-tail-worse.html",
          date: "2026-09", dateLabel: "Sep 2026",
          desc: "Parallelising without a cache took p99 from 42s to 129s. An external call inside computeIfAbsent, and the six-configuration test that made it visible. Also in Korean and Japanese.",
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
    return (
      '<div class="dated-card"><article class="content-card' + (it.url ? " is-linked" : "") + '">' +
      '<div class="project-image" aria-hidden="true"></div>' +
      '<div class="card-content"><div class="project-top"><div>' +
      '<div class="label notranslate">' + esc(it.label) + "</div>" +
      '<h3 class="card-title notranslate">' + title + "</h3>" +
      '<p class="authors notranslate">' + esc(it.authors) + "</p>" +
      '<span class="card-date notranslate">' + esc(it.dateLabel) + "</span>" +
      '</div><div class="project-actions notranslate">' +
      githubLink(it.github, esc(it.title) + " on GitHub") +
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
