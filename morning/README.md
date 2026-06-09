# ☀️ Morgen-Übersicht

Eine automatische Tagesübersicht mit **Wetter**, **Kalender-Terminen**,
**Nachrichten** und **„Was geschah heute"**. Wird jeden Morgen per GitHub
Actions gebaut, auf GitHub Pages veröffentlicht und optional per E-Mail
verschickt.

- **Seite:** `https://<dein-user>.github.io/standard/morning/`
- **Skript:** `morning/generate.js` (reines Node, keine Abhängigkeiten)
- **Workflow:** `.github/workflows/morning.yml`

## So läuft es

1. `morning/generate.js` holt alle Daten **serverseitig** (kein CORS-Problem):
   - **Wetter:** [Open-Meteo](https://open-meteo.com) – kostenlos, kein Schlüssel.
   - **Nachrichten:** Google-News-RSS (deutsche Schlagzeilen, frei wählbar).
   - **Ereignisse:** Wikipedia „An diesem Tag".
   - **Kalender:** veröffentlichte `.ics`-Links (iCloud/Google).
2. Daraus entsteht `morning/index.html`.
3. Der Workflow veröffentlicht die Seite und schickt sie per Mail.

## Einrichtung

### 1. Ort & Feed anpassen
In `morning/config.json`:
```json
{
  "city": "Berlin",
  "timezone": "Europe/Berlin",
  "newsRssUrl": "https://news.google.com/rss?hl=de&gl=DE&ceid=DE:de"
}
```
Die Stadt lässt sich auch per Secret `WEATHER_CITY` überschreiben.

### 2. Kalender verknüpfen (iCloud)
1. iPhone: **Kalender-App** → Tab **Kalender** → beim gewünschten Kalender auf
   das **ⓘ** tippen → **Öffentlicher Kalender** aktivieren → **Link teilen/kopieren**.
   (Alternativ am Mac: Kalender → Rechtsklick auf Kalender → *Veröffentlichen*.)
2. Der Link sieht so aus: `webcal://p…-caldav.icloud.com/published/…`.
   Das Skript wandelt `webcal://` automatisch in `https://` um.
3. Den Link als Repository-Secret **`CALENDAR_URLS`** hinterlegen
   (mehrere Kalender: kommagetrennt).

> Hinweis: Ein veröffentlichter Kalender ist für jeden mit dem Link einsehbar.
> Deshalb liegt er als Secret, nicht im Code. Wiederkehrende Termine werden
> grundlegend unterstützt (täglich/wöchentlich/monatlich/jährlich, inkl.
> Geburtstage); sehr komplexe Wiederholungsregeln evtl. nicht exakt.

### 3. E-Mail einrichten (optional, für iCloud-Mail)
GitHub: **Settings → Secrets and variables → Actions → New repository secret**:

| Secret          | Wert                                                            |
|-----------------|-----------------------------------------------------------------|
| `MAIL_USERNAME` | Deine iCloud-Mail-Adresse (z. B. `name@icloud.com`)             |
| `MAIL_PASSWORD` | **App-spezifisches Passwort** (siehe unten)                     |
| `MAIL_TO`       | Empfänger-Adresse (meist dieselbe)                              |

App-spezifisches Passwort erstellen: [account.apple.com](https://account.apple.com)
→ Anmeldung & Sicherheit → **App-spezifische Passwörter**. (Dein normales
iCloud-Passwort funktioniert für SMTP nicht.)

Ist `MAIL_PASSWORD` nicht gesetzt, wird die Seite trotzdem gebaut – nur ohne
Mailversand.

### 4. Uhrzeit anpassen
In `.github/workflows/morning.yml` die `cron`-Zeile (UTC!). Standard
`30 4 * * *` ≈ 06:30 Sommerzeit / 05:30 Winterzeit in Deutschland.

> **Wichtig:** Geplante Läufe starten bei GitHub nur auf dem **Default-Branch**
> (meist `main`). Vorher/jederzeit manuell testen über
> **Actions → „Morgen-Übersicht" → Run workflow**.

## Lokal testen
```bash
node morning/generate.js                 # ohne Kalender
CALENDAR_URLS="https://…/cal.ics" node morning/generate.js
open morning/index.html
```
