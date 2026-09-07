/* 세 언어를 사람이 쓴다 — 구글 위젯은 나머지 열한 언어를 맡는다.
 *
 * 왜 이 파일이 있나
 * -----------------
 * 이 사이트의 한국어·일본어는 두 가지 방식으로 만들어진다.
 *
 *   기사   `*.ko.html` · `*.ja.html` 을 손으로 쓴다. `lang.js` 가 그리로 **이동**시킨다.
 *   나머지 홈·섹션 목록·태그 페이지는 한 장뿐이다. 여기 문자열을 **바꿔 끼운다**.
 *
 * 두 번째가 없던 동안 홈과 목록은 **구글 위젯**에 맡겨져 있었고, 그건 두 가지를 못 했다.
 *
 *   1. 카드 제목에 `notranslate` 가 붙어 있다(고유명사가 뭉개지지 않게 하려고). 그래서 한국어
 *      독자에게도 **제목만 영어로 남았다.**
 *   2. 위젯은 없는 것을 만들지 못한다. 용어 노트는 한국어로 쓰여 있는데 파일 이름에 언어가 없어서
 *      **영어 독자에게 한국어가 그대로 나갔다.**
 *
 * 그래서 규칙을 하나로 정한다: **ko·en·ja 는 사람이 쓴 것만 보여 준다.** 페이지 변형이 있으면
 * 그리로 가고, 없으면 이 표로 바꿔 끼운다. 둘 다 없을 때만 위젯이 나선다. 위젯이 도는 언어는
 * 나머지 열한 개다.
 *
 * 마크업 규약
 * -----------
 *   <a data-i18n="nav.about">About</a>          텍스트를 바꾼다
 *   <p data-i18n-html="home.aboutP1">…</p>      HTML 을 바꾼다(강조·줄바꿈이 있는 문장)
 *   <a data-i18n-attr="title:a11y.home">        속성을 바꾼다. "속성:키" 를 세미콜론으로 여러 개
 *   <html data-i18n-full="ko ja">               이 페이지는 그 언어들에서 **위젯이 필요 없다**
 *
 * HTML 에는 **영어 원문을 그대로 남긴다.** 자바스크립트가 죽어도 페이지는 영어로 읽히고,
 * 검색엔진과 링크 미리보기도 영어를 본다. 키가 표에 없으면 원문이 그대로 남는다.
 */
