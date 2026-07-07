// ============================================================
// LEGO Preis-Leistungs-Finder – App-Logik
// ============================================================
// Verbindet die Merkliste (data/sets.js) mit den automatisch
// geholten Live-Daten (data/prices.js), berechnet pro Set einen
// Preis-Leistungs-Score (0–10) und rendert Filter + Karten.
// Gewichtungen und Filter überleben Reloads via localStorage.
// ============================================================

(function () {
  "use strict";

  const STORAGE_KEY = "lego-pl-finder-v1";

  // ---------- Kriterien & Score ----------
  // Jedes Kriterium liefert einen Teil-Score 0–10; der Gesamtscore
  // ist der gewichtete Mittelwert (Gewichte per Regler einstellbar).
  const CRITERIA = [
    {
      id: "ppp",
      label: "Preis pro Teil",
      hint: "10 Punkte bei ≤ 6 ct/Teil, 0 Punkte ab 16 ct/Teil",
      defaultWeight: 30,
      score(s) {
        if (!s.bestPrice || !s.pieces) return null;
        const ct = (s.bestPrice / s.pieces) * 100;
        return clamp(((16 - ct) / 10) * 10, 0, 10);
      },
    },
    {
      id: "discount",
      label: "Rabatt zur UVP",
      hint: "10 Punkte ab 40 % unter UVP",
      defaultWeight: 25,
      score(s) {
        if (!s.bestPrice || !s.uvp) return null;
        const d = 1 - s.bestPrice / s.uvp;
        return clamp((d / 0.4) * 10, 0, 10);
      },
    },
    {
      id: "minifigs",
      label: "Minifiguren fürs Geld",
      hint: "10 Punkte ab 6 Figuren pro 100 €",
      defaultWeight: 15,
      score(s) {
        if (!s.bestPrice) return null;
        const per100 = ((s.minifigs || 0) / s.bestPrice) * 100;
        return clamp((per100 / 6) * 10, 0, 10);
      },
    },
    {
      id: "prints",
      label: "Prints statt Sticker",
      hint: "Deine Bewertung in sets.js (leer = neutral 5)",
      defaultWeight: 10,
      score(s) {
        return s.prints == null ? 5 : clamp(s.prints, 0, 10);
      },
    },
    {
      id: "design",
      label: "Aussehen",
      hint: "Deine Bewertung in sets.js (leer = neutral 5)",
      defaultWeight: 20,
      score(s) {
        return s.design == null ? 5 : clamp(s.design, 0, 10);
      },
    },
  ];

  const SORTS = {
    score: { label: "Bester Score", fn: (a, b) => b.total - a.total },
    ppp: {
      label: "Preis pro Teil",
      fn: (a, b) => (a.centsPerPart ?? 1e9) - (b.centsPerPart ?? 1e9),
    },
    discount: { label: "Höchster Rabatt", fn: (a, b) => (b.discount ?? -1) - (a.discount ?? -1) },
    priceAsc: { label: "Preis aufsteigend", fn: (a, b) => (a.bestPrice ?? 1e9) - (b.bestPrice ?? 1e9) },
    priceDesc: { label: "Preis absteigend", fn: (a, b) => (b.bestPrice ?? -1) - (a.bestPrice ?? -1) },
    pieces: { label: "Meiste Teile", fn: (a, b) => (b.pieces ?? 0) - (a.pieces ?? 0) },
  };

  function clamp(v, lo, hi) {
    return Math.min(hi, Math.max(lo, v));
  }

  // ---------- Zustand ----------
  const defaults = {
    weights: Object.fromEntries(CRITERIA.map((c) => [c.id, c.defaultWeight])),
    search: "",
    theme: "",
    maxPrice: "",
    onlyAvailable: false,
    onlyList: false,
    sort: "score",
    weightsOpen: false,
  };
  const state = { ...defaults, ...load() };
  state.weights = { ...defaults.weights, ...(load().weights || {}) };

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // ---------- Daten zusammenführen ----------
  const watchlist = globalThis.LEGO_SETS || [];
  const priceData = (globalThis.LEGO_PRICES && globalThis.LEGO_PRICES.sets) || {};

  const sets = [];
  const problems = [];
  const onList = new Set();
  for (const entry of watchlist) {
    const nr = String(entry.number);
    onList.add(nr);
    const live = priceData[nr];
    if (!live || live.error) {
      problems.push({ number: nr, error: (live && live.error) || "noch keine Daten geholt" });
      continue;
    }
    sets.push({ ...live, ...entry, number: nr, auto: false });
  }
  // Vom Fetcher automatisch entdeckte Top-Angebote ergänzen
  for (const [nr, live] of Object.entries(priceData)) {
    if (onList.has(nr) || !live || live.error || !live.auto) continue;
    sets.push({ ...live, number: nr });
  }

  function evaluate(s) {
    const w = state.weights;
    let sum = 0;
    let wsum = 0;
    const parts = {};
    for (const c of CRITERIA) {
      const val = c.score(s);
      parts[c.id] = val;
      if (val != null && w[c.id] > 0) {
        sum += val * w[c.id];
        wsum += w[c.id];
      }
    }
    return {
      ...s,
      parts,
      total: wsum ? sum / wsum : 0,
      centsPerPart: s.bestPrice && s.pieces ? (s.bestPrice / s.pieces) * 100 : null,
      discount: s.bestPrice && s.uvp ? 1 - s.bestPrice / s.uvp : null,
    };
  }

  // ---------- Formatierung ----------
  const euro = (v) =>
    v == null ? "–" : v.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
  const pct = (v) => (v == null ? "–" : Math.round(v * 100) + " %");
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

  function scoreColor(v) {
    if (v >= 7.5) return "good";
    if (v >= 5) return "mid";
    return "low";
  }

  // ---------- Rendern: Kopf & Kontrollen ----------
  function renderMeta() {
    const el = document.getElementById("meta");
    const ts = globalThis.LEGO_PRICES && globalThis.LEGO_PRICES.fetchedAt;
    el.textContent = ts
      ? "Preisstand: " + new Date(ts).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" })
      : "Noch keine Preisdaten – einmal `node lego/fetch-prices.js` ausführen.";
  }

  function renderWeights() {
    const body = document.getElementById("weights-body");
    body.innerHTML =
      CRITERIA.map(
        (c) => `
        <label class="weight" title="${esc(c.hint)}">
          <span class="weight__label">${esc(c.label)}
            <span class="weight__value" id="wv-${c.id}">${state.weights[c.id]}</span>
          </span>
          <input type="range" min="0" max="100" step="5" value="${state.weights[c.id]}" data-weight="${c.id}" />
          <span class="weight__hint">${esc(c.hint)}</span>
        </label>`
      ).join("") +
      `<button class="btn btn--ghost" id="weights-reset" type="button">Zurücksetzen</button>`;

    body.querySelectorAll("input[data-weight]").forEach((input) => {
      input.addEventListener("input", () => {
        state.weights[input.dataset.weight] = Number(input.value);
        document.getElementById("wv-" + input.dataset.weight).textContent = input.value;
        save();
        renderResults();
      });
    });
    document.getElementById("weights-reset").addEventListener("click", () => {
      state.weights = { ...defaults.weights };
      save();
      renderWeights();
      renderResults();
    });

    document.getElementById("weights-body").style.display = state.weightsOpen ? "" : "none";
    document.getElementById("weights-caret").textContent = state.weightsOpen ? "▴" : "▾";
  }

  function renderControls() {
    const themes = [...new Set(sets.map((s) => s.theme).filter(Boolean))].sort();
    const el = document.getElementById("controls");
    el.innerHTML = `
      <input type="search" id="f-search" placeholder="Set suchen …" value="${esc(state.search)}" />
      <select id="f-theme">
        <option value="">Alle Themen</option>
        ${themes
          .map((t) => `<option value="${esc(t)}" ${t === state.theme ? "selected" : ""}>${esc(t)}</option>`)
          .join("")}
      </select>
      <input type="number" id="f-maxprice" min="0" step="10" placeholder="max. Preis €" value="${esc(state.maxPrice)}" />
      <label class="check"><input type="checkbox" id="f-avail" ${state.onlyAvailable ? "checked" : ""}/> nur lieferbare</label>
      <label class="check" title="Automatisch entdeckte Top-Angebote ausblenden"><input type="checkbox" id="f-list" ${state.onlyList ? "checked" : ""}/> nur Merkliste</label>
      <select id="f-sort">
        ${Object.entries(SORTS)
          .map(([k, v]) => `<option value="${k}" ${k === state.sort ? "selected" : ""}>${esc(v.label)}</option>`)
          .join("")}
      </select>`;

    const bind = (id, key, evt = "input") =>
      document.getElementById(id).addEventListener(evt, (e) => {
        state[key] = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        save();
        renderResults();
      });
    bind("f-search", "search");
    bind("f-theme", "theme", "change");
    bind("f-maxprice", "maxPrice");
    bind("f-avail", "onlyAvailable", "change");
    bind("f-list", "onlyList", "change");
    bind("f-sort", "sort", "change");
  }

  // ---------- Rendern: Karten ----------
  function card(s, rank) {
    const badge = scoreColor(s.total);
    const bars = CRITERIA.map((c) => {
      const v = s.parts[c.id];
      return `
        <div class="bar" title="${esc(c.label)}: ${v == null ? "n. a." : v.toFixed(1)} / 10">
          <span class="bar__label">${esc(c.label)}</span>
          <span class="bar__track"><span class="bar__fill" style="width:${v == null ? 0 : v * 10}%"></span></span>
          <span class="bar__num">${v == null ? "–" : v.toFixed(1)}</span>
        </div>`;
    }).join("");

    const saving =
      s.discount != null && s.discount > 0.005
        ? `<span class="price__uvp">UVP ${euro(s.uvp)}</span> <span class="price__save">−${pct(s.discount)}</span>`
        : `<span class="price__uvp price__uvp--none">UVP ${euro(s.uvp)}</span>`;

    return `
    <article class="card ${s.stale ? "card--stale" : ""}">
      <div class="card__rank">#${rank}</div>
      <div class="card__imgwrap">
        ${s.image ? `<img class="card__img" loading="lazy" referrerpolicy="no-referrer" src="${esc(s.image)}" alt="${esc(s.name)}" onerror="this.remove()" />` : ""}
        <span class="card__score card__score--${badge}" title="Preis-Leistungs-Score (gewichtet)">${s.total.toFixed(1)}</span>
      </div>
      <div class="card__body">
        <div class="card__tags">
          ${s.theme ? `<span class="tag">${esc(s.theme)}</span>` : ""}
          ${s.auto ? `<span class="tag tag--deal" title="Automatisch aus den aktuellen Top-Angeboten entdeckt${s.dealScore ? ` (Deal-Score ${s.dealScore}/100)` : ""}">🔥 Top-Deal</span>` : ""}
          ${s.eol ? `<span class="tag tag--warn" title="Set läuft aus – wird bald nicht mehr produziert">EOL ${esc(s.eol)}</span>` : ""}
          ${!s.available ? `<span class="tag tag--bad">nicht lieferbar</span>` : ""}
          ${s.stale ? `<span class="tag tag--bad" title="Letzter Abruf fehlgeschlagen – Preis evtl. veraltet">Preis veraltet</span>` : ""}
        </div>
        <h2 class="card__title"><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></h2>
        <p class="card__stats">
          ${s.pieces ? `${s.pieces.toLocaleString("de-DE")} Teile` : "Teile n. a."}
          ${s.minifigs ? ` · ${s.minifigs} Minifiguren` : ""}
          ${s.centsPerPart != null ? ` · ${s.centsPerPart.toLocaleString("de-DE", { maximumFractionDigits: 1 })} ct/Teil` : ""}
        </p>
        <div class="price">
          <span class="price__best">${euro(s.bestPrice)}</span>
          ${saving}
        </div>
        <p class="card__offers">${s.offerCount || 0} Angebote im Vergleich ·
          <a href="${esc(s.url)}" target="_blank" rel="noopener">zum besten Shop →</a></p>
        ${s.note ? `<p class="card__note">💬 ${esc(s.note)}</p>` : ""}
        <details class="card__breakdown">
          <summary>Score-Details</summary>
          ${bars}
        </details>
      </div>
    </article>`;
  }

  function renderResults() {
    const q = state.search.trim().toLowerCase();
    const maxP = Number(state.maxPrice) || Infinity;

    let list = sets.map(evaluate).filter((s) => {
      if (q && !(s.name.toLowerCase().includes(q) || s.number.includes(q))) return false;
      if (state.theme && s.theme !== state.theme) return false;
      if (s.bestPrice != null && s.bestPrice > maxP) return false;
      if (state.onlyAvailable && !s.available) return false;
      if (state.onlyList && s.auto) return false;
      return true;
    });
    list.sort((SORTS[state.sort] || SORTS.score).fn);

    const el = document.getElementById("results");
    el.innerHTML = list.length
      ? list.map((s, i) => card(s, i + 1)).join("")
      : `<p class="empty">Keine Sets gefunden – Filter lockern oder Merkliste in <code>lego/data/sets.js</code> füllen.</p>`;
  }

  function renderProblems() {
    const el = document.getElementById("problems");
    if (!problems.length) {
      el.innerHTML = "";
      return;
    }
    el.innerHTML =
      `<h3>⚠️ Ohne Daten (${problems.length})</h3>` +
      `<p>` +
      problems.map((p) => `<code>${esc(p.number)}</code> (${esc(p.error)})`).join(" · ") +
      `</p><p class="small">Setnummer prüfen oder Preis-Update abwarten.</p>`;
  }

  // ---------- Start ----------
  document.getElementById("weights-toggle").addEventListener("click", () => {
    state.weightsOpen = !state.weightsOpen;
    save();
    document.getElementById("weights-body").style.display = state.weightsOpen ? "" : "none";
    document.getElementById("weights-caret").textContent = state.weightsOpen ? "▴" : "▾";
  });

  renderMeta();
  renderWeights();
  renderControls();
  renderResults();
  renderProblems();
})();
