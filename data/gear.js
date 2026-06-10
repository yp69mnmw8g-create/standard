/*
  Kingdom Come: Deliverance 2 — best gear overview (curated from guides).
  Grouped by category; each item: { name, where, note, dlc? }.
  A stable checkbox id is derived from category+name ("obtained" tracking).
  Edit freely — add your own finds. Sources: see README.
*/
window.KCD2_GEAR = [
  { category: "Armor — early game (Trosky)", items: [
    { name: "Bascinet with Aventail", where: "Trosky blacksmith", note: "Best early helmet." },
    { name: "Saxon Brigandine", where: "Trosky blacksmith", note: "Best early chest piece." },
    { name: "Silesian Brigandine Sleeves", where: "Trosky blacksmith", note: "Best early arm armour." },
    { name: "Milanese Plate Leg Armour", where: "Trosky blacksmith", note: "Best early leg armour." },
    { name: "Mail Hood with a Coat of Arms", where: "Trosky blacksmith", note: "Best early coif." },
    { name: "Rusted Plate Cuirass", where: "Reward: side quest 'The Jaunt' (Blacksmith Radovan)", note: "Solid early chest piece — quest is missable!" },
    { name: "Brunswick Armour set", where: "Task 'The Lion's Crest'", note: "Strong early set.", dlc: "Pre-order DLC" },
  ]},
  { category: "Armor — late game (Kuttenberg)", items: [
    { name: "Noble's Bascinet", where: "Kuttenberg armourers 1, 2, 3 & 6", note: "Best late helmet." },
    { name: "Milanese Cuirass", where: "Kuttenberg armourers 2, 3 & 6", note: "Best late chest piece." },
    { name: "Nuremberg Plate Gauntlets", where: "Kuttenberg armourers 1, 2, 3 & 6", note: "Best late gauntlets." },
    { name: "Kuttenberg Plate Legs", where: "Sketch for Armourer IV", note: "Best late legs.", dlc: "Legacy of the Forge DLC" },
    { name: "Mail Hood with a Coat of Arms", where: "Kuttenberg armourers 1–6", note: "Best coif (also late game)." },
    { name: "Lord of Hell's Helmet", where: "Quest 'The Night-Mare'", note: "Premium helmet option.", dlc: "Brushes with Death DLC" },
    { name: "Miser's Cuirass", where: "'Brushes with Death' reward", note: "Premium chest option.", dlc: "Brushes with Death DLC" },
  ]},
  { category: "Weapons — melee", items: [
    { name: "Sword of Sir Valentine", where: "Forged during the task 'The Reliquary'", note: "Top shortsword; longsword-level damage, fast." },
    { name: "Radzig Kobyla's Longsword", where: "Obtainable during main quest 'Storm'", note: "128 stab / 122 slash." },
    { name: "Broad Longsword", where: "Kuttenberg region", note: "143 stab / 136 slash, high defense." },
    { name: "Flanged Mace", where: "Weapon smiths (late game)", note: "Best vs heavily armoured enemies." },
  ]},
  { category: "Weapons — ranged", items: [
    { name: "Ash Longbow", where: "Master Wenceslas, south-east Kuttenberg city", note: "Strongest reliable bow." },
    { name: "Ranyek's Bow", where: "During 'The Devil's Pack' (loot Ranyek's body; buy or win it from the dice players)", note: "Great power/accuracy balance." },
    { name: "Reinforced Heavy Crossbow", where: "Shooting Master Bosonga (Sigismund's Camp, south side) or Master Wenceslas (Kuttenberg)", note: "Highest crossbow power." },
    { name: "Pasha's Crossbow", where: "Reward: side quest 'The Magic Arrow'", note: "Most powerful fast crossbow (240 dmg)." },
  ]},
  { category: "Horses", items: [
    { name: "Pisek Lad", where: "Groom Hanniker, Kuttenberg region", note: "Best all-round horse (near-top stats everywhere); very expensive." },
    { name: "Erdel", where: "Groom Hashtal, Maleshov", note: "Warhorse: highest courage (30) & capacity (368)." },
    { name: "Kasztanka", where: "Maleshov stable", note: "One of the fastest horses, high courage." },
    { name: "Kincsem", where: "Kuttenberg region stables", note: "Highest stamina, top speed." },
  ]},
  { category: "Horse gear", items: [
    { name: "Dragon Chanfron", where: "Kuttenberg (expensive)", note: "Best head armour: top armour & courage, low weight." },
    { name: "Bridle of the Holy Roman Empire", where: "Kuttenberg saddlers / stables", note: "+18 stamina, +2 speed." },
    { name: "Norman Saddle", where: "Semine stables / saddler (Trosky)", note: "Best saddle in Trosky." },
    { name: "Executioner's Caparison with Harness", where: "Kuttenberg tailors", note: "+5 courage, +3 armour (stab/slash/blunt)." },
    { name: "Racing Horseshoes", where: "Sketch: table in the stables, south-west Kuttenberg city", note: "Highest speed boost at same weight." },
  ]},
]
