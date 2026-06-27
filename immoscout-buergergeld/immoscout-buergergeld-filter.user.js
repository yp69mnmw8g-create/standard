// ==UserScript==
// @name         ImmoScout24 Bürgergeld-Filter (Bruttokaltmiete-Check)
// @namespace    https://github.com/yp69mnmw8g-create/standard
// @version      2.0.0
// @description  Berechnet auf ImmobilienScout24 automatisch die Bruttokaltmiete (Kaltmiete + kalte Nebenkosten, ohne Heizung) und prüft sie gegen die Jobcenter-Obergrenze der Stadt. Auf Detailseiten als Badge, in der Trefferliste werden passende Anzeigen automatisch grün/rot markiert.
// @author       –
// @match        https://www.immobilienscout24.de/expose/*
// @match        https://www.immobilienscout24.de/Suche/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

/*
 * ─────────────────────────────────────────────────────────────────────────
 *  KONFIGURATION
 * ─────────────────────────────────────────────────────────────────────────
 *  Jobcenter-Obergrenzen (Bruttokaltmiete, 1 Person). Hier kannst du Werte
 *  ändern oder Städte ergänzen. PLZ-Bereiche dienen der zuverlässigen
 *  Stadterkennung (die Adresse auf IS24 schreibt manchmal nur den Ortsteil).
 *
 *  Stand der Werte (bitte gelegentlich prüfen):
 *    Düsseldorf      546 €  (Stand 11/2024)
 *    Wuppertal       466 €  (Stand 01/2025)
 *    Mönchengladbach 500 €
 *    Neuss          ~590 €  (Stand 01.05.2025, lt. Kreis-Vorlage – beim
 *                            Mietkostenrechner des Jobcenters gegenprüfen)
 *    Ratingen        544 €  (Kreis Mettmann, Stand 01.04.2024)
 *    Erkrath         505 €  (Kreis Mettmann, Stand 01.04.2024)
 *    Willich         480 €  (Kreis Viersen, Stand 01.01.2024)
 *    Duisburg        446 €  (Stand 01.08.2025)
 *    Krefeld         540 €  (Stand 01.01.2026)
 *    Mettmann        518 €  (Kreis Mettmann, Stand 01.04.2024)
 */
const CITY_LIMITS = [
  { name: "Düsseldorf",      limit: 546, plz: [[40210, 40629]] },
  { name: "Duisburg",        limit: 446, plz: [[47051, 47279]] },
  { name: "Krefeld",         limit: 540, plz: [[47798, 47839]] },
  { name: "Wuppertal",       limit: 466, plz: [[42103, 42399]] },
  { name: "Mönchengladbach", limit: 500, plz: [[41061, 41239]] },
  { name: "Neuss",           limit: 590, plz: [[41460, 41472]] },
  { name: "Ratingen",        limit: 544, plz: [[40878, 40885]] },
  { name: "Erkrath",         limit: 505, plz: [[40699, 40699]] },
  { name: "Mettmann",        limit: 518, plz: [[40822, 40822]] },
  { name: "Willich",         limit: 480, plz: [[47877, 47877]] },
];

// ── Verhalten der Trefferlisten-Prüfung (Stufe 2) ─────────────────────────
const AUTO_SCAN_LIST = true; // Trefferliste automatisch im Hintergrund prüfen?
const MAX_PARALLEL   = 3;    // gleichzeitige Hintergrund-Abrufe (klein halten!)
const FETCH_DELAY_MS = 250;  // Pause zwischen den Abrufen (gegen Rate-Limit)
const HIDE_OVER_LIMIT = false; // true = zu teure Anzeigen ausblenden statt nur markieren

// ─────────────────────────────────────────────────────────────────────────

"use strict";

/** Wandelt "1.234,56 €" oder "1234.56" → 1234.56 . Gibt null zurück bei keiner Zahl. */
function parseEuro(text) {
  if (text == null) return null;
  let t = String(text).replace(/[^\d.,]/g, "");
  if (!t) return null;
  if (t.includes(",")) {
    // deutsches Format: Punkt = Tausender, Komma = Dezimal
    t = t.replace(/\./g, "").replace(",", ".");
  } else if ((t.match(/\./g) || []).length > 1) {
    // mehrere Punkte → Tausenderpunkte
    t = t.replace(/\./g, "");
  }
  const val = parseFloat(t);
  return Number.isFinite(val) ? val : null;
}

