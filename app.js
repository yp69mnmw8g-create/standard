/*
  KCD2 Companion — reine Website (Vanilla JS, kein Framework, kein Build).
  Aufbau:
    - Daten kommen aus data/*.js (window.KCD2_RECIPES/QUESTS/LOCATIONS)
    - State (Level + erledigte Quests) liegt im localStorage
    - vier Bereiche, umgeschaltet über die Navigation (Hash in der URL)
  Neue Bereiche: render-Funktion schreiben + Eintrag in SECTIONS ergänzen.
*/
(function () {
  "use strict";

  // ---- Daten ----
  const RECIPES = window.KCD2_RECIPES || [];
  const QUESTS = window.KCD2_QUESTS || [];
  const LOCATIONS = window.KCD2_LOCATIONS || [];
  const QUEST_BY_ID = Object.fromEntries(QUESTS.map((q) => [q.id, q]));

  const uniqueSorted = (arr) =>
    [...new Set(arr.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "de"));

  const ALL_INGREDIENTS = uniqueSorted(RECIPES.flatMap((r) => r.ingredients));
  const ALL_EFFECTS = uniqueSorted(RECIPES.map((r) => r.effect));
  const ALL_REGIONS = uniqueSorted([
    ...QUESTS.map((q) => q.region),
    ...LOCATIONS.map((l) => l.region),
  ]);

  // ---- State (localStorage) ----
  const STORAGE_KEY = "kcd2-companion.state.v1";

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      return {
        level: Number(parsed.level) || 1,
        completed: new Set(Array.isArray(parsed.completed) ? parsed.completed : []),
      };
    } catch {
      return { level: 1, completed: new Set() };
    }
  }

  const state = loadState();

  function saveState() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ level: state.level, completed: [...state.completed] })
    );
  }

  function toggleCompleted(id) {
    if (state.completed.has(id)) state.completed.delete(id);
    else state.completed.add(id);
    saveState();
  }

  // ---- kleine DOM-Helfer ----
  function h(tag, props, ...children) {
    const node = document.createElement(tag);
    if (props) {
      for (const [k, v] of Object.entries(props)) {
        if (k === "class") node.className = v;
        else if (k === "html") node.innerHTML = v;
        else if (k.startsWith("on") && typeof v === "function") {
          node.addEventListener(k.slice(2).toLowerCase(), v);
        } else if (v !== null && v !== undefined && v !== false) {
          node.setAttribute(k, v);
        }
      }
    }
    for (const c of children.flat()) {
      if (c === null || c === undefined || c === false) continue;
      node.appendChild(typeof c === "string" || typeof c === "number"
        ? document.createTextNode(String(c))
        : c);
    }
    return node;
  }

  function pageHeader(title, subtitle) {
    return h("div", { class: "page__header" }, h("h2", null, title), h("p", null, subtitle));
  }

  function selectField(id, label, value, options, onChange, includeAll = true) {
    const sel = h("select", { id, onchange: (e) => onChange(e.target.value) });
    if (includeAll) sel.appendChild(h("option", { value: "" }, "Alle"));
    for (const opt of options) {
      const o = h("option", { value: opt }, opt);
      if (opt === value) o.selected = true;
      sel.appendChild(o);
    }
    return h("div", { class: "field" }, h("label", { for: id }, label), sel);
  }

  // ===========================================================
  //  Bereich 1: Alchemie
  // ===========================================================
  const alchemy = { search: "", ingredient: "", effect: "", selectedId: null };

  function renderAlchemy() {
    // Filtert immer auf Basis des aktuellen alchemy-States (für die Live-Suche).
    function computeFiltered() {
      const q = alchemy.search.trim().toLowerCase();
      return RECIPES.filter((r) => {
        const matchesSearch =
          !q ||
          r.name.toLowerCase().includes(q) ||
          r.ingredients.some((i) => i.toLowerCase().includes(q)) ||
          r.effectDescription.toLowerCase().includes(q);
        const matchesIngredient = !alchemy.ingredient || r.ingredients.includes(alchemy.ingredient);
        const matchesEffect = !alchemy.effect || r.effect === alchemy.effect;
        return matchesSearch && matchesIngredient && matchesEffect;
      });
    }

    const searchField = h(
      "div",
      { class: "field", style: "flex:1 1 220px" },
      h("label", { for: "alch-search" }, "Suche"),
      h("input", {
        id: "alch-search",
        type: "search",
        placeholder: "Name, Zutat oder Wirkung…",
        value: alchemy.search,
        oninput: (e) => {
          alchemy.search = e.target.value;
          // Nur die Liste austauschen, damit der Tastaturfokus im Suchfeld bleibt.
          rerenderInto(buildAlchemyList(), "alch-list");
        },
      })
    );

    function buildAlchemyList() {
      const items = computeFiltered();
      const list = h("div", { class: "list", id: "alch-list" });
      if (items.length === 0) list.appendChild(h("div", { class: "empty" }, "Keine Rezepte gefunden."));
      for (const r of items) {
        list.appendChild(
          h(
            "button",
            {
              class: "card clickable" + (r.id === alchemy.selectedId ? " card--selected" : ""),
              onclick: () => {
                alchemy.selectedId = r.id;
                render();
              },
            },
            h("div", { class: "row-between" }, h("strong", null, r.name), h("span", { class: "tag tag--accent" }, r.effect)),
            h("p", { class: "muted", style: "margin:0.4rem 0 0" }, r.ingredients.join(", "))
          )
        );
      }
      return list;
    }

    const selected = RECIPES.find((r) => r.id === alchemy.selectedId) || null;
    const detail = h("div", { class: "detail" },
      selected
        ? h("div", { class: "card" },
            h("div", { class: "row-between" }, h("h3", null, selected.name), h("span", { class: "tag tag--accent" }, selected.effect)),
            h("p", null, selected.effectDescription),
            h("h4", null, "Zutaten"),
            h("ul", null, selected.ingredients.map((i) => h("li", null, i))),
            h("h4", null, "Brau-Schritte"),
            h("ol", null, selected.steps.map((s) => h("li", null, s))),
            selected.tier ? h("p", { class: "muted" }, "Stärke: " + selected.tier) : null
          )
        : h("div", { class: "card empty" }, "Wähle links ein Rezept für die Detailansicht.")
    );

    return h("div", null,
      pageHeader("⚗️ Alchemie-Rezepte", "Durchsuchbare Rezepte mit Zutaten, Brau-Schritten und Wirkung."),
      h("div", { class: "toolbar" },
        searchField,
        selectField("alch-ingredient", "Zutat", alchemy.ingredient, ALL_INGREDIENTS, (v) => { alchemy.ingredient = v; render(); }),
        selectField("alch-effect", "Wirkung", alchemy.effect, ALL_EFFECTS, (v) => { alchemy.effect = v; render(); })
      ),
      h("div", { class: "split" }, buildAlchemyList(), detail)
    );
  }

  // ===========================================================
  //  Bereich 2: Quests
  // ===========================================================
  const questsFilter = { region: "", status: "" };

  function questCard(qst) {
    const done = state.completed.has(qst.id);
    const prereq = qst.prerequisites.length
      ? h("span", { class: "tag" }, "Voraussetzung: " + qst.prerequisites.map((id) => (QUEST_BY_ID[id] && QUEST_BY_ID[id].name) || id).join(", "))
      : null;

    const checkbox = h("input", { type: "checkbox" });
    checkbox.checked = done;
    checkbox.addEventListener("change", () => { toggleCompleted(qst.id); render(); });

    return h("div", { class: "card" },
      h("div", { class: "row-between" },
        h("h3", { style: "margin:0" }, qst.name),
        h("span", { class: "tag " + (done ? "tag--ok" : "tag--open") }, done ? "Erledigt" : "Offen")
      ),
      h("p", { style: "margin:0.4rem 0" }, qst.description),
      h("div", { class: "tag-row" },
        h("span", { class: "tag" }, "📍 " + qst.region),
        h("span", { class: "tag badge-level" }, "Level " + qst.recommendedLevel),
        prereq
      ),
      h("label", { class: "checkbox-row" }, checkbox, "Als erledigt markieren")
    );
  }

  function renderQuests() {
    const filtered = QUESTS.filter((qst) => {
      const matchesRegion = !questsFilter.region || qst.region === questsFilter.region;
      const done = state.completed.has(qst.id);
      const matchesStatus = !questsFilter.status || (questsFilter.status === "done" ? done : !done);
      return matchesRegion && matchesStatus;
    });

    const list = h("div", { class: "list" });
    if (filtered.length === 0) list.appendChild(h("div", { class: "empty" }, "Keine Quests für diese Filter."));
    filtered.forEach((qst) => list.appendChild(questCard(qst)));

    return h("div", null,
      pageHeader("📜 Quest-Übersicht", "Status (offen/erledigt) wird lokal gespeichert. Filtere nach Region und Status."),
      h("div", { class: "toolbar" },
        selectField("quest-region", "Region", questsFilter.region, ALL_REGIONS, (v) => { questsFilter.region = v; render(); }),
        selectField("quest-status", "Status", questsFilter.status, ["Offen", "Erledigt"], (v) => {
          questsFilter.status = v === "Offen" ? "open" : v === "Erledigt" ? "done" : "";
          render();
        })
      ),
      list
    );
  }

  // ===========================================================
  //  Bereich 3: Empfehlung
  // ===========================================================
  function missingPrerequisites(qst) {
    return (qst.prerequisites || [])
      .filter((id) => !state.completed.has(id))
      .map((id) => (QUEST_BY_ID[id] && QUEST_BY_ID[id].name) || id);
  }

  function recommendQuests() {
    const statusRank = { ready: 0, soon: 1, locked: 2 };
    return QUESTS.filter((qst) => !state.completed.has(qst.id))
      .map((qst) => {
        const missing = missingPrerequisites(qst);
        const prereqsMet = missing.length === 0;
        const levelMet = state.level >= qst.recommendedLevel;
        const levelGap = Math.max(0, qst.recommendedLevel - state.level);

        let status = "ready";
        if (!prereqsMet) status = "locked";
        else if (!levelMet) status = "soon";

        const reasons = [];
        if (status === "ready") reasons.push("Level ausreichend", "Voraussetzungen erfüllt");
        if (status === "soon") reasons.push("Level " + qst.recommendedLevel + " empfohlen (dir fehlen " + levelGap + ")");
        if (status === "locked") reasons.push("Zuerst erledigen: " + missing.join(", "));

        return { quest: qst, status, reasons };
      })
      .sort((a, b) => {
        if (statusRank[a.status] !== statusRank[b.status]) return statusRank[a.status] - statusRank[b.status];
        const soA = a.quest.storyOrder == null ? 999 : a.quest.storyOrder;
        const soB = b.quest.storyOrder == null ? 999 : b.quest.storyOrder;
        if (soA !== soB) return soA - soB;
        return a.quest.recommendedLevel - b.quest.recommendedLevel;
      });
  }

  const STATUS_META = {
    ready: { label: "Bereit", cls: "tag--ok" },
    soon: { label: "Bald", cls: "tag--accent" },
    locked: { label: "Gesperrt", cls: "tag--open" },
  };

  function renderRecommendations() {
    const levelInput = h("input", { id: "rec-level", type: "number", min: "1", value: state.level, style: "width:7rem" });
    levelInput.addEventListener("input", (e) => {
      state.level = Math.max(1, Number(e.target.value) || 1);
      saveState();
      render();
    });

    const completedList = h("div", { class: "list" });
    QUESTS.forEach((qst) => {
      const cb = h("input", { type: "checkbox" });
      cb.checked = state.completed.has(qst.id);
      cb.addEventListener("change", () => { toggleCompleted(qst.id); render(); });
      completedList.appendChild(
        h("label", { class: "card checkbox-row" }, cb,
          h("span", null, h("strong", null, qst.name), h("br"), h("span", { class: "muted" }, qst.region + " · Level " + qst.recommendedLevel))
        )
      );
    });

    const recs = recommendQuests();
    const recList = h("div", { class: "list" });
    if (recs.length === 0) recList.appendChild(h("div", { class: "empty" }, "Alle Quests erledigt — gut gemacht! 🎉"));
    recs.forEach((rec, idx) => {
      const meta = STATUS_META[rec.status];
      recList.appendChild(
        h("div", { class: "card" },
          h("div", { class: "row-between" },
            h("div", { style: "display:flex;gap:0.75rem;align-items:baseline" },
              h("span", { class: "rec-rank" }, idx + 1), h("strong", null, rec.quest.name)),
            h("span", { class: "tag " + meta.cls }, meta.label)
          ),
          h("div", { class: "tag-row" },
            h("span", { class: "tag" }, "📍 " + rec.quest.region),
            h("span", { class: "tag badge-level" }, "Level " + rec.quest.recommendedLevel)
          ),
          h("ul", { class: "muted", style: "margin:0.3rem 0 0;padding-left:1.2rem" }, rec.reasons.map((r) => h("li", null, r)))
        )
      );
    });

    const resetBtn = h("button", { onclick: () => {
      state.level = 1;
      state.completed = new Set();
      saveState();
      render();
    } }, "Fortschritt zurücksetzen");

    return h("div", null,
      pageHeader("🎯 Quest-Empfehlung", "Gib dein Level ein und markiere erledigte Quests — sortiert nach Level, Voraussetzungen und Story-Logik."),
      h("div", { class: "toolbar" },
        h("div", { class: "field" }, h("label", { for: "rec-level" }, "Dein aktuelles Level"), levelInput),
        h("div", { class: "field" }, h("label", null, " "), resetBtn)
      ),
      h("div", { class: "split" },
        h("div", null, h("h3", null, "Erledigte Quests"), completedList),
        h("div", null, h("h3", null, "Das solltest du als Nächstes machen"), recList)
      )
    );
  }

  // ===========================================================
  //  Bereich 4: Karte
  // ===========================================================
  const TYPE_ICON = { Truhe: "🧰", "Händler": "🪙", Loot: "💰" };
  const mapState = { mode: "region", region: ALL_REGIONS[0] || "", questId: (QUESTS[0] && QUESTS[0].id) || "" };

  function renderMap() {
    const activeRegion = mapState.mode === "quest"
      ? ((QUEST_BY_ID[mapState.questId] && QUEST_BY_ID[mapState.questId].region) || "")
      : mapState.region;

    const inRegion = LOCATIONS.filter((l) => l.region === activeRegion);
    const questsInRegion = QUESTS.filter((qst) => qst.region === activeRegion);

    // Auswahl-Feld je nach Modus
    let selector;
    if (mapState.mode === "region") {
      selector = selectField("map-region", "Region", mapState.region, ALL_REGIONS, (v) => { mapState.region = v; render(); }, false);
    } else {
      const sel = h("select", { id: "map-quest", onchange: (e) => { mapState.questId = e.target.value; render(); } });
      QUESTS.forEach((qst) => {
        const o = h("option", { value: qst.id }, qst.name);
        if (qst.id === mapState.questId) o.selected = true;
        sel.appendChild(o);
      });
      selector = h("div", { class: "field" }, h("label", { for: "map-quest" }, "Quest"), sel);
    }

    const modeSel = h("select", { id: "map-mode", onchange: (e) => { mapState.mode = e.target.value; render(); } });
    [["region", "Region"], ["quest", "Quest"]].forEach(([val, lbl]) => {
      const o = h("option", { value: val }, lbl);
      if (val === mapState.mode) o.selected = true;
      modeSel.appendChild(o);
    });

    const grid = h("div", { class: "grid" });
    if (inRegion.length === 0) grid.appendChild(h("div", { class: "empty" }, "Keine Orte in dieser Region erfasst."));
    inRegion.forEach((l) => {
      grid.appendChild(
        h("div", { class: "card" },
          h("div", { class: "row-between" }, h("strong", null, l.name), h("span", { class: "tag tag--accent" }, (TYPE_ICON[l.type] || "📌") + " " + l.type)),
          h("p", { class: "muted", style: "margin:0.4rem 0 0" }, l.note)
        )
      );
    });

    return h("div", null,
      pageHeader("🗺️ Karten-Ansicht", "Wähle eine Quest oder Region und sieh Loot-Orte, Truhen und Händler derselben Region."),
      h("div", { class: "toolbar" },
        h("div", { class: "field" }, h("label", { for: "map-mode" }, "Auswahl über"), modeSel),
        selector
      ),
      h("div", { class: "card", style: "margin-bottom:1rem" },
        h("strong", null, "Aktive Region: "), activeRegion || "—",
        questsInRegion.length ? h("p", { class: "muted", style: "margin:0.4rem 0 0" }, "Quests hier: " + questsInRegion.map((q) => q.name).join(", ")) : null
      ),
      h("h3", null, "Orte in dieser Region"),
      grid
    );
  }

  // ===========================================================
  //  Navigation + Router
  // ===========================================================
  const SECTIONS = [
    { id: "alchemie", label: "Alchemie", icon: "⚗️", render: renderAlchemy },
    { id: "quests", label: "Quests", icon: "📜", render: renderQuests },
    { id: "empfehlung", label: "Empfehlung", icon: "🎯", render: renderRecommendations },
    { id: "karte", label: "Karte", icon: "🗺️", render: renderMap },
  ];

  function currentSection() {
    const id = (location.hash || "").replace("#", "");
    return SECTIONS.find((s) => s.id === id) || SECTIONS[0];
  }

  // Ersetzt eine bereits gerenderte Liste in-place (z. B. Live-Suche) ohne Fokusverlust.
  function rerenderInto(newNode, id) {
    const old = document.getElementById(id);
    if (old && old.parentNode) old.parentNode.replaceChild(newNode, old);
  }

  function renderNav() {
    const nav = document.getElementById("nav");
    nav.innerHTML = "";
    const active = currentSection();
    SECTIONS.forEach((s) => {
      const a = h("a", {
        class: "app__nav-link" + (s.id === active.id ? " app__nav-link--active" : ""),
        href: "#" + s.id,
      }, s.icon + " " + s.label);
      nav.appendChild(a);
    });
  }

  function render() {
    renderNav();
    const view = document.getElementById("view");
    view.innerHTML = "";
    view.appendChild(currentSection().render());
  }

  window.addEventListener("hashchange", render);
  render();
})();