var I18N = (function () {
  "use strict";

  /* 표. 영어는 HTML 안에 이미 있으므로 여기에는 **바꿔 끼울 언어만** 적는다 —
     영어를 여기에도 적으면 같은 문장이 두 군데가 되고, 곧 둘이 달라진다. */
  var DICT = {
    ko: {
      "cards.personal": "개인 프로젝트",
      "cards.commercial": "사업화 프로젝트",
      "cards.company": "회사 업무",
      "cards.companyAuthor": "회사",
      "cards.main": "메인 프로젝트",
      "cards.solo": "1인",
      "facet.area": "영역",
      "facet.kind": "분류",
      "facet.other": "기타",
      "facet.perspective": "관점",
      "facet.term": "용어",
      "tag.soonBody": "관련 글을 여기에 모읍니다.",
      "tag.soon": "준비 중",
      "tag.lead": "이 태그가 붙은 글이 여기 모입니다.",
      "back.writing": "글 목록으로",
      "back.notes": "노트 목록으로",
      "a11y.email": "이메일",
      "a11y.filterTag": "태그로 거르기",
      "a11y.home": "이광훈 홈",
      "a11y.lang": "언어 선택",
      "a11y.nav": "주 메뉴",
      "back.home": "홈으로",
      "cards.all": "전체",
      "cards.private": "비공개",
      "cards.recent": "최근",
      "cv.career": "경력",
      "cv.certs": "자격증과 수료",
      "cv.current": "현재",
      "cv.download": "이력서 내려받기",
      "cv.edu1": "컴퓨터공학 학사",
      "cv.edu1d": "학교·전공·관심 분야를 여기에 적습니다.",
      "cv.education": "학력",
      "cv.role1": "AI 인프라 엔지니어",
      "cv.role1d": "인프라 성격의 백엔드 시스템, Kubernetes control plane, GPUaaS 플랫폼, 신뢰성 엔지니어링.",
      "cv.role2": "지금 보고 있는 것",
      "cv.role2d": "GPUaaS, Kubernetes 기반 control plane, AI 인프라, 추론 플랫폼, 관측.",
      "cv.role3": "홈페이지와 글",
      "cv.role3d": "이 사이트에서 프로젝트와 기술 글, 엔지니어링 노트를 이어서 정리합니다.",
      "footer.built": "© 2026 이광훈. GitHub Pages 로 만들었습니다.",
      "home.about1": "control plane과 운영 신뢰성, Kubernetes 기반 플랫폼, 그리고 컴퓨트·스토리지·인증·관측을 다루는 실서비스 인터페이스를 중심으로 인프라 성격의 백엔드 시스템을 만듭니다.",
      "home.about2": "지금은 클라우드 백엔드 엔지니어링을 AI 인프라·추론 플랫폼·테넌트 거버넌스·워크로드 운영과 잇는 GPUaaS 프로젝트를 만들고 있습니다.",
      "home.cv": "이력",
      "home.highlights": "요즘 하는 일",
      "home.hl1": "Kubernetes 기반 GPUaaS control plane를 만들고 있습니다.",
      "home.hl2": "GPU 스케줄링과 추론 서빙에 대한 노트를 씁니다.",
      "home.hl3": "AI 인프라 포트폴리오 프로젝트를 준비하고 있습니다.",
      "home.more": "더 보기",
      "home.news": "소식",
      "home.notes": "노트",
      "home.projects": "프로젝트",
      "home.role": "AI 인프라 엔지니어",
      "home.writing": "글",
      "nav.about": "소개",
      "nav.cv": "이력",
      "nav.news": "소식",
      "nav.notes": "노트",
      "nav.projects": "프로젝트",
      "nav.writing": "글",
      "news.lead": "발행과 정정 기록입니다.",
      "news.title": "소식",
      "notes.lead": "글에 나오는 용어를 짧게 정리한 노트입니다. 각 용어에서 그 용어가 실제로 문제가 됐던 글로 이어집니다.",
      "notes.title": "노트",
      "projects.lead": "지금 만들고 있는 것과 회사에서 한 일입니다. 각 항목에 어디까지 확인했는지 적어 둡니다.",
      "projects.title": "프로젝트",
      "writing.lead": "클라우드 백엔드 시스템, GPU 인프라, Kubernetes control plane, 관측에 대해 골라 쓴 기술 글입니다.",
      "writing.title": "글"
    },
    ja: {
      "cards.personal": "個人プロジェクト",
      "cards.commercial": "事業化プロジェクト",
      "cards.company": "会社の業務",
      "cards.companyAuthor": "会社",
      "cards.main": "メインプロジェクト",
      "cards.solo": "個人",
      "facet.area": "領域",
      "facet.kind": "分類",
      "facet.other": "その他",
      "facet.perspective": "観点",
      "facet.term": "用語",
      "tag.soonBody": "関連する記事をここにまとめます。",
      "tag.soon": "準備中",
      "tag.lead": "このタグの付いた記事がここに集まります。",
      "back.writing": "記事一覧へ",
      "back.notes": "ノート一覧へ",
      "a11y.email": "メール",
      "a11y.filterTag": "タグで絞り込む",
      "a11y.home": "イ・グァンフン ホーム",
      "a11y.lang": "言語を選ぶ",
      "a11y.nav": "メインメニュー",
      "back.home": "ホームへ",
      "cards.all": "すべて",
      "cards.private": "非公開",
      "cards.recent": "最近",
      "cv.career": "職歴",
      "cv.certs": "資格と受講",
      "cv.current": "現在",
      "cv.download": "履歴書をダウンロード",
      "cv.edu1": "コンピュータ工学 学士",
      "cv.edu1d": "大学・専攻・関心分野をここに書きます。",
      "cv.education": "学歴",
      "cv.role1": "AI インフラエンジニア",
      "cv.role1d": "インフラ寄りのバックエンド、Kubernetes コントロールプレーン、GPUaaS プラットフォーム、信頼性エンジニアリング。",
      "cv.role2": "いま見ているもの",
      "cv.role2d": "GPUaaS、Kubernetes ネイティブなコントロールプレーン、AI インフラ、推論プラットフォーム、可観測性。",
      "cv.role3": "ホームページと記事",
      "cv.role3d": "このサイトでプロジェクトと技術記事、エンジニアリングノートを続けて整理しています。",
      "footer.built": "© 2026 イ・グァンフン. GitHub Pages で作りました。",
      "home.about1": "コントロールプレーンと運用信頼性、Kubernetes ベースのプラットフォーム、そしてコンピュート・ストレージ・認証・可観測性を扱う実運用インターフェースを中心に、インフラ寄りのバックエンドを作っています。",
      "home.about2": "いまはクラウドバックエンドを AI インフラ・推論プラットフォーム・テナントガバナンス・ワークロード運用につなぐ GPUaaS プロジェクトを作っています。",
      "home.cv": "経歴",
      "home.highlights": "いま取り組んでいること",
      "home.hl1": "Kubernetes ネイティブな GPUaaS コントロールプレーンを作っています。",
      "home.hl2": "GPU スケジューリングと推論サービングのノートを書いています。",
      "home.hl3": "AI インフラのポートフォリオを準備しています。",
      "home.more": "もっと見る",
      "home.news": "お知らせ",
      "home.notes": "ノート",
      "home.projects": "プロジェクト",
      "home.role": "AI インフラエンジニア",
      "home.writing": "記事",
      "nav.about": "プロフィール",
      "nav.cv": "経歴",
      "nav.news": "お知らせ",
      "nav.notes": "ノート",
      "nav.projects": "プロジェクト",
      "nav.writing": "記事",
      "news.lead": "公開と訂正の記録です。",
      "news.title": "お知らせ",
      "notes.lead": "記事に出てくる用語を短くまとめたノートです。各用語から、それが実際に問題になった記事へつながります。",
      "notes.title": "ノート",
      "projects.lead": "いま作っているものと、会社でやった仕事です。それぞれどこまで確かめたかを書いています。",
      "projects.title": "プロジェクト",
      "writing.lead": "クラウドバックエンド、GPU インフラ、Kubernetes コントロールプレーン、可観測性について選んで書いた技術記事です。",
      "writing.title": "記事"
    }
  };

  /* 읽는 사람이 원하는 언어. `lang.js` 와 **같은 열쇠**를 본다 — 두 파일이 각자 판단하면
     언어 선택기와 본문이 어긋나는 날이 온다. */
  var PREF_KEY = "lang.pref";

  function storedPref() {
    try { return localStorage.getItem(PREF_KEY); } catch (e) { return null; }
  }

  /* 순수 함수로 빼 둔다(tools/test-i18n.js 가 node 에서 이걸 돌린다).
     페이지가 이미 그 언어로 쓰여 있으면 바꿀 것이 없다 — 표를 덮어씌우면 손으로 쓴 문장이
     표의 문장으로 **덮인다.** */
  /* ⚠️ 「페이지가 이미 그 언어면 건너뛴다」로 쓰면 안 된다. `*.ko.html` 은 **본문만** 한국어였고
     상단 메뉴·바닥글·「Back to Home」은 전부 영어였다. 바꿔 끼울 대상은 페이지의 언어가 아니라
     **읽는 사람의 언어**다. 선호가 없으면 이 페이지의 언어가 곧 그 사람의 언어다. */
  function resolve(pageLang, pref) {
    var want = String(pref || pageLang || "en").toLowerCase();
    return Object.prototype.hasOwnProperty.call(DICT, want) ? want : null;
  }

  function t(key, lang) {
    var table = DICT[lang];
    return table && Object.prototype.hasOwnProperty.call(table, key) ? table[key] : null;
  }

  /* 항목의 한 필드를 언어에 맞게 고른다. `desc_ko` 가 없으면 `desc` 가 남는다 —
     번역이 밀렸다고 카드가 비면 목록이 깨진 것처럼 보인다. */
  function pick(obj, field, lang) {
    if (!obj) return "";
    if (lang) {
      var k = field + "_" + lang;
      if (obj[k]) return obj[k];
    }
    return obj[field] || "";
  }

  function apply(root, lang) {
    if (!lang) return 0;
    var n = 0;
    var scope = root || document;

    var texts = scope.querySelectorAll("[data-i18n]");
    for (var i = 0; i < texts.length; i++) {
      var v = t(texts[i].getAttribute("data-i18n"), lang);
      if (v !== null) { texts[i].textContent = v; n++; }
    }

    var htmls = scope.querySelectorAll("[data-i18n-html]");
    for (var j = 0; j < htmls.length; j++) {
      var h = t(htmls[j].getAttribute("data-i18n-html"), lang);
      if (h !== null) { htmls[j].innerHTML = h; n++; }
    }

    /* 속성은 "aria-label:a11y.nav; title:a11y.nav" 처럼 적는다. 화면에 안 보이는 문자열도
       읽어 주는 사람에게는 본문이다. */
    var attrs = scope.querySelectorAll("[data-i18n-attr]");
    for (var k = 0; k < attrs.length; k++) {
      var spec = attrs[k].getAttribute("data-i18n-attr").split(";");
      for (var m = 0; m < spec.length; m++) {
        var pair = spec[m].split(":");
        if (pair.length !== 2) continue;
        var val = t(pair[1].trim(), lang);
        if (val !== null) { attrs[k].setAttribute(pair[0].trim(), val); n++; }
      }
    }
    return n;
  }

  var api = {
    DICT: DICT,
    resolve: resolve,
    t: t,
    pick: pick,
    apply: apply,
    lang: null      // 이번 로드에서 실제로 바꿔 끼운 언어. content.js 가 카드에 쓴다.
  };

  if (typeof document !== "undefined") {
    var pageLang = (document.documentElement.getAttribute("lang") || "en").toLowerCase();
    api.lang = resolve(pageLang, storedPref());
    /* 표를 먼저 입히고 나서 카드가 그려지도록, 이 파일은 content.js **앞에** 둔다.
       뒤에 두면 카드가 영어로 한 번 그려졌다가 바뀌어 깜빡인다. */
    if (api.lang) apply(document, api.lang);
  }

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  return api;
})();
