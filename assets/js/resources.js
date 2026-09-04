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
  const searchEl = root.querySelector("[data-search]");
  const countEl = root.querySelector("[data-count]");
  const listEl = root.querySelector("[data-list]");

  const CATS = ["all", "catalog", "manual", "drawing", "video", "software"];
  let activeCat = "all";

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
    const items = window.CS_RESOURCES.filter(
      (item) => (activeCat === "all" || item.category === activeCat) && matchesSearch(item, q)
    );

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
      title.textContent = (isEn || isZh || isJa) ? item.title_en : item.title_ko;
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

  render();
});
