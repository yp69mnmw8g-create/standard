#!/usr/bin/env node
/*
 * Morgen-Übersicht – Generator
 * ------------------------------
 * Holt jeden Morgen Wetter, Kalender-Termine, Nachrichten und "Was geschah
 * heute" und baut daraus eine fertige HTML-Seite (morning/index.html).
 *
 * Läuft mit reinem Node (>= 18, globales fetch). KEINE npm-Abhängigkeiten,
 * passend zum Rest des Projekts.
 *
 * Konfiguration: morning/config.json. Sensible Werte (Kalender-Links,
 * E-Mail) kommen aus Umgebungsvariablen / GitHub-Secrets.
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Konfiguration laden
// ---------------------------------------------------------------------------
async function loadConfig() {
  const raw = await readFile(join(HERE, "config.json"), "utf8");
  const cfg = JSON.parse(raw);

  // Kalender-Links bevorzugt aus Secret (kommagetrennt), sonst aus config.json.
  const envCals = (process.env.CALENDAR_URLS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (envCals.length) cfg.calendarUrls = envCals;

  if (process.env.WEATHER_CITY) cfg.city = process.env.WEATHER_CITY;
  return cfg;
}

// ---------------------------------------------------------------------------
// HTTP-Helfer (User-Agent + Timeout + Retry bei kurzzeitigen Fehlern)
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function httpGetOnce(url, { json, timeout }) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) MorningOverview/1.0",
        Accept: json ? "application/json" : "*/*",
      },
    });
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status} für ${url}`);
      err.status = res.status;
      throw err;
    }
    return json ? await res.json() : await res.text();
  } finally {
    clearTimeout(t);
  }
}

async function httpGet(url, { json = false, timeout = 15000, retries = 2 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await httpGetOnce(url, { json, timeout });
    } catch (e) {
      lastErr = e;
      // Nur bei vorübergehenden Fehlern erneut versuchen (Rate-Limit/Server/Netz).
      const transient =
        e.status === undefined || // Netz-/Timeout-Fehler
        e.status === 403 || e.status === 408 || e.status === 429 ||
        (e.status >= 500 && e.status < 600);
      if (attempt === retries || !transient) break;
      await sleep(600 * (attempt + 1));
    }
  }
  throw lastErr;
}

// ---------------------------------------------------------------------------
// Datum / Zeitzone
// ---------------------------------------------------------------------------
function localDateParts(tz, date = new Date()) {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date); // "2026-06-09"
  const [y, m, d] = ymd.split("-");
  const weekdayShort = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
  }).format(date); // "Mon"
  return { y: +y, m: +m, d: +d, ymd: `${y}${m}${d}`, weekdayShort };
}

function tzDateTimeParts(dateUTC, tz) {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(dateUTC);
  const get = (k) => p.find((x) => x.type === k)?.value || "00";
  return {
    ymd: `${get("year")}${get("month")}${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

// ---------------------------------------------------------------------------
// 1) Wetter (Open-Meteo, kostenlos & ohne Schlüssel)
// ---------------------------------------------------------------------------
const WMO = {
  0: ["Klar", "☀️"], 1: ["Überwiegend klar", "🌤️"], 2: ["Teils bewölkt", "⛅"],
  3: ["Bedeckt", "☁️"], 45: ["Nebel", "🌫️"], 48: ["Reifnebel", "🌫️"],
  51: ["Leichter Niesel", "🌦️"], 53: ["Niesel", "🌦️"], 55: ["Starker Niesel", "🌦️"],
  56: ["Gefr. Niesel", "🌧️"], 57: ["Gefr. Niesel", "🌧️"],
  61: ["Leichter Regen", "🌦️"], 63: ["Regen", "🌧️"], 65: ["Starker Regen", "🌧️"],
  66: ["Gefr. Regen", "🌧️"], 67: ["Gefr. Regen", "🌧️"],
  71: ["Leichter Schnee", "🌨️"], 73: ["Schnee", "🌨️"], 75: ["Starker Schnee", "❄️"],
  77: ["Schneegriesel", "🌨️"], 80: ["Regenschauer", "🌦️"], 81: ["Regenschauer", "🌧️"],
  82: ["Heftige Schauer", "⛈️"], 85: ["Schneeschauer", "🌨️"], 86: ["Schneeschauer", "🌨️"],
  95: ["Gewitter", "⛈️"], 96: ["Gewitter, Hagel", "⛈️"], 99: ["Gewitter, Hagel", "⛈️"],
};

async function getWeather(cfg) {
  try {
    const geo = await httpGet(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        cfg.city
      )}&count=1&language=de&format=json`,
      { json: true }
    );
    const loc = geo.results?.[0];
    if (!loc) throw new Error(`Ort nicht gefunden: ${cfg.city}`);

    const f = await httpGet(
      `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}` +
        `&longitude=${loc.longitude}` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,` +
        `precipitation_probability_max,sunrise,sunset` +
        `&timezone=${encodeURIComponent(cfg.timezone)}&forecast_days=1`,
      { json: true }
    );
    const d = f.daily;
    const code = d.weather_code[0];
    const [desc, icon] = WMO[code] || ["–", "🌡️"];
    const time = (iso) => (iso ? iso.slice(11, 16) : "–");
    return {
      ok: true,
      city: loc.name + (loc.admin1 ? `, ${loc.admin1}` : ""),
      icon,
      desc,
      tMax: Math.round(d.temperature_2m_max[0]),
      tMin: Math.round(d.temperature_2m_min[0]),
      rain: d.precipitation_probability_max[0],
      sunrise: time(d.sunrise[0]),
      sunset: time(d.sunset[0]),
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ---------------------------------------------------------------------------
// 2) Nachrichten (RSS-Feed, z. B. Tagesschau)
// ---------------------------------------------------------------------------
function decodeEntities(s) {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/<[^>]+>/g, "")
    .trim();
}

