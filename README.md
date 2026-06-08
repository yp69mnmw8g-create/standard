# KCD2 Companion

Lokales Companion-Tool für **Kingdom Come: Deliverance 2**.
Komplett clientseitig (React + Vite), **keine Datenbank** — alle Spieldaten liegen
als JSON-Dateien im Projekt und können von dir selbst erweitert werden.

> ⚠️ Die mitgelieferten Daten sind **bewusst Dummy-/Platzhalter-Daten**
> (KCD2 ist neu, es werden keine echten Spieldaten erfunden).

## Features

- **Alchemie-Rezepte** – durchsuchbare Liste (Zutaten, Brau-Schritte, Wirkung),
  Filter nach Zutat und Wirkung, Detailansicht pro Rezept.
- **Quest-Übersicht** – Name, Beschreibung, empfohlenes Level, Voraussetzungen,
  Region, Status (offen/erledigt). Status wird lokal gehalten. Filter nach Region & Status.
- **Quest-Empfehlung** – aktuelles Level eingeben, erledigte Quests markieren →
  sortierte „Das solltest du als Nächstes machen"-Liste (Level, Voraussetzungen, Story-Logik).
- **Karten-Ansicht** – Quest oder Region wählen → Loot-Orte, Truhen und Händler
  derselben Region.

Der lokale Fortschritt (Level + erledigte Quests) wird im **localStorage** des
Browsers gespeichert und übersteht einen Reload.

## (a) Neue Einträge in die JSON-Dateien einpflegen

Alle Daten liegen unter `src/data/`. Einfach einen neuen Eintrag (Objekt) ans
Array anhängen. Die Filter-Dropdowns und abgeleiteten Listen aktualisieren sich
automatisch.

### `src/data/recipes.json` (Alchemie)
```json
{
  "id": "recipe-008",
  "name": "Mein neuer Trank",
  "ingredients": ["Zutat A", "Zutat B"],
  "steps": ["Schritt 1", "Schritt 2"],
  "effect": "Heilung",
  "effectDescription": "Was der Trank bewirkt.",
  "tier": "mittel"
}
```

### `src/data/quests.json` (Quests)
```json
{
  "id": "quest-009",
  "name": "Meine neue Quest",
  "description": "Worum es geht.",
  "recommendedLevel": 5,
  "prerequisites": ["quest-002"],
  "region": "Beispielwald",
  "storyOrder": 8
}
```
- `prerequisites`: Liste von Quest-`id`s, die vorher erledigt sein müssen.
- `region`: muss zu den Regionen passen, die du auch in `locations.json` verwendest,
  damit Karten-Ansicht und Filter zusammenpassen.
- `storyOrder`: kleinere Zahl = früher in der Story (steuert die Empfehlungs-Sortierung;
  optionale Nebenquests bekommen z. B. eine hohe Zahl wie `99`).

### `src/data/locations.json` (Loot-Orte / Karte)
```json
{
  "id": "loc-010",
  "name": "Neue Truhe",
  "region": "Beispielwald",
  "type": "Truhe",
  "note": "Hinweis zum Ort."
}
```
- `type`: `"Truhe"`, `"Händler"` oder `"Loot"`.

**Wichtig:** Jede `id` muss eindeutig sein. JSON nicht vergessen gültig zu halten
(keine Kommas hinter dem letzten Eintrag).

## (b) App lokal starten

Voraussetzung: Node.js (v18+; getestet mit v22).

```bash
npm install      # einmalig: Abhängigkeiten installieren
npm run dev      # Dev-Server starten → http://localhost:5173
```

Weitere Befehle:
```bash
npm run build    # Produktions-Build nach dist/
npm run preview  # gebauten Build lokal ansehen
```

## Projektstruktur (modular)

```
src/
├── main.jsx                  # Einstieg, Router + globaler State
├── App.jsx                   # Navigation + Routing der vier Bereiche
├── data/
│   ├── index.js              # zentraler Datenzugriff + abgeleitete Listen
│   ├── recipes.json          # Alchemie
│   ├── quests.json           # Quests
│   └── locations.json        # Loot-Orte / Karte
├── lib/
│   └── recommendations.js    # Empfehlungslogik (reine Funktion, testbar)
├── pages/                    # je ein Bereich
│   ├── AlchemyPage.jsx
│   ├── QuestsPage.jsx
│   ├── RecommendationsPage.jsx
│   └── MapPage.jsx
├── state/
│   └── QuestStateContext.jsx # Level + erledigte Quests (localStorage)
└── styles/                   # globales CSS
```

### Wie erweitere ich um einen neuen Bereich?
1. Neue Seite unter `src/pages/` anlegen.
2. In `src/App.jsx` einen Eintrag in `SECTIONS` und eine `<Route>` ergänzen.
3. Bei neuen Daten eine JSON-Datei in `src/data/` und den Export in `src/data/index.js` ergänzen.