/** Ordnet eine PLZ einer konfigurierten Stadt zu (oder null). */
function cityFromPlz(plz) {
  const n = parseInt(plz, 10);
  if (!Number.isFinite(n)) return null;
  return CITY_LIMITS.find(c => c.plz.some(([lo, hi]) => n >= lo && n <= hi)) || null;
}

function getText(root, sel) {
  const el = root.querySelector(sel);
  return el ? el.textContent : "";
}

/** Liest einen Kostenwert aus einem Dokument: erst IS24-QA-Klasse, sonst Label. */
function readCost(root, qaClass, labelRegex) {
  const el = root.querySelector("." + qaClass);
  if (el) return { num: parseEuro(el.textContent), raw: (el.textContent || "").trim() };
  for (const dt of root.querySelectorAll("dt")) {
    if (labelRegex.test(dt.textContent || "")) {
      const dd = dt.nextElementSibling;
      if (dd) return { num: parseEuro(dd.textContent), raw: (dd.textContent || "").trim() };
    }
  }
  return { num: null, raw: "" };
}

/** Bestimmt die Stadt eines Dokuments per PLZ (zuverlässig) oder Name. */
function detectCity(root) {
  const haystack = [
    getText(root, ".address-block"),
    getText(root, ".zip-region-and-country"),
    getText(root, "h1"),
    root.title || getText(root, "title"),
  ].filter(Boolean).join(" | ");

  for (const m of haystack.matchAll(/\b(\d{5})\b/g)) {
    const hit = cityFromPlz(m[1]);
    if (hit) return hit;
  }
  const lower = haystack.toLowerCase();
  return CITY_LIMITS.find(c => lower.includes(c.name.toLowerCase())) || null;
}

/**
 * Berechnet aus einem Dokument {bruttokalt, method, city, heizInNk}.
 * `root` ist entweder document (Detailseite) oder ein per DOMParser geparstes
 * Dokument einer im Hintergrund geladenen Expose-Seite.
 */
function computeFromDoc(root) {
  const kalt = readCost(root, "is24qa-kaltmiete", /kaltmiete/i);
  const nk   = readCost(root, "is24qa-nebenkosten", /nebenkosten/i);
  const heiz = readCost(root, "is24qa-heizkosten", /heizkosten/i);
  const warm = readCost(root, "is24qa-warmmiete", /warmmiete|gesamtmiete/i);

  let bruttokalt = null, method = "";
  if (kalt.num != null && nk.num != null) {
    bruttokalt = kalt.num + nk.num; method = "Kaltmiete + Nebenkosten";
  } else if (warm.num != null && heiz.num != null) {
    bruttokalt = warm.num - heiz.num; method = "Warmmiete − Heizkosten";
  } else if (kalt.num != null) {
    bruttokalt = kalt.num; method = "nur Kaltmiete (NK fehlen!)";
  }
  const heizInNk = /nebenkosten/i.test(heiz.raw) || /heiz/i.test(nk.raw);
  return { bruttokalt, method, city: detectCity(root), heizInNk };
}

/**
 * Parst rohes Expose-HTML. Bevorzugt das eingebettete utag_data-Objekt
 * (zuverlässiger als DOM-Scraping), fällt sonst auf DOMParser zurück.
 */
