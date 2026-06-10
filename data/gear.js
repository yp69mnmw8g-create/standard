/*
  Kingdom Come: Deliverance 2 — gear roadmap (curated from guides).
  Structure:
    phases: ordered acquisition stages (early -> late). Render top to bottom.
    items:  each { name, type, phase, where, note, dlc? }
      type:  "Armor" | "Weapon" | "Horse" | "Horse gear"
      phase: must match a phase id below
  A stable checkbox id is derived from phase+name ("obtained" tracking).
  Edit freely — add your own finds. Sources: see README.
*/
window.KCD2_GEAR = {
  phases: [
    { id: "trosky-early", label: "Early game · Trosky", note: "Available soon after you reach Troskowitz." },
    { id: "trosky-leave", label: "Leaving Trosky · main quest \"Storm\"", note: "Grab this around the end of the Trosky region." },
    { id: "kuttenberg", label: "Kuttenberg · mid–late game", note: "After you reach the second region. Best gear in the game lives here." },
    { id: "dlc", label: "DLC (optional)", note: "Only relevant if you own the matching DLC / pre-order." },
  ],
  items: [
    // ---- Early game · Trosky ----
    { name: "Bascinet with Aventail", type: "Armor", phase: "trosky-early", where: "Trosky blacksmith", note: "Best early helmet." },
    { name: "Saxon Brigandine", type: "Armor", phase: "trosky-early", where: "Trosky blacksmith", note: "Best early chest piece." },
    { name: "Silesian Brigandine Sleeves", type: "Armor", phase: "trosky-early", where: "Trosky blacksmith", note: "Best early arm armour." },
    { name: "Milanese Plate Leg Armour", type: "Armor", phase: "trosky-early", where: "Trosky blacksmith", note: "Best early leg armour." },
    { name: "Mail Hood with a Coat of Arms", type: "Armor", phase: "trosky-early", where: "Trosky blacksmith (also sold in Kuttenberg)", note: "Best coif — stays useful all game." },
    { name: "Rusted Plate Cuirass", type: "Armor", phase: "trosky-early", where: "Reward: side quest 'The Jaunt' (Blacksmith Radovan)", note: "Solid early chest piece — the quest is missable!" },
    { name: "Norman Saddle", type: "Horse gear", phase: "trosky-early", where: "Semine stables / saddler", note: "Best saddle obtainable in Trosky." },

    // ---- Leaving Trosky · "Storm" ----
    { name: "Radzig Kobyla's Longsword", type: "Weapon", phase: "trosky-leave", where: "Obtainable during main quest 'Storm'", note: "128 stab / 122 slash — strong carry into Kuttenberg." },

    // ---- Kuttenberg · mid–late game ----
    { name: "Noble's Bascinet", type: "Armor", phase: "kuttenberg", where: "Kuttenberg armourers 1, 2, 3 & 6", note: "Best late helmet." },
    { name: "Milanese Cuirass", type: "Armor", phase: "kuttenberg", where: "Kuttenberg armourers 2, 3 & 6", note: "Best late chest piece." },
    { name: "Nuremberg Plate Gauntlets", type: "Armor", phase: "kuttenberg", where: "Kuttenberg armourers 1, 2, 3 & 6", note: "Best late gauntlets." },
    { name: "Sword of Sir Valentine", type: "Weapon", phase: "kuttenberg", where: "Forged during the task 'The Reliquary'", note: "Top shortsword; longsword-level damage, fast." },
    { name: "Broad Longsword", type: "Weapon", phase: "kuttenberg", where: "Kuttenberg region", note: "143 stab / 136 slash, high defense." },
    { name: "Flanged Mace", type: "Weapon", phase: "kuttenberg", where: "Weapon smiths (late game)", note: "Best vs heavily armoured enemies." },
    { name: "Ash Longbow", type: "Weapon", phase: "kuttenberg", where: "Master Wenceslas, south-east Kuttenberg city", note: "Strongest reliable bow." },
    { name: "Ranyek's Bow", type: "Weapon", phase: "kuttenberg", where: "During 'The Devil's Pack' (loot Ranyek; buy or win it from the dice players)", note: "Great power/accuracy balance." },
    { name: "Reinforced Heavy Crossbow", type: "Weapon", phase: "kuttenberg", where: "Shooting Master Bosonga (Sigismund's Camp) or Master Wenceslas (Kuttenberg)", note: "Highest crossbow power." },
    { name: "Pasha's Crossbow", type: "Weapon", phase: "kuttenberg", where: "Reward: side quest 'The Magic Arrow'", note: "Most powerful fast crossbow (240 dmg)." },
    { name: "Pisek Lad", type: "Horse", phase: "kuttenberg", where: "Groom Hanniker, Kuttenberg region", note: "Best all-round horse; very expensive." },
    { name: "Erdel", type: "Horse", phase: "kuttenberg", where: "Groom Hashtal, Maleshov", note: "Warhorse: highest courage (30) & capacity (368)." },
    { name: "Kasztanka", type: "Horse", phase: "kuttenberg", where: "Maleshov stable", note: "One of the fastest horses, high courage." },
    { name: "Kincsem", type: "Horse", phase: "kuttenberg", where: "Kuttenberg region stables", note: "Highest stamina, top speed." },
    { name: "Dragon Chanfron", type: "Horse gear", phase: "kuttenberg", where: "Kuttenberg (expensive)", note: "Best horse head armour: top armour & courage, low weight." },
    { name: "Bridle of the Holy Roman Empire", type: "Horse gear", phase: "kuttenberg", where: "Kuttenberg saddlers / stables", note: "+18 stamina, +2 speed." },
    { name: "Executioner's Caparison with Harness", type: "Horse gear", phase: "kuttenberg", where: "Kuttenberg tailors", note: "+5 courage, +3 armour (stab/slash/blunt)." },
    { name: "Racing Horseshoes", type: "Horse gear", phase: "kuttenberg", where: "Sketch: table in the stables, south-west Kuttenberg city", note: "Highest speed boost at the same weight." },

    // ---- DLC (optional) ----
    { name: "Brunswick Armour set", type: "Armor", phase: "dlc", where: "Task 'The Lion's Crest'", note: "Strong early set.", dlc: "Pre-order DLC" },
    { name: "Kuttenberg Plate Legs", type: "Armor", phase: "dlc", where: "Sketch for Armourer IV (Kuttenberg)", note: "Best late leg armour.", dlc: "Legacy of the Forge DLC" },
    { name: "Lord of Hell's Helmet", type: "Armor", phase: "dlc", where: "Quest 'The Night-Mare'", note: "Premium helmet option.", dlc: "Brushes with Death DLC" },
    { name: "Miser's Cuirass", type: "Armor", phase: "dlc", where: "'Brushes with Death' reward", note: "Premium chest option.", dlc: "Brushes with Death DLC" },
  ],
}
