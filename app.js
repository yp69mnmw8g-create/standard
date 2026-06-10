/*
  KCD2 Companion — static website (vanilla JS, no framework, no build).
    - Data comes from data/*.js (window.KCD2_QUESTS / KCD2_LOCATIONS)
    - State (level + completed quests + checklist) is stored in localStorage
    - Sections are switched via the nav (URL hash)
  Add a section: write a render function + add an entry to SECTIONS.
*/
(function () {
  "use strict";

  // ---- Data ----
  const QUESTS = window.KCD2_QUESTS || [];
  const LOCATIONS = window.KCD2_LOCATIONS || [];
  const CHECKLIST = window.KCD2_CHECKLIST || {};
  const PERKS = window.KCD2_PERKS || [];
  const GEAR = window.KCD2_GEAR || [];
  const QUEST_BY_ID = Object.fromEntries(QUESTS.map((q) => [q.id, q]));

  // Story rules (see data/quests.js)
  const KUTTENBERG_UNLOCK = "mq12"; // completing "Storm" unlocks Kuttenberg
  const PONR = { Trosky: "mq08", Kuttenberg: "mq24" }; // points of no return

  const uniqueSorted = (arr) =>
    [...new Set(arr.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "en"));

  const ALL_REGIONS = uniqueSorted([
    ...QUESTS.map((q) => q.region),
    ...LOCATIONS.map((l) => l.region),
  ]);

  // ---- State (localStorage) ----
  const STORAGE_KEY = "kcd2-companion.state.v2";

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      return {
        level: Number(parsed.level) || 1,
        completed: new Set(Array.isArray(parsed.completed) ? parsed.completed : []),
        checklist: new Set(Array.isArray(parsed.checklist) ? parsed.checklist : []),
        perks: new Set(Array.isArray(parsed.perks) ? parsed.perks : []),
        gear: new Set(Array.isArray(parsed.gear) ? parsed.gear : []),
        notes: parsed.notes && typeof parsed.notes === "object" ? parsed.notes : {},
      };
    } catch {
      return { level: 1, completed: new Set(), checklist: new Set(), perks: new Set(), gear: new Set(), notes: {} };
    }
  }

  const state = loadState();

  function saveState() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        level: state.level,
        completed: [...state.completed],
        checklist: [...state.checklist],
        perks: [...state.perks],
        gear: [...state.gear],
        notes: state.notes,
      })
    );
  }

  function toggleCompleted(id) {
    if (state.completed.has(id)) state.completed.delete(id);
    else state.completed.add(id);
    saveState();
  }

  function toggleChecklist(id) {
    if (state.checklist.has(id)) state.checklist.delete(id);
    else state.checklist.add(id);
    saveState();
  }

  function togglePerk(id) {
    if (state.perks.has(id)) state.perks.delete(id);
    else state.perks.add(id);
    saveState();
  }

  function toggleGear(id) {
    if (state.gear.has(id)) state.gear.delete(id);
    else state.gear.add(id);
    saveState();
  }

  // ---- DOM helpers ----
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
      node.appendChild(
        typeof c === "string" || typeof c === "number"
          ? document.createTextNode(String(c))
          : c
      );
    }
    return node;
  }

  function pageHeader(title, subtitle) {
    return h("div", { class: "page__header" }, h("h2", null, title), h("p", null, subtitle));
  }

  function selectField(id, label, value, options, onChange, allLabel = "All") {
    const sel = h("select", { id, onchange: (e) => onChange(e.target.value) });
    sel.appendChild(h("option", { value: "" }, allLabel));
    for (const opt of options) {
      const o = h("option", { value: opt.value ?? opt }, opt.label ?? opt);
      if ((opt.value ?? opt) === value) o.selected = true;
      sel.appendChild(o);
    }
    return h("div", { class: "field" }, h("label", { for: id }, label), sel);
  }

  function prereqNames(q) {
    return (q.prerequisites || []).map((id) => (QUEST_BY_ID[id] && QUEST_BY_ID[id].name) || id);
  }

  const TYPE_LABEL = { main: "Main quest", side: "Side quest", task: "Task" };
  const TYPE_SHORT = { main: "Main", side: "Side", task: "Task" };
  const TYPE_ORDER = { main: 0, side: 1, task: 2 };

  function regionUnlocked(region) {
    if (region === "Kuttenberg") return state.completed.has(KUTTENBERG_UNLOCK);
    return true; // Trosky is available from the start
  }

  function ponrNote(region) {
    const id = PONR[region];
    if (id && !state.completed.has(id)) {
      const name = QUEST_BY_ID[id] && QUEST_BY_ID[id].name;
      return 'Do before "' + name + '" (point of no return for ' + region + ")";
    }
    return null;
  }

  // ===========================================================
  //  Section 1: Quests (browse)
  // ===========================================================
  const questsFilter = { region: "", status: "", type: "", selectedId: null };

  // Compact, clickable list entry.
  function questListItem(qst, selected) {
    const done = state.completed.has(qst.id);
    return h(
      "button",
      {
        class: "card clickable" + (selected ? " card--selected" : ""),
        onclick: () => {
          questsFilter.selectedId = qst.id;
          render();
        },
      },
      h(
        "div",
        { class: "row-between" },
        h("strong", null, qst.name),
        h("span", { class: "tag " + (done ? "tag--ok" : "tag--open") }, done ? "Done" : "Open")
      ),
      h(
        "div",
        { class: "tag-row", style: "margin:0.35rem 0 0" },
        h("span", { class: "tag tag--accent" }, TYPE_SHORT[qst.type] || qst.type),
        h("span", { class: "tag" }, "📍 " + qst.region),
        qst.storyOrder ? h("span", { class: "tag" }, "#" + qst.storyOrder) : null,
        qst.missable ? h("span", { class: "tag tag--warn" }, "Missable") : null,
        state.notes[qst.id] ? h("span", { class: "tag" }, "📝") : null
      )
    );
  }

  // Full detail panel for one quest.
  function questDetail(qst) {
    if (!qst) return h("div", { class: "card empty" }, "Select a quest to see its details.");
    const done = state.completed.has(qst.id);
    const missing = prereqNames(qst).filter((_, i) => !state.completed.has(qst.prerequisites[i]));

    const checkbox = h("input", { type: "checkbox" });
    checkbox.checked = done;
    checkbox.addEventListener("change", () => {
      toggleCompleted(qst.id);
      render();
    });

    const infoRow = (label, value) =>
      value ? h("p", { style: "margin:0.2rem 0" }, h("span", { class: "muted" }, label + ": "), value) : null;

    return h(
      "div",
      { class: "card detail" },
      h(
        "div",
        { class: "row-between" },
        h("h3", { style: "margin:0" }, qst.name),
        h("span", { class: "tag " + (done ? "tag--ok" : "tag--open") }, done ? "Done" : "Open")
      ),
      h(
        "div",
        { class: "tag-row" },
        h("span", { class: "tag tag--accent" }, TYPE_LABEL[qst.type] || qst.type),
        h("span", { class: "tag" }, "📍 " + qst.region),
        qst.storyOrder ? h("span", { class: "tag" }, "Story #" + qst.storyOrder) : null,
        qst.missable ? h("span", { class: "tag tag--warn" }, "Missable") : null
      ),
      infoRow("Quest giver", qst.giver),
      infoRow("What to do", qst.description),
      qst.prerequisites.length ? infoRow("Requires", prereqNames(qst).join(", ")) : null,
      missing.length
        ? h("p", { class: "muted", style: "margin:0.2rem 0 0" }, "🔒 Still locked until you finish: " + missing.join(", "))
        : null,
      qst.note ? h("p", { style: "margin:0.4rem 0 0;color:var(--danger)" }, "⚠️ " + qst.note) : null,
      h("label", { class: "checkbox-row", style: "margin-top:0.8rem" }, checkbox, "Mark as done"),
      h("h4", { style: "margin:1rem 0 0.3rem" }, "Your notes"),
      (function () {
        // Saved on every keystroke, no re-render (keeps the cursor in place).
        const ta = h("textarea", {
          rows: "4",
          placeholder: "Private notes for this quest — stored locally.",
          style: "width:100%;resize:vertical;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);padding:0.5rem 0.7rem;color:var(--text);font:inherit",
        });
        ta.value = state.notes[qst.id] || "";
        ta.addEventListener("input", () => {
          if (ta.value.trim()) state.notes[qst.id] = ta.value;
          else delete state.notes[qst.id];
          saveState();
        });
        return ta;
      })()
    );
  }

  function renderQuests() {
    const filtered = QUESTS.filter((qst) => {
      const matchesRegion = !questsFilter.region || qst.region === questsFilter.region;
      const matchesType = !questsFilter.type || qst.type === questsFilter.type;
      const done = state.completed.has(qst.id);
      const matchesStatus =
        !questsFilter.status || (questsFilter.status === "done" ? done : !done);
      return matchesRegion && matchesType && matchesStatus;
    });

    // Main quests by story order first, then side quests, then tasks (by name).
    filtered.sort((a, b) => {
      if (a.type !== b.type) return (TYPE_ORDER[a.type] ?? 9) - (TYPE_ORDER[b.type] ?? 9);
      if (a.type === "main") return (a.storyOrder || 0) - (b.storyOrder || 0);
      return a.name.localeCompare(b.name, "en");
    });

    // Resolve the selected quest (must still be in the filtered set).
    let selected = filtered.find((q) => q.id === questsFilter.selectedId) || null;

    const list = h("div", { class: "list" });
    if (filtered.length === 0) list.appendChild(h("div", { class: "empty" }, "No quests match these filters."));
    filtered.forEach((qst) => list.appendChild(questListItem(qst, selected && qst.id === selected.id)));

    const doneCount = QUESTS.filter((q) => state.completed.has(q.id)).length;

    return h(
      "div",
      null,
      pageHeader(
        "📜 Quests",
        "All main and side quests. Click a quest for details (giver, what to do). Status is stored locally."
      ),
      h(
        "div",
        { class: "toolbar" },
        selectField("quest-region", "Region", questsFilter.region, ALL_REGIONS, (v) => {
          questsFilter.region = v;
          render();
        }),
        selectField(
          "quest-type",
          "Type",
          questsFilter.type,
          [{ value: "main", label: "Main" }, { value: "side", label: "Side" }, { value: "task", label: "Task" }],
          (v) => {
            questsFilter.type = v;
            render();
          }
        ),
        selectField(
          "quest-status",
          "Status",
          questsFilter.status,
          [{ value: "open", label: "Open" }, { value: "done", label: "Done" }],
          (v) => {
            questsFilter.status = v;
            render();
          }
        ),
        h("div", { class: "field" }, h("label", null, "Progress"), h("div", { class: "muted", style: "padding:0.5rem 0" }, doneCount + " / " + QUESTS.length + " done"))
      ),
      h("div", { class: "split" }, list, questDetail(selected))
    );
  }

  // ===========================================================
  //  Section 2: Recommendation ("what to do next")
  // ===========================================================
  function recommend() {
    const incomplete = QUESTS.filter((q) => !state.completed.has(q.id));
    const prereqMet = (q) => (q.prerequisites || []).every((id) => state.completed.has(id));
    const available = incomplete.filter((q) => prereqMet(q) && regionUnlocked(q.region));

    const mains = available
      .filter((q) => q.type === "main")
      .sort((a, b) => (a.storyOrder || 0) - (b.storyOrder || 0));
    const next = mains[0] || null;

    const availableSide = available
      .filter((q) => q.type === "side" || q.type === "task")
      .sort((a, b) => {
        if (!!a.missable !== !!b.missable) return a.missable ? -1 : 1;
        if (a.type !== b.type) return (TYPE_ORDER[a.type] ?? 9) - (TYPE_ORDER[b.type] ?? 9);
        if (a.region !== b.region) return a.region.localeCompare(b.region, "en");
        return a.name.localeCompare(b.name, "en");
      });

    return { next, availableSide, lockedCount: incomplete.length - available.length };
  }

  function recCard(qst, rank) {
    const note = ponrNote(qst.region);
    return h(
      "div",
      { class: "card" },
      h(
        "div",
        { class: "row-between" },
        h(
          "div",
          { style: "display:flex;gap:0.75rem;align-items:baseline" },
          rank ? h("span", { class: "rec-rank" }, rank) : null,
          h("strong", null, qst.name)
        ),
        h("span", { class: "tag tag--accent" }, TYPE_SHORT[qst.type] || qst.type)
      ),
      h("p", { class: "muted", style: "margin:0.3rem 0" }, qst.description || ""),
      h(
        "div",
        { class: "tag-row" },
        h("span", { class: "tag" }, "📍 " + qst.region),
        qst.storyOrder ? h("span", { class: "tag" }, "Story #" + qst.storyOrder) : null,
        qst.missable ? h("span", { class: "tag tag--warn" }, "Missable") : null
      ),
      qst.note ? h("p", { class: "muted", style: "margin:0.2rem 0 0" }, "⚠️ " + qst.note) : null,
      note ? h("p", { class: "muted", style: "margin:0.2rem 0 0" }, "⏳ " + note) : null
    );
  }

  function renderRecommendations() {
    const levelInput = h("input", { id: "rec-level", type: "number", min: "1", value: state.level, style: "width:7rem" });
    levelInput.addEventListener("input", (e) => {
      state.level = Math.max(1, Number(e.target.value) || 1);
      saveState();
    });

    const resetBtn = h(
      "button",
      {
        onclick: () => {
          if (!confirm("Reset level and all completed quests?")) return;
          state.level = 1;
          state.completed = new Set();
          saveState();
          render();
        },
      },
      "Reset progress"
    );

    const { next, availableSide, lockedCount } = recommend();

    const nextBox = next
      ? recCard(next)
      : h("div", { class: "card empty" }, state.completed.size ? "No main quest available right now." : "Start with the first main quest.");

    const sideList = h("div", { class: "list" });
    if (availableSide.length === 0) sideList.appendChild(h("div", { class: "empty" }, "No side quests available right now."));
    availableSide.forEach((q, i) => sideList.appendChild(recCard(q, i + 1)));

    return h(
      "div",
      null,
      pageHeader(
        "🎯 What to do next",
        "Recommendations are based on story order, prerequisites and points of no return. Mark completed quests on the Quests page (or below)."
      ),
      h(
        "div",
        { class: "toolbar" },
        h("div", { class: "field" }, h("label", { for: "rec-level" }, "Your level (optional)"), levelInput),
        h("div", { class: "field" }, h("label", null, " "), resetBtn),
        h("div", { class: "field" }, h("label", null, "Locked"), h("div", { class: "muted", style: "padding:0.5rem 0" }, lockedCount + " quest(s) need prerequisites"))
      ),
      h("h3", null, "Next in the story"),
      nextBox,
      h("h3", { style: "margin-top:1.25rem" }, "Side quests & tasks available now"),
      sideList
    );
  }

  // ===========================================================
  //  Section 3: Map
  // ===========================================================
  const TYPE_ICON = { Merchant: "🪙", Notable: "⭐", Chest: "🧰", Treasure: "💰", Loot: "📦" };
  const mapState = {
    mode: "region",
    region: ALL_REGIONS[0] || "",
    questId: (QUESTS[0] && QUESTS[0].id) || "",
  };

  function renderMap() {
    const activeRegion =
      mapState.mode === "quest"
        ? (QUEST_BY_ID[mapState.questId] && QUEST_BY_ID[mapState.questId].region) || ""
        : mapState.region;

    const inRegion = LOCATIONS.filter((l) => l.region === activeRegion);
    const questsInRegion = QUESTS.filter((q) => q.region === activeRegion);

    let selector;
    if (mapState.mode === "region") {
      // Plain region picker (no "All" option — the map always shows one region).
      const sel = h("select", { id: "map-region", onchange: (e) => { mapState.region = e.target.value; render(); } });
      ALL_REGIONS.forEach((r) => {
        const o = h("option", { value: r }, r);
        if (r === mapState.region) o.selected = true;
        sel.appendChild(o);
      });
      selector = h("div", { class: "field" }, h("label", { for: "map-region" }, "Region"), sel);
    } else {
      const sel = h("select", { id: "map-quest", onchange: (e) => { mapState.questId = e.target.value; render(); } });
      QUESTS.forEach((qst) => {
        const o = h("option", { value: qst.id }, qst.name + " (" + qst.region + ")");
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
    if (inRegion.length === 0) grid.appendChild(h("div", { class: "empty" }, "No locations recorded for this region yet."));
    inRegion.forEach((l) => {
      grid.appendChild(
        h(
          "div",
          { class: "card" },
          h(
            "div",
            { class: "row-between" },
            h("strong", null, l.name),
            h("span", { class: "tag tag--accent" }, (TYPE_ICON[l.type] || "📌") + " " + l.type)
          ),
          l.area ? h("div", { class: "tag-row" }, h("span", { class: "tag" }, "📍 " + l.area)) : null,
          h("p", { class: "muted", style: "margin:0.4rem 0 0" }, l.note || "")
        )
      );
    });

    return h(
      "div",
      null,
      pageHeader(
        "🗺️ Map",
        "Pick a region or a quest to see merchants and landmarks in the same region."
      ),
      h(
        "div",
        { class: "toolbar" },
        h("div", { class: "field" }, h("label", { for: "map-mode" }, "Select by"), modeSel),
        selector
      ),
      h(
        "div",
        { class: "card", style: "margin-bottom:1rem" },
        h("strong", null, "Active region: "),
        activeRegion || "—",
        questsInRegion.length
          ? h("p", { class: "muted", style: "margin:0.4rem 0 0" }, questsInRegion.length + " quest(s) take place here.")
          : null
      ),
      h("h3", null, "Locations in this region"),
      grid
    );
  }

  // ===========================================================
  //  Section 4: Checklist (before the point of no return)
  // ===========================================================
  const CHECKLIST_ICON = { Task: "📌", Item: "🎒", Activity: "🏃" };
  // Default to Trosky (the starting region) when present.
  const checklistState = { region: ALL_REGIONS.includes("Trosky") ? "Trosky" : ALL_REGIONS[0] || "" };

  function checklistRow(opts) {
    // opts: { id, done, onToggle, label, tags:[{text,cls}], note, missable }
    const cb = h("input", { type: "checkbox" });
    cb.checked = opts.done;
    cb.addEventListener("change", () => {
      opts.onToggle();
      render();
    });
    return h(
      "label",
      { class: "card checkbox-row", style: "align-items:flex-start" },
      cb,
      h(
        "span",
        null,
        h("strong", { style: opts.done ? "text-decoration:line-through;opacity:0.6" : "" }, opts.label),
        h(
          "span",
          { class: "tag-row", style: "margin:0.3rem 0 0" },
          (opts.tags || []).map((t) => h("span", { class: "tag " + (t.cls || "") }, t.text))
        ),
        opts.note ? h("span", { class: "muted", style: "display:block;margin-top:0.2rem" }, opts.note) : null
      )
    );
  }

  function renderChecklist() {
    const region = checklistState.region;
    const cfg = CHECKLIST[region];

    // Auto-pulled: still-open side quests and tasks of this region.
    const openSide = QUESTS.filter(
      (q) => (q.type === "side" || q.type === "task") && q.region === region && !state.completed.has(q.id)
    ).sort((a, b) => {
      if (!!a.missable !== !!b.missable) return a.missable ? -1 : 1;
      if (a.type !== b.type) return (TYPE_ORDER[a.type] ?? 9) - (TYPE_ORDER[b.type] ?? 9);
      return a.name.localeCompare(b.name, "en");
    });

    const sideList = h("div", { class: "list" });
    if (openSide.length === 0) sideList.appendChild(h("div", { class: "empty" }, "All side quests & tasks in this region are done. 🎉"));
    openSide.forEach((q) =>
      sideList.appendChild(
        checklistRow({
          id: q.id,
          done: state.completed.has(q.id),
          onToggle: () => toggleCompleted(q.id),
          label: q.name,
          tags: [
            { text: TYPE_SHORT[q.type] || q.type },
            q.giver ? { text: "📍 " + q.giver } : null,
            q.missable ? { text: "Missable", cls: "tag--warn" } : null,
          ].filter(Boolean),
          note: q.note || "",
        })
      )
    );

    // Manual entries (tasks / items / activities) from data/checklist.js.
    const extras = (cfg && cfg.items) || [];
    const extrasSorted = [...extras].sort((a, b) => {
      if (!!a.missable !== !!b.missable) return a.missable ? -1 : 1;
      return 0;
    });
    const extrasList = h("div", { class: "list" });
    if (extrasSorted.length === 0) extrasList.appendChild(h("div", { class: "empty" }, "No extra items for this region yet."));
    extrasSorted.forEach((it) =>
      extrasList.appendChild(
        checklistRow({
          id: it.id,
          done: state.checklist.has(it.id),
          onToggle: () => toggleChecklist(it.id),
          label: it.label,
          tags: [
            { text: (CHECKLIST_ICON[it.category] || "•") + " " + it.category },
            it.location ? { text: "📍 " + it.location } : null,
            it.missable ? { text: "Missable", cls: "tag--warn" } : null,
          ].filter(Boolean),
          note: it.note || "",
        })
      )
    );

    const ponrDone = cfg && state.completed.has(cfg.ponrQuestId);

    return h(
      "div",
      null,
      pageHeader(
        "✅ Before the point of no return",
        "Things worth finishing before the region locks. Open side quests are pulled in automatically; extras are curated."
      ),
      h(
        "div",
        { class: "toolbar" },
        (function () {
          const sel = h("select", { id: "ck-region", onchange: (e) => { checklistState.region = e.target.value; render(); } });
          ALL_REGIONS.forEach((r) => {
            const o = h("option", { value: r }, r);
            if (r === region) o.selected = true;
            sel.appendChild(o);
          });
          return h("div", { class: "field" }, h("label", { for: "ck-region" }, "Region"), sel);
        })()
      ),
      cfg
        ? h(
            "div",
            { class: "card", style: "margin-bottom:1rem" + (ponrDone ? ";border-color:var(--danger)" : "") },
            h("strong", null, ponrDone ? "⚠️ You have already started/passed " : "Point of no return: "),
            h("span", { class: ponrDone ? "" : "tag tag--warn" }, cfg.ponrName),
            cfg.intro ? h("p", { style: "margin:0.5rem 0 0" }, cfg.intro) : null,
            (cfg.notes || []).map((n) => h("p", { class: "muted", style: "margin:0.4rem 0 0" }, "ℹ️ " + n))
          )
        : null,
      h("h3", null, "Open side quests & tasks (" + openSide.length + ")"),
      sideList,
      h("h3", { style: "margin-top:1.25rem" }, "Items & activities"),
      extrasList
    );
  }

  // ===========================================================
  //  Section 5: Perks (recommended per category)
  // ===========================================================
  const perksFilter = { category: "" };
  const perkId = (cat, name) => "perk:" + cat + ":" + name;

  function renderPerks() {
    const cats = perksFilter.category
      ? PERKS.filter((c) => c.category === perksFilter.category)
      : PERKS;

    const totalAll = PERKS.reduce((n, c) => n + c.perks.length, 0);
    const totalGot = PERKS.reduce(
      (n, c) => n + c.perks.filter((p) => state.perks.has(perkId(c.category, p.name))).length,
      0
    );

    const sections = cats.map((c) => {
      const got = c.perks.filter((p) => state.perks.has(perkId(c.category, p.name))).length;
      const list = h("div", { class: "list" });
      c.perks.forEach((p) => {
        const id = perkId(c.category, p.name);
        const done = state.perks.has(id);
        const cb = h("input", { type: "checkbox" });
        cb.checked = done;
        cb.addEventListener("change", () => {
          togglePerk(id);
          render();
        });
        list.appendChild(
          h(
            "label",
            { class: "card checkbox-row", style: "align-items:flex-start" },
            cb,
            h(
              "span",
              null,
              h("strong", { style: done ? "text-decoration:line-through;opacity:0.6" : "" }, p.name),
              p.note ? h("span", { class: "muted", style: "display:block;margin-top:0.2rem" }, p.note) : null
            )
          )
        );
      });
      return h(
        "div",
        { style: "margin-bottom:1.25rem" },
        h("h3", null, c.category + " (" + got + "/" + c.perks.length + ")"),
        list
      );
    });

    const catSelect = h("select", { id: "perk-cat", onchange: (e) => { perksFilter.category = e.target.value; render(); } });
    catSelect.appendChild(h("option", { value: "" }, "All categories"));
    PERKS.forEach((c) => {
      const o = h("option", { value: c.category }, c.category);
      if (c.category === perksFilter.category) o.selected = true;
      catSelect.appendChild(o);
    });

    return h(
      "div",
      null,
      pageHeader(
        "🌟 Perks",
        "Recommended perks to grab per category (a curated guide). Tick the ones you've taken — stored locally."
      ),
      h(
        "div",
        { class: "toolbar" },
        h("div", { class: "field" }, h("label", { for: "perk-cat" }, "Category"), catSelect),
        h("div", { class: "field" }, h("label", null, "Picked"), h("div", { class: "muted", style: "padding:0.5rem 0" }, totalGot + " / " + totalAll))
      ),
      sections
    );
  }

  // ===========================================================
  //  Section 6: Gear (best armor/weapons/horses, "obtained" tracking)
  // ===========================================================
  const gearFilter = { category: "" };
  const gearId = (cat, name) => "gear:" + cat + ":" + name;

  function renderGear() {
    const cats = gearFilter.category ? GEAR.filter((c) => c.category === gearFilter.category) : GEAR;

    const totalAll = GEAR.reduce((n, c) => n + c.items.length, 0);
    const totalGot = GEAR.reduce(
      (n, c) => n + c.items.filter((it) => state.gear.has(gearId(c.category, it.name))).length,
      0
    );

    const sections = cats.map((c) => {
      const got = c.items.filter((it) => state.gear.has(gearId(c.category, it.name))).length;
      const list = h("div", { class: "list" });
      c.items.forEach((it) => {
        const id = gearId(c.category, it.name);
        const done = state.gear.has(id);
        const cb = h("input", { type: "checkbox" });
        cb.checked = done;
        cb.addEventListener("change", () => {
          toggleGear(id);
          render();
        });
        list.appendChild(
          h(
            "label",
            { class: "card checkbox-row", style: "align-items:flex-start" },
            cb,
            h(
              "span",
              null,
              h("strong", { style: done ? "text-decoration:line-through;opacity:0.6" : "" }, it.name),
              h(
                "span",
                { class: "tag-row", style: "margin:0.3rem 0 0" },
                it.where ? h("span", { class: "tag" }, "📍 " + it.where) : null,
                it.dlc ? h("span", { class: "tag tag--warn" }, it.dlc) : null
              ),
              it.note ? h("span", { class: "muted", style: "display:block;margin-top:0.2rem" }, it.note) : null
            )
          )
        );
      });
      return h(
        "div",
        { style: "margin-bottom:1.25rem" },
        h("h3", null, c.category + " (" + got + "/" + c.items.length + ")"),
        list
      );
    });

    const catSelect = h("select", { id: "gear-cat", onchange: (e) => { gearFilter.category = e.target.value; render(); } });
    catSelect.appendChild(h("option", { value: "" }, "All categories"));
    GEAR.forEach((c) => {
      const o = h("option", { value: c.category }, c.category);
      if (c.category === gearFilter.category) o.selected = true;
      catSelect.appendChild(o);
    });

    return h(
      "div",
      null,
      pageHeader(
        "🛡️ Gear",
        "Best armor, weapons, horses and horse gear — with where to get them. Tick what you've obtained (stored locally)."
      ),
      h(
        "div",
        { class: "toolbar" },
        h("div", { class: "field" }, h("label", { for: "gear-cat" }, "Category"), catSelect),
        h("div", { class: "field" }, h("label", null, "Obtained"), h("div", { class: "muted", style: "padding:0.5rem 0" }, totalGot + " / " + totalAll))
      ),
      sections
    );
  }

  // ===========================================================
  //  Section 0: Overview (dashboard + global search + export/import)
  // ===========================================================
  const overviewState = { query: "" };

  function statCard(label, value, sub) {
    return h(
      "div",
      { class: "card" },
      h("div", { class: "muted", style: "font-size:0.78rem;text-transform:uppercase;letter-spacing:0.03em" }, label),
      h("div", { style: "font-size:1.5rem;font-weight:700;color:var(--accent)" }, value),
      sub ? h("div", { class: "muted", style: "font-size:0.85rem" }, sub) : null
    );
  }

  function exportProgress() {
    const payload = {
      app: "kcd2-companion",
      version: 2,
      exportedAt: new Date().toISOString(),
      level: state.level,
      completed: [...state.completed],
      checklist: [...state.checklist],
      perks: [...state.perks],
      gear: [...state.gear],
      notes: state.notes,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "kcd2-progress.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importProgress(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || data.app !== "kcd2-companion" || !Array.isArray(data.completed)) {
          alert("This doesn't look like a KCD2 Companion progress file.");
          return;
        }
        if (!confirm("Replace your current progress with the imported file?")) return;
        state.level = Number(data.level) || 1;
        state.completed = new Set(data.completed);
        state.checklist = new Set(Array.isArray(data.checklist) ? data.checklist : []);
        state.perks = new Set(Array.isArray(data.perks) ? data.perks : []);
        state.gear = new Set(Array.isArray(data.gear) ? data.gear : []);
        state.notes = data.notes && typeof data.notes === "object" ? data.notes : {};
        saveState();
        render();
        alert("Progress imported.");
      } catch {
        alert("Could not read the file (invalid JSON).");
      }
    };
    reader.readAsText(file);
  }

  function searchEverything(query) {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return null;
    const hit = (s) => (s || "").toLowerCase().includes(q);
    const quests = QUESTS.filter((x) => hit(x.name) || hit(x.giver) || hit(x.description) || hit(x.note));
    const locations = LOCATIONS.filter((x) => hit(x.name) || hit(x.area) || hit(x.note));
    const perks = [];
    PERKS.forEach((c) =>
      c.perks.forEach((p) => {
        if (hit(p.name) || hit(p.note) || hit(c.category)) perks.push({ category: c.category, perk: p });
      })
    );
    const gear = [];
    GEAR.forEach((c) =>
      c.items.forEach((it) => {
        if (hit(it.name) || hit(it.note) || hit(it.where) || hit(c.category)) gear.push({ category: c.category, item: it });
      })
    );
    return { quests: quests.slice(0, 15), locations: locations.slice(0, 10), perks: perks.slice(0, 10), gear: gear.slice(0, 10) };
  }

  function buildSearchResults() {
    const box = h("div", { id: "search-results" });
    const res = searchEverything(overviewState.query);
    if (!res) {
      if (overviewState.query.trim()) box.appendChild(h("p", { class: "muted" }, "Type at least 2 characters…"));
      return box;
    }
    const total = res.quests.length + res.locations.length + res.perks.length + res.gear.length;
    if (total === 0) {
      box.appendChild(h("div", { class: "empty" }, "No results."));
      return box;
    }
    if (res.quests.length) {
      box.appendChild(h("h4", { style: "margin:0.8rem 0 0.4rem" }, "Quests"));
      res.quests.forEach((qst) =>
        box.appendChild(
          h(
            "button",
            {
              class: "card clickable",
              style: "margin-bottom:0.5rem",
              onclick: () => {
                questsFilter.region = "";
                questsFilter.type = "";
                questsFilter.status = "";
                questsFilter.selectedId = qst.id;
                location.hash = "#quests";
              },
            },
            h("div", { class: "row-between" }, h("strong", null, qst.name), h("span", { class: "tag tag--accent" }, TYPE_SHORT[qst.type] || qst.type)),
            h("span", { class: "muted" }, "📍 " + qst.region + (qst.giver ? " · " + qst.giver : ""))
          )
        )
      );
    }
    if (res.locations.length) {
      box.appendChild(h("h4", { style: "margin:0.8rem 0 0.4rem" }, "Locations"));
      res.locations.forEach((l) =>
        box.appendChild(
          h(
            "button",
            {
              class: "card clickable",
              style: "margin-bottom:0.5rem",
              onclick: () => {
                mapState.mode = "region";
                mapState.region = l.region;
                location.hash = "#map";
              },
            },
            h("div", { class: "row-between" }, h("strong", null, l.name), h("span", { class: "tag tag--accent" }, l.type)),
            h("span", { class: "muted" }, "📍 " + l.region + (l.area ? " · " + l.area : ""))
          )
        )
      );
    }
    if (res.perks.length) {
      box.appendChild(h("h4", { style: "margin:0.8rem 0 0.4rem" }, "Perks"));
      res.perks.forEach(({ category, perk }) =>
        box.appendChild(
          h(
            "button",
            {
              class: "card clickable",
              style: "margin-bottom:0.5rem",
              onclick: () => {
                perksFilter.category = category;
                location.hash = "#perks";
              },
            },
            h("div", { class: "row-between" }, h("strong", null, perk.name), h("span", { class: "tag tag--accent" }, category)),
            perk.note ? h("span", { class: "muted" }, perk.note) : null
          )
        )
      );
    }
    if (res.gear.length) {
      box.appendChild(h("h4", { style: "margin:0.8rem 0 0.4rem" }, "Gear"));
      res.gear.forEach(({ category, item }) =>
        box.appendChild(
          h(
            "button",
            {
              class: "card clickable",
              style: "margin-bottom:0.5rem",
              onclick: () => {
                gearFilter.category = category;
                location.hash = "#gear";
              },
            },
            h("div", { class: "row-between" }, h("strong", null, item.name), h("span", { class: "tag tag--accent" }, category)),
            item.where ? h("span", { class: "muted" }, "📍 " + item.where) : null
          )
        )
      );
    }
    return box;
  }

  function renderOverview() {
    const count = (pred) => QUESTS.filter(pred).length;
    const done = (pred) => QUESTS.filter((q) => pred(q) && state.completed.has(q.id)).length;

    const mainTotal = count((q) => q.type === "main");
    const mainDone = done((q) => q.type === "main");
    const totalPerks = PERKS.reduce((n, c) => n + c.perks.length, 0);

    const regionStats = ALL_REGIONS.map((r) => {
      const sideT = count((q) => q.type === "side" && q.region === r);
      const sideD = done((q) => q.type === "side" && q.region === r);
      const taskT = count((q) => q.type === "task" && q.region === r);
      const taskD = done((q) => q.type === "task" && q.region === r);
      const ponrId = PONR[r];
      const passed = ponrId && state.completed.has(ponrId);
      return statCard(
        r,
        sideD + taskD + " / " + (sideT + taskT),
        "Side " + sideD + "/" + sideT + " · Tasks " + taskD + "/" + taskT + (passed ? " · ⚠️ past PONR" : "")
      );
    });

    // Search input updates only the results container, so the cursor stays put.
    const searchInput = h("input", {
      id: "global-search",
      type: "search",
      placeholder: "Search quests, locations, perks…",
      value: overviewState.query,
      style: "width:100%",
    });
    searchInput.addEventListener("input", (e) => {
      overviewState.query = e.target.value;
      const old = document.getElementById("search-results");
      if (old) old.replaceWith(buildSearchResults());
    });

    const fileInput = h("input", { type: "file", accept: ".json,application/json", style: "display:none" });
    fileInput.addEventListener("change", () => {
      if (fileInput.files && fileInput.files[0]) importProgress(fileInput.files[0]);
      fileInput.value = "";
    });

    return h(
      "div",
      null,
      pageHeader("🏰 Overview", "Your progress at a glance, global search, and progress backup."),
      h(
        "div",
        { class: "grid", style: "margin-bottom:1.25rem" },
        statCard("Main story", mainDone + " / " + mainTotal, Math.round((mainDone / Math.max(1, mainTotal)) * 100) + "% complete"),
        regionStats,
        statCard("Perks picked", PERKS.reduce((n, c) => n + c.perks.filter((p) => state.perks.has("perk:" + c.category + ":" + p.name)).length, 0) + " / " + totalPerks),
        statCard("Gear obtained", GEAR.reduce((n, c) => n + c.items.filter((it) => state.gear.has("gear:" + c.category + ":" + it.name)).length, 0) + " / " + GEAR.reduce((n, c) => n + c.items.length, 0)),
        statCard("Notes", Object.keys(state.notes).length, "quests with notes")
      ),
      h("h3", null, "Search"),
      h("div", { class: "card", style: "margin-bottom:1.25rem" }, searchInput, buildSearchResults()),
      h("h3", null, "Backup"),
      h(
        "div",
        { class: "card" },
        h("p", { class: "muted", style: "margin:0 0 0.6rem" }, "Progress lives only in this browser. Export it to a file as a backup, or to move it to another device — then import it there."),
        h(
          "div",
          { style: "display:flex;gap:0.6rem;flex-wrap:wrap" },
          h("button", { onclick: exportProgress }, "⬇️ Export progress"),
          h("button", { onclick: () => fileInput.click() }, "⬆️ Import progress"),
          fileInput
        )
      )
    );
  }

  // ===========================================================
  //  Navigation + router
  // ===========================================================
  const SECTIONS = [
    { id: "overview", label: "Overview", icon: "🏰", render: renderOverview },
    { id: "quests", label: "Quests", icon: "📜", render: renderQuests },
    { id: "next", label: "What to do next", icon: "🎯", render: renderRecommendations },
    { id: "checklist", label: "Checklist", icon: "✅", render: renderChecklist },
    { id: "perks", label: "Perks", icon: "🌟", render: renderPerks },
    { id: "gear", label: "Gear", icon: "🛡️", render: renderGear },
    { id: "map", label: "Map", icon: "🗺️", render: renderMap },
  ];

  function currentSection() {
    const id = (location.hash || "").replace("#", "");
    return SECTIONS.find((s) => s.id === id) || SECTIONS[0];
  }

  function renderNav() {
    const nav = document.getElementById("nav");
    nav.innerHTML = "";
    const active = currentSection();
    SECTIONS.forEach((s) => {
      nav.appendChild(
        h(
          "a",
          {
            class: "app__nav-link" + (s.id === active.id ? " app__nav-link--active" : ""),
            href: "#" + s.id,
          },
          s.icon + " " + s.label
        )
      );
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
