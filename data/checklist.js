/*
  Kingdom Come: Deliverance 2 — "Before the Point of No Return" checklists.
  The Checklist section automatically pulls the region's still-open SIDE QUESTS
  and TASKS from data/quests.js (missable first). The entries below are only
  the extra ITEM/ACTIVITY reminders that aren't quests.

  Fields per item:
    id        unique key (used to remember the checkbox locally)
    category  "Item" | "Activity"
    label     what to do / get
    location  where / from whom (optional)
    note      optional hint
*/
window.KCD2_CHECKLIST = {
  Trosky: {
    ponrQuestId: "mq08",
    ponrName: "Necessary Evil",
    intro:
      "Wrap up Trosky before the main quest \"Necessary Evil\" — and note that starting \"For Victory!\" already fails some tasks (Demons of Trosky, the Gules questline).",
    notes: [
      "After \"Necessary Evil\" you're locked into ~5 main quests. You CAN return to Trosky later from Kuttenberg via the Coachman (200 Groschen one way) — but missable quests/tasks will be gone.",
    ],
    items: [
      { id: "ck-t-shop", category: "Item", label: "Spend Groschen at Trosky merchants & sell loot", location: "Troskowitz / Semine", note: "Trosky stock differs from Kuttenberg." },
      { id: "ck-t-schnapps", category: "Item", label: "Stock up on Saviour Schnapps & healing potions", note: "Useful for the long locked story stretch ahead." },
      { id: "ck-t-trainers", category: "Activity", label: "Train skills with Trosky trainers (combat etc.)" },
      { id: "ck-t-mutt", category: "Activity", label: "Get Mutt (dog companion) if you want him along", note: "See the side quest 'Mutt'." },
    ],
  },
  Kuttenberg: {
    ponrQuestId: "mq24",
    ponrName: "Oratores",
    intro:
      "Wrap up Kuttenberg before the main quest \"Oratores\". Several tasks are highly missable — they are listed above with a red tag.",
    notes: [],
    items: [
      { id: "ck-k-shop", category: "Item", label: "Buy specialist gear (gunmaker, tailors, blacksmiths)", location: "Kuttenberg City", note: "Best selection in the game." },
      { id: "ck-k-schnapps", category: "Item", label: "Stock up on Saviour Schnapps & supplies for the endgame" },
      { id: "ck-k-tournament", category: "Activity", label: "Enter the Kuttenberg Tournament (after Ars Dimicatoria)", location: "Kuttenberg City" },
    ],
  },
}
