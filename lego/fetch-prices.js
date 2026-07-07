#!/usr/bin/env node
// ============================================================
// LEGO Preis-Leistungs-Finder – Preis-Fetcher
// ============================================================
// Holt für jede Setnummer aus data/sets.js die aktuellen Daten
// vom brickmerge.de-Preisvergleich (Bestpreis über 10+ Shops,
// UVP, Teile, Minifiguren, Verfügbarkeit, EOL-Status) und
// schreibt sie nach data/prices.js.
//
// Aufruf:  node lego/fetch-prices.js
// Braucht: Node 18+ (eingebautes fetch), keine Abhängigkeiten.
//
// Der Fetcher ist bewusst höflich: 1 Anfrage alle ~1,5 Sekunden.
// Schlägt ein Set fehl, bleibt der zuletzt bekannte Stand
// erhalten und wird als "stale" markiert.
// ============================================================

"use strict";

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const SETS_FILE = path.join(DATA_DIR, "sets.js");
const PRICES_FILE = path.join(DATA_DIR, "prices.js");
const DELAY_MS = 1500;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

// ---------- Hilfsfunktionen ----------

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// data/sets.js ist eine Browser-Datei (setzt globalThis.LEGO_SETS);
// hier führen wir sie in einer kleinen Sandbox aus.
function loadWatchlist() {
  const src = fs.readFileSync(SETS_FILE, "utf8");
  const sandbox = {};
  new Function("globalThis", src)(sandbox);
  if (!Array.isArray(sandbox.LEGO_SETS)) {
    throw new Error("data/sets.js definiert kein LEGO_SETS-Array");
  }
  return sandbox.LEGO_SETS;
}

// Vorherigen Stand laden, damit Ausfälle einzelne Sets nicht löschen.
function loadPrevious() {
  try {
    const src = fs.readFileSync(PRICES_FILE, "utf8");
    const sandbox = {};
    new Function("globalThis", src)(sandbox);
    return (sandbox.LEGO_PRICES && sandbox.LEGO_PRICES.sets) || {};
  } catch {
    return {};
  }
}

function decodeEntities(s) {
  return String(s)
    .replace(/&euro;/g, "€")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&uuml;/g, "ü")
    .replace(/&ouml;/g, "ö")
    .replace(/&auml;/g, "ä")
    .replace(/&szlig;/g, "ß");
}

// Deutsche Schreibweise im Seitentext: "3.745" -> 3745, "359,99" -> 359.99
function parseGermanNumber(s) {
  if (s == null) return null;
  const n = Number(String(s).trim().replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

// JSON-LD liefert englische Schreibweise: "322.00" -> 322
function parsePlainNumber(s) {
  if (s == null) return null;
  const n = Number(String(s).trim());
  return Number.isFinite(n) ? n : null;
}

function extractJsonLd(html) {
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const d = JSON.parse(m[1]);
      if (d && d["@type"] === "Product") return d;
    } catch {
      /* nächsten Block probieren */
    }
  }
  return null;
}

// ---------- Kern: eine brickmerge-Produktseite auswerten ----------

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "de" },
    redirect: "follow",
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { html: await res.text(), url: res.url };
}

async function fetchSet(number) {
  // Kurz-URL versuchen; landet die manchmal auf einer Suchseite,
  // dem Link zur eigentlichen Produktseite (/<nr>-1_...) folgen.
  let { html, url } = await fetchPage(`https://www.brickmerge.de/${number}`);
  let product = extractJsonLd(html);
  if (!product) {
    const link = (html.match(new RegExp(`href="(/${number}-1_[^"]+)"`)) || [])[1];
    if (!link) throw new Error("keine Produktdaten gefunden (Setnummer korrekt?)");
    await sleep(DELAY_MS);
    ({ html, url } = await fetchPage(`https://www.brickmerge.de${link}`));
    product = extractJsonLd(html);
    if (!product) throw new Error("Produktseite ohne Produktdaten");
  }
  const res = { url };

  const offers = product.offers || {};
  const metaDesc =
    (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";

  const pieces = parseGermanNumber(
    (html.match(/Teile:\s*<strong>([\d.]+)<\/strong>/) || [])[1]
  );
  const minifigs = parseGermanNumber(
    (html.match(/Minifiguren:\s*<strong>(\d+)<\/strong>/) || [])[1]
  );
  const uvp = parseGermanNumber(
    (html.match(/UVP\s*([\d.,]+)\s*(?:&euro;|€)/) || [])[1]
  );
  const eol = (metaDesc.match(/EOL\s*(\d{2}\/\d{4})/) || [])[1] || null;

  return {
    number: String(number),
    name: decodeEntities(product.name || `LEGO ${number}`),
    theme: (product.category && product.category.name) || null,
    image: Array.isArray(product.image) ? product.image[0] : product.image || null,
    url: res.url,
    releaseDate: product.releaseDate || null,
    pieces,
    minifigs,
    uvp,
    bestPrice: parsePlainNumber(offers.lowPrice),
    highPrice: parsePlainNumber(offers.highPrice),
    offerCount: offers.offerCount || 0,
    available: offers.availability === "https://schema.org/InStock",
    eol, // z. B. "07/2026" = Auslaufdatum, null = kein EOL bekannt
    retiring: /AUSLAUFARTIKEL/i.test(metaDesc),
    stale: false,
    fetchedAt: new Date().toISOString(),
  };
}

// ---------- Hauptprogramm ----------

async function main() {
  const watchlist = loadWatchlist();
  const previous = loadPrevious();
  const out = {};
  let ok = 0;
  let failed = 0;

  for (const entry of watchlist) {
    const nr = String(entry.number);
    process.stdout.write(`  ${nr} ... `);
    try {
      out[nr] = await fetchSet(nr);
      console.log(`OK  ${out[nr].name} – ab ${out[nr].bestPrice} €`);
      ok++;
    } catch (err) {
      failed++;
      if (previous[nr]) {
        out[nr] = { ...previous[nr], stale: true };
        console.log(`FEHLER (${err.message}) – alter Stand bleibt erhalten`);
      } else {
        out[nr] = { number: nr, error: String(err.message), stale: true };
        console.log(`FEHLER (${err.message})`);
      }
    }
    await sleep(DELAY_MS);
  }

  if (ok === 0 && Object.keys(previous).length > 0) {
    console.error("Kein einziges Set abrufbar – behalte data/prices.js unverändert.");
    process.exitCode = 0;
    return;
  }

  const payload = {
    fetchedAt: new Date().toISOString(),
    source: "brickmerge.de (Preisvergleich über deutsche Shops)",
    sets: out,
  };

  const banner =
    "// Automatisch erzeugt von lego/fetch-prices.js – nicht von Hand bearbeiten.\n" +
    "// Merkliste pflegen in lego/data/sets.js.\n";
  fs.writeFileSync(
    PRICES_FILE,
    banner + "globalThis.LEGO_PRICES = " + JSON.stringify(payload, null, 1) + ";\n"
  );
  console.log(`\nFertig: ${ok} OK, ${failed} Fehler -> ${path.relative(process.cwd(), PRICES_FILE)}`);
}

main().catch((err) => {
  console.error("Abbruch:", err);
  process.exit(1);
});
