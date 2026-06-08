# KCD2 Companion

Lokale **Website** als Begleiter für **Kingdom Come: Deliverance 2**.
Reines HTML/CSS/JavaScript — **kein Node, kein npm, kein Build, kein Server nötig**.
Einfach `index.html` im Browser öffnen.

> ⚠️ Die mitgelieferten Daten sind **bewusst Dummy-/Platzhalter-Daten**
> (KCD2 ist neu, es werden keine echten Spieldaten erfunden).

## App öffnen

**Doppelklick auf `index.html`** — fertig. Die Seite läuft komplett im Browser.

Alternativ im Browser über *Datei → Öffnen* die `index.html` auswählen.

Dein Fortschritt (Level + erledigte Quests) wird im **localStorage** des Browsers
gespeichert und bleibt beim nächsten Öffnen erhalten.

## Features

- **Alchemie-Rezepte** – durchsuchbare Liste (Zutaten, Brau-Schritte, Wirkung),
  Filter nach Zutat und Wirkung, Detailansicht pro Rezept.
- **Quest-Übersicht** – Name, Beschreibung, empfohlenes Level, Voraussetzungen,
  Region, Status (offen/erledigt). Filter nach Region & Status.
- **Quest-Empfehlung** – aktuelles Level eingeben, erledigte Quests markieren →
  sortierte „Das solltest du als Nächstes machen"-Liste (Level, Voraussetzungen, Story-Logik).
- **Karten-Ansicht** – Quest oder Region wählen → Loot-Orte, Truhen und Händler
  derselben Region.

## Eigene Einträge einpflegen

Alle Daten liegen unter `data/`. Es sind normale Textdateien (`.js`) — mit jedem
Editor (z. B. Notepad) öffnen, einen neuen Eintrag ans Array anhängen, speichern,
Seite im Browser neu laden. **Wichtig:** das Komma zwischen den Einträgen nicht
vergessen, und jede `id` muss eindeutig sein.

### `data/recipes.js` (Alchemie)
```js
{
  id: "recipe-008",
  name: "Mein neuer Trank",
  ingredients: ["Zutat A", "Zutat B"],
  steps: ["Schritt 1", "Schritt 2"],
  effect: "Heilung",
  effectDescription: "Was der Trank bewirkt.",
  tier: "mittel",
},
```

### `data/quests.js` (Quests)
```js
{
  id: "quest-009",
  name: "Meine neue Quest",
  description: "Worum es geht.",
  recommendedLevel: 5,
  prerequisites: ["quest-002"],
  region: "Beispielwald",
  storyOrder: 8,
},
```
- `prerequisites`: Liste von Quest-`id`s, die vorher erledigt sein müssen.
- `region`: muss zu den Regionen in `locations.js` passen, damit die Karte verknüpft.
- `storyOrder`: kleinere Zahl = früher in der Story (steuert die Empfehlungs-Sortierung;
  optionale Nebenquests bekommen z. B. eine hohe Zahl wie `99`).

### `data/locations.js` (Loot-Orte / Karte)
```js
{
  id: "loc-010",
  name: "Neue Truhe",
  region: "Beispielwald",
  type: "Truhe",
  note: "Hinweis zum Ort.",
},
```
- `type`: `"Truhe"`, `"Händler"` oder `"Loot"`.

## Projektstruktur

```
index.html        Seitengerüst (lädt Daten + app.js)
styles.css        gesamtes Styling
app.js            Logik: Navigation, Filter, Empfehlung, Karte, Speicherung
data/
├── recipes.js    Alchemie
├── quests.js     Quests
└── locations.js  Loot-Orte / Karte
```

### Wie erweitere ich um einen neuen Bereich?
1. In `app.js` eine `render…`-Funktion schreiben.
2. Einen Eintrag im `SECTIONS`-Array ergänzen (Navigation aktualisiert sich automatisch).
3. Bei neuen Daten eine Datei unter `data/` anlegen und in `index.html` per
   `<script>` einbinden.

---

**Hinweis:** Die Daten liegen als `.js`-Dateien (statt `.json`) vor, damit die
Seite direkt per Doppelklick funktioniert — beim Öffnen über `file://` dürfen
Browser aus Sicherheitsgründen keine `.json`-Dateien nachladen. Inhaltlich ist es
dasselbe; du editierst die Einträge genauso bequem.
