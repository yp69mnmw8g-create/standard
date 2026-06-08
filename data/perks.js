/*
  Kingdom Come: Deliverance 2 — recommended perks per category (skill).
  This is a CURATED "what to grab" guide (opinionated, from community guides),
  not the full perk list. Edit freely: add/remove perks or categories.
  Each perk: { name, note } — a stable checkbox id is derived from category+name.
  Sources: see README (primarily method.gg).
*/
window.KCD2_PERKS = [
  { category: "Main Level", perks: [
    { name: "Charming Man", note: "+10% reputation gains" },
    { name: "Local Hero", note: "+2 all stats at reputation 60 in towns" },
    { name: "Well-Built", note: "Carry capacity scales with Strength" },
    { name: "Martin's Heritage", note: "Bonus XP for Swords, Crafting, Survival" },
    { name: "Night Crawler", note: "Night buffs: +2 STR/AGI/VIT, +3 Stealth" },
  ]},
  { category: "Strength", perks: [
    { name: "Train Hard, Fight Easy I & II", note: "Lower weapon Strength requirements" },
    { name: "Tight Grip", note: "Better stealth kills (scales with STR)" },
    { name: "Heracles", note: "Converts Strength into Charisma" },
    { name: "Strong as a Bull", note: "Carry capacity boost" },
    { name: "Grand Slam I & II", note: "+5% blunt weapon damage each" },
    { name: "Vanguard", note: "-30% shield block stamina cost" },
  ]},
  { category: "Agility", perks: [
    { name: "Deft Hands I & II", note: "Lower weapon Agility requirements" },
    { name: "Nimble Stance", note: "-40% dodge cost" },
    { name: "Finesse I & II", note: "Improves slashing damage" },
    { name: "Viper I & II", note: "Improves piercing damage" },
    { name: "Creeping Phantom I & II", note: "+35% stealth move speed, AGI XP" },
  ]},
  { category: "Vitality", perks: [
    { name: "Hermes' Haste", note: "Sprint 20% faster" },
    { name: "Marathon Runner", note: "-20% sprint stamina cost" },
    { name: "Balanced Diet", note: "+20% stamina while well-fed" },
    { name: "Die Hard", note: "Survive one fatal hit at 25% HP" },
  ]},
  { category: "Speech", perks: [
    { name: "Jack of All Trades", note: "+2 skill checks, double check XP" },
    { name: "Hustler / Partner in Crime", note: "Sell stolen goods more easily" },
    { name: "Battle Cry I & II", note: "Temporary combat damage boost" },
    { name: "Dreaded Warrior I & II", note: "Enemies may flee in fear" },
  ]},
  { category: "Scholarship", perks: [
    { name: "Liberal Arts", note: "Shows dialogue skill-check difficulty" },
    { name: "Explorer", note: "Reveals NPCs/vendors on the map" },
    { name: "Wonders of Nature", note: "+20% XP for Survival & Alchemy" },
  ]},
  { category: "Warfare", perks: [
    { name: "Against All Odds", note: "+2 STR/AGI/Warfare when outnumbered" },
    { name: "Unbreakable", note: "+20% stamina recovery when outnumbered" },
    { name: "One Man Army", note: "+10% damage when outnumbered" },
  ]},
  { category: "Swords", perks: [
    { name: "Master Strike", note: "Block + unblockable counter" },
    { name: "Opening Strike I & II", note: "Wounds reduce enemy blocking" },
    { name: "Slice and Dice", note: "Damage grows with consecutive hits" },
  ]},
  { category: "Heavy Weapons", perks: [
    { name: "Shield Breaker", note: "Strong vs shield users" },
    { name: "Sundering Blow I & II", note: "Treat armor as 20 lower" },
    { name: "Brute Force I & II", note: "Direct damage increase" },
    { name: "Hack and Slash", note: "Damage on consecutive hits" },
  ]},
  { category: "Polearms", perks: [
    { name: "Keeping a Distance", note: "Easier blocking, less stamina" },
    { name: "Long Reach", note: "Reduced stamina consumption" },
    { name: "Impaler I & II", note: "+10% piercing damage" },
    { name: "Artery Slash", note: "Higher bleeding chance" },
    { name: "Iron Rain", note: "Bonus damage on consecutive hits" },
  ]},
  { category: "Unarmed", perks: [
    { name: "No Pain No Gain", note: "Faster leveling of other stats" },
    { name: "Sting like a Bee", note: "After 30s: +30% damage & stamina recovery" },
    { name: "Jawbreaker", note: "Damage grows with consecutive hits" },
  ]},
  { category: "Marksmanship", perks: [
    { name: "Hal Shot First I & II", note: "First shot much stronger" },
    { name: "Salvo", note: "Faster reload after each shot" },
    { name: "One Shot at Glory", note: "Kill = +50% damage on next shot" },
  ]},
  { category: "Stealth", perks: [
    { name: "Rodent", note: "-25% noise indoors, quieter doors" },
    { name: "Weasel Boy", note: "-35% noise outdoors" },
    { name: "Ambusher", note: "+20% damage vs unaware targets" },
    { name: "Surprise Attack", note: "Ranged hit debuffs unaware target" },
    { name: "Escape Artist I & II", note: "Easier to escape undetected" },
  ]},
  { category: "Thievery", perks: [
    { name: "Silent Fiddler", note: "Less noise picking/breaking locks" },
    { name: "Tool Master", note: "+15% lockpick durability" },
    { name: "Nimble Fingers", note: "More time during lockpicking" },
    { name: "Inconspicuous", note: "Rob front pouches more safely" },
    { name: "Master Thief", note: "Instantly open easy chests" },
  ]},
  { category: "Survival", perks: [
    { name: "Heartseeker I & II", note: "+ranged chest/body damage" },
    { name: "Master Fletcher", note: "Better arrows/bolts (speed, range, pen.)" },
    { name: "Leshy", note: "Forest buffs: less scent, +15% stamina recovery" },
    { name: "Flower Power", note: "+2 Charisma with 30 herbs carried" },
    { name: "Leg Day", note: "Small Strength gain from collecting herbs" },
  ]},
  { category: "Alchemy", perks: [
    { name: "Potion Seller", note: "Higher potion resale prices" },
    { name: "Secret of Matter I & II", note: "Extra potions per brew" },
    { name: "Secret of Secrets", note: "Brew unique high-tier potions" },
  ]},
  { category: "Craftsmanship", perks: [
    { name: "Razor Sharp", note: "+10 damage on sharpened weapons" },
    { name: "Locksmith", note: "+3 Thievery while lockpicking" },
    { name: "Martin's Secret", note: "Forge unique quality IV weapons" },
  ]},
  { category: "Horsemanship", perks: [
    { name: "Head Start I & II", note: "Quick-start horse speed boost" },
    { name: "Final Stretch", note: "Recover horse stamina when nearly empty" },
  ]},
  { category: "Houndmaster", perks: [
    { name: "Hunt!", note: "Mutt hunts small game for meat/XP" },
    { name: "Bark!", note: "Dog taunts enemies to draw aggro" },
    { name: "Rip, Tear, Sic'em!", note: "Stronger dog combat attacks" },
  ]},
  { category: "Drinking", perks: [
    { name: "Indomitable Drunk", note: "Reduced drunkenness penalties" },
    { name: "Nightcap", note: "No hangover; +10% bed comfort" },
  ]},
]
