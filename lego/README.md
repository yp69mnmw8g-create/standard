# LEGO Preis-Leistungs-Finder

Findet die LEGO-Sets mit dem besten Preis-Leistungs-Verhältnis – mit
**Live-Bestpreisen** aus dem deutschen Preisvergleich [brickmerge.de](https://www.brickmerge.de)
(10–40 Shops pro Set). Die Auswahl speist sich aus zwei Quellen:

1. **Kuratierte Merkliste** (`data/sets.js`) – handverlesene Sets inkl.
   Bewertung für Prints und Aussehen.
2. **Automatische Top-Deals** – der Fetcher entdeckt bei jedem Lauf die
   aktuell besten Preisnachlässe über alle Sets (Tag „🔥 Top-Deal“,
   abschaltbar über den Filter „nur Merkliste“).

Wie der Rest des Repos: reines HTML/CSS/JS, kein Build, kein npm.

## Öffnen

- **Online:** https://yp69mnmw8g-create.github.io/standard/lego/
- **Lokal:** `lego/index.html` im Browser öffnen. Für frische Preise vorher einmal
  `node lego/fetch-prices.js` ausführen (Node 18+, keine Abhängigkeiten).

## Wie der Score funktioniert

Jedes Set bekommt pro Kriterium 0–10 Punkte; der Gesamtscore ist der gewichtete
Mittelwert. Die Gewichtung stellst du oben auf der Seite per Regler ein
(wird im Browser gespeichert):

| Kriterium | Datenquelle | Skala |
|---|---|---|
| **Preis pro Teil** | live (Bestpreis ÷ Teile) | 10 Punkte bei ≤ 6 ct/Teil, 0 ab 16 ct |
| **Rabatt zur UVP** | live | 10 Punkte ab 40 % unter UVP |
| **Minifiguren fürs Geld** | live (Figuren pro 100 €) | 10 Punkte ab 6 Figuren/100 € |
| **Prints statt Sticker** | deine Bewertung in `data/sets.js` | 0–10, leer = neutral 5 |
| **Aussehen** | deine Bewertung in `data/sets.js` | 0–10, leer = neutral 5 |

Dazu gibt es Filter (Thema, Maximalpreis, nur lieferbare, Suche) und
verschiedene Sortierungen. Jede Karte verlinkt direkt auf die
brickmerge-Preisübersicht mit dem günstigsten Shop.

## Sets hinzufügen / bewerten

Die automatisch entdeckten Top-Deals brauchen keine Pflege. Wer ein Set
dauerhaft beobachten oder bewerten will, trägt es in die Merkliste ein:
`lego/data/sets.js`. **Nur die Setnummer ist Pflicht** – Name, Teile,
Minifiguren, UVP, Bild, Thema und Preise kommen automatisch:

```js
{ number: "10307" },                                  // reicht schon
{ number: "21348", prints: 9, design: 8, note: "…" }, // mit eigener Bewertung
```

Nach dem Speichern werden die Daten beim nächsten Preis-Update geholt
(oder sofort lokal via `node lego/fetch-prices.js`).

## Wie die Preise aktuell bleiben

Der Workflow **Deploy to GitHub Pages** ruft bei jedem Deploy
`lego/fetch-prices.js` auf und läuft zusätzlich **zweimal täglich** per
Zeitplan (sowie manuell über den „Run workflow“-Knopf auf GitHub).
Schlägt der Abruf fehl, bleibt der zuletzt eingecheckte Stand sichtbar
(betroffene Sets werden als „Preis veraltet“ markiert).

Der Fetcher ist bewusst zurückhaltend: eine Anfrage alle 1,5 Sekunden,
eine Seite pro Set. Alle Angaben ohne Gewähr – vor dem Kauf den Preis
im Shop prüfen.

## Dateien

```
lego/
├── index.html        Seite (lädt Daten + app.js)
├── styles.css        Styling
├── app.js            Score, Gewichtung, Filter, Karten
├── fetch-prices.js   Node-Skript: holt Live-Daten von brickmerge
└── data/
    ├── sets.js       deine Merkliste + subjektive Bewertungen (editierbar)
    └── prices.js     automatisch erzeugte Live-Daten (nicht editieren)
```
