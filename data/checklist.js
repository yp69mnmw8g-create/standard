/*
  Kingdom Come: Deliverance 2 — "Before the Point of No Return" checklists.
  The Checklist section automatically pulls the region's still-open SIDE QUESTS
  from data/quests.js. In addition, it shows the entries below: missable TASKS
  (which aren't in the quest list) plus general ITEM/ACTIVITY reminders.

  Add your own entries freely. Fields per item:
    id        unique key (used to remember the checkbox locally)
    category  "Task" | "Item" | "Activity"
    label     what to do / get
    location  where / from whom (optional)
    missable  true if it can be permanently lost (optional)
    note      optional hint

  Sources: see README. Missable flags follow PowerPyx's side quests & tasks guide.
*/
window.KCD2_CHECKLIST = {
  Trosky: {
    ponrQuestId: "mq08",
    ponrName: "Necessary Evil",
    intro:
      "Wrap up Trosky before the main quest \"Necessary Evil\" — and note that starting \"For Victory!\" already fails some tasks (Demons of Trosky, the Gules questline).",
    notes: [
      "After \"Necessary Evil\" you're locked into ~5 main quests. You CAN return to Trosky later from Kuttenberg via the Coachman (200 Groschen one way) — but the missable quests/tasks below will be gone.",
    ],
    items: [
      { id: "ck-t-sinful", category: "Task", label: "A Sinful Soul", location: "Apollonia", missable: true, note: "Highly missable." },
      { id: "ck-t-demons", category: "Task", label: "Demons of Trosky", location: "Trosky Castle", missable: true, note: "Highly missable — fails if you start 'For Victory!'." },
      { id: "ck-t-canker", category: "Task", label: "Canker (Gules questline)", location: "Semine", missable: true },
      { id: "ck-t-charlie", category: "Task", label: "Handsome Charlie (Gules questline)", location: "Semine", missable: true },
      { id: "ck-t-johnny", category: "Task", label: "Johnny the Gob (Gules questline)", location: "Semine", missable: true },
      { id: "ck-t-casper", category: "Task", label: "Casper (Gules questline)", location: "Semine", missable: true },
      { id: "ck-t-shop", category: "Item", label: "Spend Groschen at Trosky merchants & sell loot", location: "Troskowitz / Semine", note: "Trosky stock differs from Kuttenberg." },
      { id: "ck-t-schnapps", category: "Item", label: "Stock up on Saviour Schnapps & healing potions", note: "Useful for the long locked story stretch ahead." },
      { id: "ck-t-trainers", category: "Activity", label: "Train skills with Trosky trainers (combat etc.)" },
      { id: "ck-t-activities", category: "Activity", label: "Finish open Trosky tasks/activities you care about" },
    ],
  },
  Kuttenberg: {
    ponrQuestId: "mq24",
    ponrName: "Oratores",
    intro:
      "Wrap up Kuttenberg before the main quest \"Oratores\". Several tasks are highly missable.",
    notes: [],
    items: [
      { id: "ck-k-arrowhead", category: "Task", label: "Arrow-head", location: "Wilderness", missable: true, note: "Highly missable." },
      { id: "ck-k-strawhat", category: "Task", label: "Under the Straw Hat", location: "Kuttenberg City", missable: true, note: "Highly missable." },
      { id: "ck-k-schindel", category: "Task", label: "Master Schindel's Toys", location: "Kuttenberg City", missable: true, note: "Highly missable." },
      { id: "ck-k-rosa", category: "Task", label: "Rosa's Book", location: "Kuttenberg City", missable: true, note: "Highly missable." },
      { id: "ck-k-collector", category: "Task", label: "The Collector", location: "Miskowitz", missable: true },
      { id: "ck-k-tragedy", category: "Task", label: "Tragedy in Danemark", location: "Dänemark", missable: true, note: "Highly missable." },
      { id: "ck-k-stalker", category: "Task", label: "The Stalker", location: "Sigismund's Camp", missable: true, note: "Highly missable." },
      { id: "ck-k-oldtimes", category: "Task", label: "Like Old Times", location: "Devil's Den", missable: true, note: "Highly missable." },
      { id: "ck-k-justice", category: "Task", label: "Seeking Justice", location: "Suchdol", missable: true, note: "Highly missable." },
      { id: "ck-k-attila", category: "Task", label: "Attila", location: "Maleshov", missable: true },
      { id: "ck-k-shop", category: "Item", label: "Buy specialist gear (gunmaker, tailors, blacksmiths)", location: "Kuttenberg City", note: "Best selection in the game." },
      { id: "ck-k-tournament", category: "Activity", label: "Enter the Kuttenberg Tournament (after Ars Dimicatoria)", location: "Kuttenberg City" },
    ],
  },
}
