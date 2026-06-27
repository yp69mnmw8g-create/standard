// ==UserScript==
// @name         ImmoScout24 Bürgergeld-Filter (Bruttokaltmiete-Check)
// @namespace    https://github.com/yp69mnmw8g-create/standard
// @version      1.0.0
// @description  Berechnet auf ImmobilienScout24 automatisch die Bruttokaltmiete (Kaltmiete + kalte Nebenkosten, ohne Heizung) und prüft sie gegen die Jobcenter-Obergrenze der jeweiligen Stadt. Zeigt ein grünes/rotes Badge an.
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
 */
const CITY_LIMITS = [
  { name: "Düsseldorf",      limit: 546, plz: [[40210, 40629]] },
  { name: "Wuppertal",       limit: 466, plz: [[42103, 42399]] },
  { name: "Mönchengladbach", limit: 500, plz: [[41061, 41239]] },
  { name: "Neuss",           limit: 590, plz: [[41460, 41472]] },
  { name: "Ratingen",        limit: 544, plz: [[40878, 40885]] },
  { name: "Erkrath",         limit: 505, plz: [[40699, 40699]] },
];

// Geschätzte kalte Nebenkosten pro m² (nur für die Trefferliste verwendet,
// wo die echte Aufschlüsselung fehlt). Grober Richtwert: ~2 €/m².
const NK_ESTIMATE_PER_SQM = 2.0;

// ─────────────────────────────────────────────────────────────────────────

"use strict";

/** Wandelt "1.234,56 €" → 1234.56 . Gibt null zurück, wenn keine Zahl da ist. */
function parseEuro(text) {
  if (!text) return null;
  const t = String(text).replace(/\s/g, "");
  const m = t.match(/(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d{1,2}))?\s*€?/);
  if (!m) return null;
  const intPart = m[1].replace(/\./g, "");
  const dec = m[2] || "0";
  const val = parseFloat(intPart + "." + dec.padEnd(2, "0").slice(0, 2));
  return Number.isFinite(val) ? val : null;
}

/** Liest einen Kostenwert: erst über die IS24-QA-Klasse, sonst über das Label. */
function readCost(qaClass, labelRegex) {
  const el = document.querySelector("." + qaClass);
  if (el) {
    const raw = el.textContent || "";
    // "keine Angabe", "in Nebenkosten enthalten" usw. → kein Zahlwert
    const num = parseEuro(raw);
    return { num, raw: raw.trim() };
  }
  // Fallback: über die dt/dd-Definitionsliste
  for (const dt of document.querySelectorAll("dt")) {
    if (labelRegex.test(dt.textContent || "")) {
      const dd = dt.nextElementSibling;
      if (dd) return { num: parseEuro(dd.textContent), raw: (dd.textContent || "").trim() };
    }
  }
  return { num: null, raw: "" };
}

/** Bestimmt die Stadt anhand der PLZ (zuverlässig) oder ersatzweise des Namens. */
function detectCity() {
  const haystack = [
    document.querySelector(".address-block")?.textContent,
    document.querySelector(".zip-region-and-country")?.textContent,
    document.querySelector("h1")?.textContent,
    document.title,
  ].filter(Boolean).join(" | ");

  // 1) PLZ-basiert
  for (const m of haystack.matchAll(/\b(\d{5})\b/g)) {
    const plz = parseInt(m[1], 10);
    const hit = CITY_LIMITS.find(c => c.plz.some(([lo, hi]) => plz >= lo && plz <= hi));
    if (hit) return hit;
  }
  // 2) Namensbasiert (Fallback)
  const lower = haystack.toLowerCase();
  return CITY_LIMITS.find(c => lower.includes(c.name.toLowerCase())) || null;
}

const STYLE = {
  ok:    "background:#1b7e3c;",
  bad:   "background:#b3261e;",
  warn:  "background:#9a6700;",
  base:  "position:fixed;top:12px;right:12px;z-index:2147483647;color:#fff;" +
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

/** Hauptlogik für eine Expose-Detailseite. */
function checkExpose() {
  const kalt = readCost("is24qa-kaltmiete", /kaltmiete/i);
  const nk   = readCost("is24qa-nebenkosten", /nebenkosten/i);
  const heiz = readCost("is24qa-heizkosten", /heizkosten/i);
  const warm = readCost("is24qa-warmmiete", /warmmiete|gesamtmiete/i);
  const city = detectCity();

  // Bruttokaltmiete bestimmen:
  //  bevorzugt Kalt + kalte NK; ersatzweise Warm − Heiz.
  let bruttokalt = null;
  let method = "";
  if (kalt.num != null && nk.num != null) {
    bruttokalt = kalt.num + nk.num;
    method = "Kaltmiete + Nebenkosten";
  } else if (warm.num != null && heiz.num != null) {
    bruttokalt = warm.num - heiz.num;
    method = "Warmmiete − Heizkosten";
  } else if (kalt.num != null) {
    bruttokalt = kalt.num;
    method = "nur Kaltmiete (Nebenkosten fehlen!)";
  }

  if (bruttokalt == null) {
    renderBadge("warn", ["⚠️ Bruttokalt nicht berechenbar", "Kostenaufschlüsselung nicht gefunden."]);
    return;
  }

  // Warnung, falls Heizung evtl. in den Nebenkosten steckt
  const heizInNk = /nebenkosten/i.test(heiz.raw) || /heiz/i.test(nk.raw);

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
    within
      ? `✅ ${fmt(diff)} unter der Grenze`
      : `❌ ${fmt(-diff)} über der Grenze`
  );
  if (heizInNk) {
    lines.push(`<span style="font-weight:400;opacity:.9">ℹ️ Heizung evtl. in NK enthalten → echte Bruttokalt ggf. niedriger.</span>`);
  }
  renderBadge(within ? "ok" : "bad", lines);
}

/** Leichtgewichtige Schätzung für Trefferlisten (ohne echte Aufschlüsselung). */
function checkSearchList() {
  // Auf Listenseiten gibt es keine NK-Aufschlüsselung. Wir markieren nur grob
  // anhand Kaltmiete + geschätzter NK, sobald die echte Fläche bekannt ist.
  const city = detectCity();
  if (!city) return;
  renderBadge("warn", [
    `<b>${city.name}</b> – Grenze ${fmt(city.limit)}`,
    `<span style="font-weight:400">Liste zeigt keine NK. Öffne eine Anzeige für die genaue Prüfung.</span>`,
    `<span style="font-weight:400">Tipp: Kaltmiete-Filter auf ≈ ${fmt(city.limit - 80)} setzen (Puffer für NK).</span>`,
  ]);
}

function run() {
  if (location.pathname.startsWith("/expose/")) checkExpose();
  else checkSearchList();
}

// IS24 lädt Inhalte teils nach → erneut prüfen, wenn sich das DOM ändert.
let timer = null;
const observer = new MutationObserver(() => {
  clearTimeout(timer);
  timer = setTimeout(run, 400);
});
observer.observe(document.documentElement, { childList: true, subtree: true });

run();
