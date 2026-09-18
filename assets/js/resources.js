document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-resources-root]");
  if (!root || !window.CS_RESOURCES) return;

  const lang = root.dataset.lang === "en" ? "en" : (root.dataset.lang === "zh" ? "zh" : (root.dataset.lang === "ja" ? "ja" : "ko"));
  const isEn = lang === "en";
  const isZh = lang === "zh";
  const isJa = lang === "ja";
  const docBase = root.dataset.docBase || "";

  const CAT_LABELS = isEn
    ? { all: "All", catalog: "Catalog", manual: "Manual", drawing: "Drawing", video: "Video", software: "Software" }
    : isZh
    ? { all: "全部", catalog: "产品目录", manual: "使用手册", drawing: "图纸", video: "视频", software: "运行软件" }
    : isJa
    ? { all: "全て", catalog: "カタログ", manual: "マニュアル", drawing: "図面", video: "動画", software: "運転ソフトウェア" }
    : { all: "전체", catalog: "카탈로그", manual: "매뉴얼", drawing: "도면", video: "동영상", software: "운전소프트웨어" };

  const tabsEl = root.querySelector("[data-tabs]");
  const productsEl = root.querySelector("[data-products]");
  const searchEl = root.querySelector("[data-search]");
  const countEl = root.querySelector("[data-count]");
  const listEl = root.querySelector("[data-list]");

  const ALL_LABEL = isEn ? "All" : isZh ? "全部" : isJa ? "全て" : "전체";
  const PRODUCT_ALL_LABEL = isEn ? "All Products" : isZh ? "全部产品" : isJa ? "すべての製品" : "모든 제품";

  const CATS = ["all", "catalog", "manual", "drawing", "video", "software"];
  let activeCat = "all";
  let activeSlug = "all";

  CATS.forEach((cat) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.cat = cat;
    btn.textContent = CAT_LABELS[cat];
    if (cat === "all") btn.classList.add("active");
    btn.addEventListener("click", () => {
      activeCat = cat;
      tabsEl.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
      render();
    });
    tabsEl.appendChild(btn);
  });

  // 제품별 필터 칩: 자료가 실제로 있는 제품만 슬러그 기준으로 자동 수집한다.
  // 800S package / 800S-5AX는 하나의 "800S" 칩으로 합쳐서 보여준다.
  const PRODUCT_GROUPS = {
    "800s": { slugs: ["800s-package", "800s-5ax"], label_ko: "800S", label_en: "800S" }
  };
  const SLUG_TO_GROUP = {};
  Object.keys(PRODUCT_GROUPS).forEach((gid) => {
    PRODUCT_GROUPS[gid].slugs.forEach((s) => { SLUG_TO_GROUP[s] = gid; });
  });

  // 칩에 표시할 이름이 너무 길어(제품 설명 포함) 축약해서 보여줄 슬러그별 짧은 이름
  const CHIP_LABEL_OVERRIDES = {
    "cpack": { ko: "CPACK", en: "CPACK" },
    "900d": { ko: "900d", en: "900d" },
    "edio7246": { ko: "EDIO 72/46", en: "EDIO 72/46" },
    "edio6432": { ko: "EDIO 64/64, 32/32", en: "EDIO 64/64, 32/32" },
    "edio-inout": { ko: "EDIO IN32, OUT32, IN16/OUT16", en: "EDIO IN32, OUT32, IN16/OUT16" },
    "aib30": { ko: "AIB 3.0", en: "AIB 3.0" },
    "hx20": { ko: "HX2.0", en: "HX2.0" },
    "servo-drive-motor": { ko: "Servo Motor/Drive", en: "Servo Motor/Drive" },
    "stepservo": { ko: "StepServo", en: "StepServo" },
    "hexa": { ko: "HEXA", en: "HEXA" }
  };

  const PRODUCT_ORDER = [
    "cpack", "800s", "hx20", "hx-lite", "gx-series",
    "900d", "900a", "servo-drive-motor", "sdc", "smg-sma", "sd-series",
    "stepservo", "actimo", "edio7246", "edio6432", "edio-inout", "aib30",
    "portablempg", "hexa", "spack"
  ];

  function chipLabelFor(slug) {
    const item = window.CS_RESOURCES.find((r) => r.slug === slug);
    if (!item) return slug;
    const override = CHIP_LABEL_OVERRIDES[slug];
    if (override) return (isEn || isZh || isJa) ? override.en : override.ko;
    return (isEn || isZh || isJa) ? item.product_en : item.product_ko;
  }

  const presentSlugs = new Set();
  window.CS_RESOURCES.forEach((item) => { if (item.slug) presentSlugs.add(item.slug); });

  // chipId -> { label, slugs: [실제 slug 목록] }
  const chipMap = new Map();
  presentSlugs.forEach((slug) => {
    const gid = SLUG_TO_GROUP[slug];
    if (gid) {
      if (!chipMap.has(gid)) {
        chipMap.set(gid, { label: (isEn || isZh || isJa) ? PRODUCT_GROUPS[gid].label_en : PRODUCT_GROUPS[gid].label_ko, slugs: [] });
      }
      chipMap.get(gid).slugs.push(slug);
    } else {
      chipMap.set(slug, { label: chipLabelFor(slug), slugs: [slug] });
    }
  });

  const orderedChipIds = PRODUCT_ORDER.filter((id) => chipMap.has(id));
  chipMap.forEach((_, id) => { if (!orderedChipIds.includes(id)) orderedChipIds.push(id); });

  if (productsEl) {
    const allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.dataset.slug = "all";
    allBtn.textContent = PRODUCT_ALL_LABEL;
    allBtn.classList.add("active");
    allBtn.addEventListener("click", () => {
      activeSlug = "all";
      productsEl.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === allBtn));
      render();
    });
    productsEl.appendChild(allBtn);

    orderedChipIds.forEach((chipId) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.slug = chipId;
      btn.textContent = chipMap.get(chipId).label;
      btn.addEventListener("click", () => {
        activeSlug = chipId;
        productsEl.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
        render();
      });
      productsEl.appendChild(btn);
    });
  }

  function matchesProduct(item) {
    if (activeSlug === "all") return true;
    const chip = chipMap.get(activeSlug);
    if (!chip) return true;
    return chip.slugs.includes(item.slug);
  }

  function resolveHref(item) {
    if (item.ext === "YouTube") return item.href;
    return docBase + item.href;
  }

  function matchesSearch(item, q) {
    if (!q) return true;
    const hay = [
      (isEn || isZh || isJa) ? item.title_en : item.title_ko,
      (isEn || isZh || isJa) ? item.product_en : item.product_ko,
      item.slug,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q.toLowerCase());
  }

  function render() {
    const q = (searchEl.value || "").trim();
    const seenHref = new Set();
    const items = window.CS_RESOURCES.filter(
      (item) =>
        (activeCat === "all" || item.category === activeCat) &&
        matchesProduct(item) &&
        matchesSearch(item, q)
    ).filter((item) => {
      // 같은 제품군(칩) 내에서 서로 다른 slug가 동일한 파일을 공유하는 경우
      // (예: 800s-package / 800s-5ax) 목록에 중복으로 나타나지 않도록 href 기준으로 한 번만 표시
      if (seenHref.has(item.href)) return false;
      seenHref.add(item.href);
      return true;
    });

    countEl.textContent = isEn
      ? `${items.length} of ${window.CS_RESOURCES.length} resources`
      : isZh
      ? `共 ${window.CS_RESOURCES.length} 项中的 ${items.length} 项`
      : isJa
      ? `全${window.CS_RESOURCES.length}件中${items.length}件`
      : `전체 ${window.CS_RESOURCES.length}건 중 ${items.length}건`;

    listEl.innerHTML = "";
    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "resources-empty";
      empty.textContent = isEn
        ? "No resources match your search."
        : isZh
        ? "没有找到匹配的资料。"
        : isJa
        ? "検索結果がありません。"
        : "검색 결과가 없습니다.";
      listEl.appendChild(empty);
      return;
    }

    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "resource-row";

      const main = document.createElement("div");
      main.className = "r-main";
      const title = document.createElement("div");
      title.className = "r-title";
      const baseTitle = (isEn || isZh || isJa) ? item.title_en : item.title_ko;
      // 도면은 같은 자료가 PDF/DWG 두 가지 파일로 존재하는 경우가 많아 제목 뒤에 형식을 표시한다.
      const showExtSuffix = item.category === "drawing" && (item.ext === "PDF" || item.ext === "DWG");
      title.textContent = showExtSuffix ? `${baseTitle} (${item.ext})` : baseTitle;
      main.appendChild(title);

      const meta = document.createElement("div");
      meta.className = "r-meta";
      const metaParts = [
        item.ext === "YouTube" ? (isEn ? "Video" : isZh ? "视频" : isJa ? "動画" : "동영상") : item.ext,
        CAT_LABELS[item.category] || item.category,
        item.date,
      ];
      meta.textContent = metaParts.join(" · ");
      main.appendChild(meta);
      row.appendChild(main);

      const size = document.createElement("div");
      size.className = "r-size";
      size.textContent = item.size || (item.ext === "YouTube" ? "YouTube" : "");
      row.appendChild(size);

      const dl = document.createElement("a");
      dl.className = "r-download";
      dl.href = resolveHref(item);
      if (item.ext === "YouTube") {
        dl.target = "_blank";
        dl.rel = "noopener";
        dl.textContent = isEn ? "Watch" : isZh ? "观看" : isJa ? "見る" : "보기";
      } else {
        dl.target = "_blank";
        dl.rel = "noopener";
        dl.textContent = isEn ? "Download" : isZh ? "下载" : isJa ? "ダウンロード" : "다운로드";
      }
      row.appendChild(dl);

      listEl.appendChild(row);
    });
  }

  searchEl.addEventListener("input", render);

  const params = new URLSearchParams(window.location.search);
  const qParam = params.get("q");
  if (qParam) searchEl.value = qParam;
  const catParam = params.get("cat");
  if (catParam && CATS.includes(catParam)) {
    activeCat = catParam;
    tabsEl.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b.dataset.cat === catParam));
  }
  const productParam = params.get("product");
  if (productParam && productsEl && chipMap.has(productParam)) {
    activeSlug = productParam;
    productsEl.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b.dataset.slug === productParam));
  }

  render();
});