function parseExposeHtml(html) {
  const num = (key) => {
    const m = html.match(new RegExp('"?' + key + '"?\\s*[:=]\\s*"?([\\d.,]+)'));
    return m ? parseEuro(m[1]) : null;
  };
  const baseRent   = num("obj_baseRent");
  const service    = num("obj_serviceCharge");
  const heating    = num("obj_heatingCosts");
  const totalRent  = num("obj_totalRent");
  const zipM       = html.match(/"?obj_zip"?\s*[:=]\s*"?(\d{5})/);

  let bruttokalt = null, method = "";
  if (baseRent != null && service != null) {
    bruttokalt = baseRent + service; method = "Kaltmiete + Nebenkosten";
  } else if (totalRent != null && heating != null) {
    bruttokalt = totalRent - heating; method = "Warmmiete − Heizkosten";
  } else if (baseRent != null) {
    bruttokalt = baseRent; method = "nur Kaltmiete (NK fehlen!)";
  }

  let city = zipM ? cityFromPlz(zipM[1]) : null;

  // Fallback über DOMParser, falls utag nichts hergab
  if (bruttokalt == null || !city) {
    try {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const r = computeFromDoc(doc);
      if (bruttokalt == null) { bruttokalt = r.bruttokalt; method = r.method; }
      if (!city) city = r.city;
    } catch (_) { /* ignore */ }
  }
  return { bruttokalt, method, city };
}

// ── Anzeige ───────────────────────────────────────────────────────────────
const STYLE = {
  ok:   "background:#1b7e3c;",
  bad:  "background:#b3261e;",
  warn: "background:#9a6700;",
  base: "position:fixed;top:12px;right:12px;z-index:2147483647;color:#fff;" +
        "font:600 14px/1.35 system-ui,Arial,sans-serif;padding:12px 14px;" +
        "border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.3);max-width:300px;" +
        "cursor:pointer;",
};

function renderBadge(state, lines) {
  let box = document.getElementById("bg-bruttokalt-badge");
  if (!box) {
    box = document.createElement("div");
    box.id = "bg-bruttokalt-badge";
    box.title = "Klicken zum Ausblenden";
    box.addEventListener("click", () => box.remove());
    document.body.appendChild(box);
  }
  box.setAttribute("style", STYLE.base + (STYLE[state] || STYLE.warn));
  box.innerHTML = lines.map(l => `<div>${l}</div>`).join("");
}

function fmt(n) {
  return n == null ? "–" : n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

// ── Detailseite ─────────────────────────────────────────────────────────--
function checkExpose() {
  const { bruttokalt, method, city, heizInNk } = computeFromDoc(document);
  if (bruttokalt == null) {
    renderBadge("warn", ["⚠️ Bruttokalt nicht berechenbar", "Kostenaufschlüsselung nicht gefunden."]);
    return;
  }
  const lines = [
    `<b>Bruttokalt: ${fmt(bruttokalt)}</b>`,
    `<span style="font-weight:400;opacity:.9">${method}</span>`,
  ];
  if (!city) {
    lines.push(`<span style="font-weight:400">Stadt unbekannt – keine Grenze hinterlegt.</span>`);
    renderBadge("warn", lines);
    return;
  }
  const diff = city.limit - bruttokalt;
  const within = diff >= 0;
  lines.push(
    `<span style="font-weight:400">${city.name}: Grenze ${fmt(city.limit)}</span>`,
    within ? `✅ ${fmt(diff)} unter der Grenze` : `❌ ${fmt(-diff)} über der Grenze`
  );
  if (heizInNk) {
    lines.push(`<span style="font-weight:400;opacity:.9">ℹ️ Heizung evtl. in NK enthalten → echte Bruttokalt ggf. niedriger.</span>`);
  }
  renderBadge(within ? "ok" : "bad", lines);
}

// ── Trefferliste (Stufe 2): Hintergrund-Abruf + Markierung ─────────────────
const cache = new Map();          // exposeId → Ergebnis
let blocked = false;              // true, sobald IS24 uns ausbremst (CAPTCHA)
let stats = { done: 0, total: 0 };

function cacheGet(id) {
  if (cache.has(id)) return cache.get(id);
  try {
    const s = sessionStorage.getItem("bg_expose_" + id);
    if (s) { const v = JSON.parse(s); cache.set(id, v); return v; }
  } catch (_) {}
  return null;
}
function cacheSet(id, v) {
  cache.set(id, v);
  try { sessionStorage.setItem("bg_expose_" + id, JSON.stringify(v)); } catch (_) {}
}

// Einfacher Abruf-Pool mit begrenzter Parallelität + Drosselung
const queue = [];
let active = 0;
function pump() {
  while (!blocked && active < MAX_PARALLEL && queue.length) {
    const job = queue.shift();
    active++;
    job().finally(() => { active--; setTimeout(pump, FETCH_DELAY_MS); });
  }
  updateListBadge();
}

async function fetchExpose(id) {
  const hit = cacheGet(id);
  if (hit) return hit;
  const res = await fetch("/expose/" + id, { credentials: "include", headers: { Accept: "text/html" } });
  const html = await res.text();
  // CAPTCHA / Blockade erkennen
  if (res.status !== 200 || /geo\.captcha|are you human|zur Bestätigung, dass Sie kein/i.test(html)) {
    blocked = true;
    throw new Error("blocked");
  }
  const data = parseExposeHtml(html);
  cacheSet(id, data);
  return data;
}

function annotateCard(card, data) {
  card.querySelectorAll(".bg-card-badge").forEach(e => e.remove());
  const badge = document.createElement("div");
  badge.className = "bg-card-badge";
  let state = "warn", text;
  if (!data || data.bruttokalt == null) {
    text = "Bruttokalt ?";
  } else if (!data.city) {
    text = `Bruttokalt ${fmt(data.bruttokalt)} · Stadt ?`;
  } else {
    const within = data.bruttokalt <= data.city.limit;
    state = within ? "ok" : "bad";
    text = `${within ? "✅" : "❌"} Bruttokalt ${fmt(data.bruttokalt)} · ${data.city.name} ≤ ${fmt(data.city.limit)}`;
    if (!within && HIDE_OVER_LIMIT) card.style.display = "none";
  }
  badge.setAttribute("style",
    "display:block;margin:4px 0;padding:6px 10px;border-radius:8px;color:#fff;" +
    "font:600 13px/1.3 system-ui,Arial,sans-serif;" + (STYLE[state] || STYLE.warn));
  badge.textContent = text;
  card.prepend(badge);
}

function exposeIdFromHref(href) {
  const m = (href || "").match(/\/expose\/(\d+)/);
  return m ? m[1] : null;
}

function scanList() {
  if (!AUTO_SCAN_LIST) return;
  const seen = new Set();
  document.querySelectorAll('a[href*="/expose/"]').forEach(link => {
    const id = exposeIdFromHref(link.getAttribute("href"));
    if (!id) return;
    const card = link.closest("article, li, .result-list-entry, [data-id]") || link.parentElement;
    if (!card || card.dataset.bgDone === id) return;
    if (seen.has(card)) return;
    seen.add(card);
    card.dataset.bgDone = id;

    const cached = cacheGet(id);
    if (cached) { annotateCard(card, cached); return; }
    if (blocked) return;

    stats.total++;
    queue.push(async () => {
      try {
        const data = await fetchExpose(id);
        annotateCard(card, data);
      } catch (_) {
        delete card.dataset.bgDone; // später erneut versuchen
      } finally {
        stats.done++;
      }
    });
  });
  pump();
}

function updateListBadge() {
  if (blocked) {
    renderBadge("warn", [
      "⏸️ IS24 bremst die Hintergrund-Abrufe aus.",
      `<span style="font-weight:400">Bereits geprüft: ${stats.done}. Seite neu laden oder Anzeigen manuell öffnen.</span>`,
    ]);
    return;
  }
  if (stats.total === 0) {
    renderBadge("warn", [
      "<b>Bürgergeld-Filter aktiv</b>",
      `<span style="font-weight:400">${CITY_LIMITS.length} Städte hinterlegt. Prüfe Trefferliste …</span>`,
    ]);
    return;
  }
  const pending = stats.total - stats.done;
  renderBadge(pending ? "warn" : "ok", [
    `<b>Bürgergeld-Filter</b>`,
    `<span style="font-weight:400">${stats.done}/${stats.total} Anzeigen geprüft${pending ? " …" : " ✓"}</span>`,
    `<span style="font-weight:400">🟢 passt · 🔴 zu teuer · 🟡 unklar</span>`,
  ]);
}

function checkSearchList() {
  updateListBadge();
  scanList();
}

// ── Start ───────────────────────────────────────────────────────────────--
function run() {
  if (location.pathname.startsWith("/expose/")) checkExpose();
  else checkSearchList();
}

let timer = null;
const observer = new MutationObserver(() => {
  clearTimeout(timer);
  timer = setTimeout(run, 400);
});
observer.observe(document.documentElement, { childList: true, subtree: true });

run();
