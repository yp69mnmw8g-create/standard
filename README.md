# KCD2 Companion

A local **website** companion for **Kingdom Come: Deliverance 2**.
Plain HTML/CSS/JavaScript — **no Node, no npm, no build, no server required**.
Just open `index.html` in a browser, or use the hosted version.

## Open it

- **Locally:** double-click `index.html`. Runs entirely in your browser, offline.
- **Online (GitHub Pages):** https://yp69mnmw8g-create.github.io/standard/
  (auto-deploys on every push.)

Your progress (level + completed quests) is stored in the browser's
**localStorage**, so it survives reloads.

## Features

- **Quests** – all main and side quests with name, description, region, type,
  story order, prerequisites and missable flags. Filter by region, type and status.
  Mark quests done (stored locally).
- **What to do next** – story-aware recommendations: the next main quest, plus
  the side quests available right now, with **point-of-no-return** warnings.
- **Map** – pick a region or a quest to see merchants and landmarks in that region.

### How the recommendations work
KCD2 has **no official "recommended level" per quest**, so recommendations are
based on:
1. **Story order** – main quests form a linear chain (each needs the previous one).
2. **Prerequisites** – some side quests require another quest first
   (e.g. *Kuttenberg Tournament* needs *Ars Dimicatoria*).
3. **Region unlock** – Kuttenberg quests appear only after the main quest *Storm*.
4. **Points of no return** – *Necessary Evil* (Trosky) and *Oratores* (Kuttenberg)
   can lock that region's side content; the app warns you to finish those first.

The level field is optional and shown for your own reference only.

## Editing the data

All data lives under `data/` as plain `.js` files. Open with any text editor,
append a new object to the array, save, reload the page. Keep each `id` unique
and don't forget the comma between entries.

### `data/quests.js`
```js
{
  id: "sk25",
  name: "My new side quest",
  type: "side",            // "main" | "side"
  region: "Kuttenberg",    // "Trosky" | "Kuttenberg"
  description: "What it's about.",
  storyOrder: null,        // main quests: 1..32; side quests: null
  prerequisites: ["sk03"], // quest ids that must be completed first
  missable: false,         // optional
  note: "Optional hint",   // optional
},
```

### `data/locations.js`
```js
{
  id: "loc-k10",
  name: "Hidden chest",
  region: "Kuttenberg",
  area: "Sedlec",
  type: "Treasure",        // Merchant | Notable | Chest | Treasure | Loot
  note: "Behind the chapel.",
},
```

## Project structure

```
index.html        page shell (loads data + app.js)
styles.css        styling
app.js            logic: nav, filters, recommendations, map, storage
data/
├── quests.js     all main + side quests
└── locations.js  merchants & landmarks
```

## Data accuracy & sources

Quest lists and locations are taken from public guides/wikis. Side-quest
descriptions are kept short on purpose to avoid spoilers/errors; the map is a
curated starter set of confirmed merchants and landmarks — KCD2 has hundreds of
treasure/chest spots, so add your own finds as you play (use type `Treasure`/`Chest`).

Sources:
- https://game-checklists.com/kcd2/main-quests-checklist/
- https://game-checklists.com/kcd2/side-quests-checklist/
- https://kingdomcomedeliverance2.wiki.fextralife.com/Quests
- https://kingdomcomedeliverance2.wiki.fextralife.com/Vendors
- https://www.powerpyx.com/kingdom-come-deliverance-2-full-walkthrough-all-main-quests/