async function getNews(cfg) {
  try {
    const xml = await httpGet(cfg.newsRssUrl);
    const items = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/g)];
    const news = items.slice(0, cfg.newsCount || 6).map((m) => {
      const block = m[0];
      const title = block.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "";
      const link = block.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "";
      return { title: decodeEntities(title), link: link.trim() };
    });
    return { ok: true, source: cfg.newsSourceName || "Nachrichten", news };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ---------------------------------------------------------------------------
// 3) Geschichtsthema des Tages (Wikipedia, kuratierte Ereignisse)
// ---------------------------------------------------------------------------
function epochDay(today) {
  return Math.floor(Date.UTC(today.y, today.m - 1, today.d) / 86400000);
}

async function getHistory(cfg, today) {
  try {
    const mm = String(today.m).padStart(2, "0");
    const dd = String(today.d).padStart(2, "0");
    const lang = cfg.locale === "de" ? "de" : "en";
    const data = await httpGet(
      `https://${lang}.wikipedia.org/api/rest_v1/feed/onthisday/selected/${mm}/${dd}`,
      { json: true }
    );
    const events = data.selected || [];
    if (!events.length) throw new Error("keine Ereignisse");
    // Pro Tag ein anderes Thema (über den Tag stabil).
    const e = events[epochDay(today) % events.length];
    const p = (e.pages || [])[0] || {};
    let extract = p.extract || "";
    if (extract.length > 320) extract = extract.slice(0, 320).trimEnd() + "…";
    return {
      ok: true,
      year: e.year,
      text: e.text,
      title: p.normalizedtitle || "",
      extract,
      url: p.content_urls?.desktop?.page || "",
      thumb: p.thumbnail?.source || "",
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ---------------------------------------------------------------------------
// 3b) Wissen des Tages – Wikipedia "Artikel des Tages" (fürs Allgemeinwissen)
// ---------------------------------------------------------------------------
async function getKnowledge(cfg, today) {
  try {
    const mm = String(today.m).padStart(2, "0");
    const dd = String(today.d).padStart(2, "0");
    const lang = cfg.locale === "de" ? "de" : "en";
    const data = await httpGet(
      `https://${lang}.wikipedia.org/api/rest_v1/feed/featured/${today.y}/${mm}/${dd}`,
      { json: true }
    );
    // Bevorzugt der "Artikel des Tages", sonst der meistgelesene Artikel.
    let a = data.tfa;
    if (!a && data.mostread?.articles?.length) a = data.mostread.articles[0];
    if (!a) throw new Error("kein Artikel");
    let extract = a.extract || "";
    if (extract.length > 320) extract = extract.slice(0, 320).trimEnd() + "…";
    return {
      ok: true,
      title: a.normalizedtitle || a.titles?.normalized || "",
      extract,
      url: a.content_urls?.desktop?.page || "",
      thumb: a.thumbnail?.source || "",
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ---------------------------------------------------------------------------
// 4) Koran-Vers des Tages (alquran.cloud) – wechselt täglich, deterministisch
// ---------------------------------------------------------------------------
const QURAN_AYAH_COUNT = 6236;

function ayahOfDay(today) {
  // Tage seit Epoche → modulo Gesamtzahl der Verse: jeden Tag ein anderer,
  // aber über den Tag stabil und reproduzierbar.
  return (((epochDay(today) % QURAN_AYAH_COUNT) + QURAN_AYAH_COUNT) % QURAN_AYAH_COUNT) + 1;
}

async function getQuran(cfg, today) {
  try {
    const n = ayahOfDay(today);
    const translation = cfg.quranTranslation || "de.aburida";
    const data = await httpGet(
      `https://api.alquran.cloud/v1/ayah/${n}/editions/quran-uthmani,${translation}`,
      { json: true }
    );
    const ar = data.data.find((x) => x.edition.identifier === "quran-uthmani");
    const tr = data.data.find((x) => x.edition.identifier === translation);
    if (!ar || !tr) throw new Error("Vers-Daten unvollständig");
    return {
      ok: true,
      arabic: ar.text,
      translation: tr.text,
      ref: `Sure ${tr.surah.number} (${tr.surah.englishName}), Vers ${tr.numberInSurah}`,
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ---------------------------------------------------------------------------
// 4) Kalender (veröffentlichte iCloud/Google .ics-Links)
// ---------------------------------------------------------------------------
function unfoldICS(text) {
  // Gefaltete Zeilen (Fortsetzung beginnt mit Leerzeichen/Tab) zusammenführen.
  return text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
}

function parseICSDate(value) {
  // value: "20260609" | "20260609T080000Z" | "20260609T080000"
  const v = value.trim();
  const Y = +v.slice(0, 4), Mo = +v.slice(4, 6), D = +v.slice(6, 8);
  if (v.length <= 8) return { allDay: true, ymd: `${v.slice(0, 8)}` };
  const H = +v.slice(9, 11) || 0, Mi = +v.slice(11, 13) || 0, S = +v.slice(13, 15) || 0;
  if (v.endsWith("Z")) {
    return { allDay: false, utc: new Date(Date.UTC(Y, Mo - 1, D, H, Mi, S)) };
  }
  // Schwebende / TZID-Zeit: Datumsteil als lokal behandeln.
  return {
    allDay: false,
    floatingYmd: `${v.slice(0, 8)}`,
    floatingTime: `${String(H).padStart(2, "0")}:${String(Mi).padStart(2, "0")}`,
  };
}

function ymdToDate(ymd) {
  return new Date(Date.UTC(+ymd.slice(0, 4), +ymd.slice(4, 6) - 1, +ymd.slice(6, 8)));
}
function dayDiff(aYmd, bYmd) {
  return Math.round((ymdToDate(aYmd) - ymdToDate(bYmd)) / 86400000);
}
const WD = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
function ymdWeekday(ymd) {
  return WD[ymdToDate(ymd).getUTCDay()];
}

function parseRRule(s) {
  const out = {};
  for (const part of s.split(";")) {
    const [k, v] = part.split("=");
    out[k] = v;
  }
  return out;
}

// Prüft, ob ein (ggf. wiederkehrendes) Ereignis HEUTE stattfindet.
function occursToday(ev, today, tz) {
  const start = ev.start;
  // Lokales Start-Datum (ymd) des Ereignisses ermitteln.
  const startYmd = start.allDay
    ? start.ymd
    : start.utc
    ? tzDateTimeParts(start.utc, tz).ymd
    : start.floatingYmd;

  if (!ev.rrule) {
    if (start.allDay && ev.endYmd) {
      // Mehrtägig: Ende ist exklusiv (Standard bei .ics).
      return today.ymd >= startYmd && today.ymd < ev.endYmd;
    }
    return startYmd === today.ymd;
  }

  // --- Wiederkehrend ---
  const r = parseRRule(ev.rrule);
  if (today.ymd < startYmd) return false;
  if (r.UNTIL) {
    const untilYmd = r.UNTIL.slice(0, 8);
    if (today.ymd > untilYmd) return false;
  }
  const interval = parseInt(r.INTERVAL || "1", 10) || 1;
  const td = ymdToDate(today.ymd), sd = ymdToDate(startYmd);

  switch (r.FREQ) {
    case "DAILY":
      return dayDiff(today.ymd, startYmd) % interval === 0;
    case "WEEKLY": {
      const days = r.BYDAY ? r.BYDAY.split(",") : [ymdWeekday(startYmd)];
      if (!days.includes(today.weekdayShortICS)) return false;
      const weekDiff = Math.floor(dayDiff(today.ymd, startYmd) / 7);
      return weekDiff % interval === 0;
    }
    case "MONTHLY":
      return td.getUTCDate() === sd.getUTCDate();
    case "YEARLY":
      return td.getUTCDate() === sd.getUTCDate() && td.getUTCMonth() === sd.getUTCMonth();
    default:
      return startYmd === today.ymd;
  }
}

function parseCalendar(icsText) {
  const text = unfoldICS(icsText);
  const events = [];
  const blocks = text.split("BEGIN:VEVENT").slice(1);
  for (const b of blocks) {
    const body = b.split("END:VEVENT")[0];
    const lines = body.split("\n");
    const ev = {};
    for (const line of lines) {
      const idx = line.indexOf(":");
      if (idx < 0) continue;
      const left = line.slice(0, idx);
      const value = line.slice(idx + 1);
      const name = left.split(";")[0].toUpperCase();
      if (name === "SUMMARY") ev.summary = decodeEntities(value);
      else if (name === "LOCATION") ev.location = decodeEntities(value);
      else if (name === "DTSTART") ev.start = parseICSDate(value);
      else if (name === "DTEND") {
        const e = parseICSDate(value);
        ev.endYmd = e.allDay ? e.ymd : null;
      } else if (name === "RRULE") ev.rrule = value.trim();
    }
    if (ev.start && ev.summary) events.push(ev);
  }
  return events;
}

async function getCalendar(cfg, today) {
  const urls = cfg.calendarUrls || [];
  if (!urls.length) return { ok: true, configured: false, events: [] };
  // Wochentag heute im ICS-Format (MO/TU/…) für WEEKLY-Regeln.
  today.weekdayShortICS = {
    Mon: "MO", Tue: "TU", Wed: "WE", Thu: "TH", Fri: "FR", Sat: "SA", Sun: "SU",
  }[today.weekdayShort];

  const out = [];
  const errors = [];
  for (let url of urls) {
    try {
      url = url.replace(/^webcal:\/\//i, "https://");
      const ics = await httpGet(url);
      for (const ev of parseCalendar(ics)) {
        if (!occursToday(ev, today, cfg.timezone)) continue;
        const time = ev.start.allDay
          ? null
          : ev.start.utc
          ? tzDateTimeParts(ev.start.utc, cfg.timezone).time
          : ev.start.floatingTime;
        out.push({ time, summary: ev.summary, location: ev.location || "" });
      }
    } catch (e) {
      errors.push(e.message);
    }
  }
  out.sort((a, b) => (a.time || "00:00").localeCompare(b.time || "00:00"));
  return { ok: errors.length === 0, configured: true, events: out, errors };
}

// ---------------------------------------------------------------------------
// HTML rendern
// ---------------------------------------------------------------------------
function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHTML({ cfg, dateLabel, weather, calendar, news, history, knowledge, quran }) {
  const weatherCard = weather.ok
    ? `<div class="big">${weather.icon} ${weather.tMax}°<span class="muted"> / ${weather.tMin}°</span></div>
       <div>${esc(weather.desc)} · ${esc(weather.city)}</div>
       <div class="muted">🌧️ Regen ${weather.rain ?? "–"}% · 🌅 ${weather.sunrise} · 🌇 ${weather.sunset}</div>`
    : `<div class="muted">Wetter nicht verfügbar (${esc(weather.error)})</div>`;

  let calCard;
  if (!calendar.configured) {
    calCard = `<div class="muted">Kein Kalender verknüpft. Siehe <code>morning/README.md</code>, um deinen iCloud-Kalender zu veröffentlichen.</div>`;
  } else if (calendar.events.length) {
    calCard = `<ul class="list">` +
      calendar.events.map((e) =>
        `<li><span class="time">${e.time ? esc(e.time) : "ganztägig"}</span> ${esc(e.summary)}${
          e.location ? ` <span class="muted">· ${esc(e.location)}</span>` : ""
        }</li>`
      ).join("") + `</ul>`;
  } else {
    calCard = `<div class="muted">Heute keine Termine. 🎉</div>`;
  }

  const newsCard = news.ok && news.news.length
    ? `<ul class="list">` +
      news.news.map((n) =>
        `<li><a href="${esc(n.link)}">${esc(n.title)}</a></li>`
      ).join("") + `</ul>`
    : `<div class="muted">Nachrichten nicht verfügbar${news.error ? ` (${esc(news.error)})` : ""}.</div>`;

  const historyCard = history.ok
    ? `${history.thumb ? `<img class="hist-img" src="${esc(history.thumb)}" alt="">` : ""}
       <div><strong>${esc(history.year)}</strong> — ${esc(history.text)}</div>
       ${history.extract ? `<div class="muted hist-extract">${esc(history.extract)}</div>` : ""}
       ${history.url ? `<a href="${esc(history.url)}">Mehr dazu →</a>` : ""}`
    : `<div class="muted">Geschichtsthema nicht verfügbar${history.error ? ` (${esc(history.error)})` : ""}.</div>`;

  const knowledgeCard = knowledge.ok
    ? `${knowledge.thumb ? `<img class="hist-img" src="${esc(knowledge.thumb)}" alt="">` : ""}
       <div><strong>${esc(knowledge.title)}</strong></div>
       ${knowledge.extract ? `<div class="muted hist-extract">${esc(knowledge.extract)}</div>` : ""}
       ${knowledge.url ? `<a href="${esc(knowledge.url)}">Mehr dazu →</a>` : ""}`
    : `<div class="muted">Wissen nicht verfügbar${knowledge.error ? ` (${esc(knowledge.error)})` : ""}.</div>`;

  const quranCard = quran.ok
    ? `<div class="ayah" lang="ar" dir="rtl">${esc(quran.arabic)}</div>
       <div class="ayah-tr">${esc(quran.translation)}</div>
       <div class="muted ayah-ref">${esc(quran.ref)}</div>`
    : `<div class="muted">Vers nicht verfügbar${quran.error ? ` (${esc(quran.error)})` : ""}.</div>`;

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Morgen-Übersicht · ${esc(dateLabel)}</title>
<style>
  :root { color-scheme: light dark; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    margin: 0; padding: 24px; line-height: 1.5;
    background: #f5f5f7; color: #1d1d1f;
    max-width: 720px; margin-inline: auto;
  }
  @media (prefers-color-scheme: dark) {
    body { background: #161617; color: #f5f5f7; }
    .card { background: #1f1f21 !important; }
    a { color: #6ab7ff; }
  }
  header { margin-bottom: 20px; }
  h1 { font-size: 1.6rem; margin: 0 0 4px; }
  .date { color: #86868b; font-size: 1rem; }
  .card {
    background: #fff; border-radius: 16px; padding: 18px 20px; margin-bottom: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  .card h2 { font-size: 1rem; margin: 0 0 10px; text-transform: uppercase;
    letter-spacing: .04em; color: #86868b; }
  .big { font-size: 2rem; font-weight: 600; }
  .muted { color: #86868b; }
  .list { list-style: none; margin: 0; padding: 0; }
  .list li { padding: 6px 0; border-top: 1px solid rgba(128,128,128,.15); }
  .list li:first-child { border-top: none; }
  .time { display: inline-block; min-width: 64px; color: #86868b; font-variant-numeric: tabular-nums; }
  a { color: #0066cc; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .quran { background: linear-gradient(135deg, #f3efe6, #fbf9f4); }
  @media (prefers-color-scheme: dark) { .quran { background: linear-gradient(135deg, #23211c, #1c1b18) !important; } }
  .ayah { font-size: 1.5rem; line-height: 2; text-align: right; margin-bottom: 12px; }
  .ayah-tr { font-style: italic; }
  .ayah-ref { margin-top: 8px; font-size: .85rem; }
  .hist-img { float: right; width: 120px; height: auto; border-radius: 10px;
    margin: 0 0 8px 14px; object-fit: cover; }
  .hist-extract { margin: 8px 0; font-size: .92rem; }
  footer { color: #86868b; font-size: .8rem; text-align: center; margin-top: 24px; }
</style>
</head>
<body>
  <header>
    <h1>☀️ Guten Morgen!</h1>
    <div class="date">${esc(dateLabel)}</div>
  </header>

  <section class="card"><h2>Wetter</h2>${weatherCard}</section>
  <section class="card"><h2>📅 Heute im Kalender</h2>${calCard}</section>
  <section class="card"><h2>🌍 ${esc(news.source || "Welt-Nachrichten")}</h2>${newsCard}</section>
  <section class="card"><h2>📜 Geschichtsthema des Tages</h2>${historyCard}</section>
  <section class="card"><h2>🧠 Wissen des Tages</h2>${knowledgeCard}</section>
  <section class="card quran"><h2>☪️ Koran-Vers des Tages</h2>${quranCard}</section>

  <footer>Automatisch erstellt · ${esc(new Date().toISOString().slice(0, 16).replace("T", " "))} UTC</footer>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Hauptablauf
// ---------------------------------------------------------------------------
async function main() {
  const cfg = await loadConfig();
  const today = localDateParts(cfg.timezone);
  const dateLabel = new Intl.DateTimeFormat(cfg.locale === "de" ? "de-DE" : "en-US", {
    timeZone: cfg.timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const [weather, calendar, news, history, knowledge, quran] = await Promise.all([
    getWeather(cfg),
    getCalendar(cfg, today),
    getNews(cfg),
    getHistory(cfg, today),
    getKnowledge(cfg, today),
    getQuran(cfg, today),
  ]);

  const html = renderHTML({
    cfg, dateLabel, weather, calendar, news, history, knowledge, quran,
  });
  await writeFile(join(HERE, "index.html"), html, "utf8");

  // Kurze Konsolen-Zusammenfassung (hilfreich im CI-Log).
  console.log(`Morgen-Übersicht für ${dateLabel} erstellt.`);
  console.log(`  Wetter:       ${weather.ok ? "ok" : "FEHLER: " + weather.error}`);
  console.log(`  Kalender:     ${calendar.configured ? calendar.events.length + " Termine" : "nicht konfiguriert"}`);
  if (calendar.errors?.length) {
    console.log(`                ⚠ Abruf-Fehler: ${calendar.errors.join("; ")}`);
  }
  console.log(`  News:         ${news.ok ? news.news.length + " Meldungen" : "FEHLER: " + news.error}`);
  console.log(`  Geschichte:   ${history.ok ? `${history.year} – ${history.title || history.text.slice(0, 40)}` : "FEHLER: " + history.error}`);
  console.log(`  Wissen:       ${knowledge.ok ? knowledge.title : "FEHLER: " + knowledge.error}`);
  console.log(`  Koran-Vers:   ${quran.ok ? quran.ref : "FEHLER: " + quran.error}`);
}

main().catch((e) => {
  console.error("Generator fehlgeschlagen:", e);
  process.exit(1);
});
