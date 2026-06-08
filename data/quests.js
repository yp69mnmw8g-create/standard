/*
  Kingdom Come: Deliverance 2 — Quests (real data).
  Add a new quest by appending another object to the array.
  Fields:
    id            unique key (referenced by prerequisites)
    name          quest name
    type          "main" | "side"
    region        "Trosky" | "Kuttenberg"
    description   short summary
    storyOrder    main quests only: 1..32 (side quests: null)
    prerequisites array of quest ids that must be completed first
                  (region unlock is handled automatically by the app)
    missable      true if the quest can be permanently failed/missed
    note          optional extra hint (e.g. point-of-no-return advice)

  Notes on accuracy:
   - KCD2 has no official "recommended level" per quest, so that field is gone.
   - Main quests are a linear chain (each requires the previous one).
   - Kuttenberg is unlocked after the main quest "Storm" (mq12).
   - Points of no return: "Necessary Evil" (mq08, Trosky) and
     "Oratores" (mq24, Kuttenberg) can lock that region's side content.
  Sources: see README.
*/
window.KCD2_QUESTS = [
  // ---------------- Trosky — Main story (1–12) ----------------
  { id: "mq01", name: "Last Rites", type: "main", region: "Trosky", storyOrder: 1, prerequisites: [], description: "Opening sequence: the defense at Trosky Castle." },
  { id: "mq02", name: "Easy Riders", type: "main", region: "Trosky", storyOrder: 2, prerequisites: ["mq01"], description: "Set out with Sir Hans toward Rocktower Pond." },
  { id: "mq03", name: "Fortuna", type: "main", region: "Trosky", storyOrder: 3, prerequisites: ["mq02"], description: "Take refuge at Bozhena's hut and tend to Hans." },
  { id: "mq04", name: "Laboratores", type: "main", region: "Trosky", storyOrder: 4, prerequisites: ["mq03"], description: "Arrive in the town of Troskowitz." },
  { id: "mq05", name: "Wedding Crashers", type: "main", region: "Trosky", storyOrder: 5, prerequisites: ["mq04"], description: "A major branching quest at the Semine wedding." },
  { id: "mq06", name: "For Whom the Bell Tolls", type: "main", region: "Trosky", storyOrder: 6, prerequisites: ["mq05"], description: "Rescue Hans from execution at Trosky Castle." },
  { id: "mq07", name: "Back in the Saddle", type: "main", region: "Trosky", storyOrder: 7, prerequisites: ["mq06"], description: "Travel to Nebakov Fortress." },
  { id: "mq08", name: "Necessary Evil", type: "main", region: "Trosky", storyOrder: 8, prerequisites: ["mq07"], missable: false, note: "Point of no return for the Trosky region — finish Trosky side quests before this.", description: "Interrogation and decisions around the Semine raid." },
  { id: "mq09", name: "For Victory!", type: "main", region: "Trosky", storyOrder: 9, prerequisites: ["mq08"], description: "Bandit ambush and a duel with Zizka." },
  { id: "mq10", name: "Divine Messenger", type: "main", region: "Trosky", storyOrder: 10, prerequisites: ["mq09"], description: "Godwin's perspective; reunite with Henry and Hans." },
  { id: "mq11", name: "The Finger of God", type: "main", region: "Trosky", storyOrder: 11, prerequisites: ["mq10"], description: "Prepare for the siege at Nebakov Fortress." },
  { id: "mq12", name: "Storm", type: "main", region: "Trosky", storyOrder: 12, prerequisites: ["mq11"], note: "Completing this unlocks the Kuttenberg region.", description: "Escape from Trosky Castle and travel to Kuttenberg." },

  // ---------------- Kuttenberg — Main story (13–32) ----------------
  { id: "mq13", name: "The Sword and the Quill", type: "main", region: "Kuttenberg", storyOrder: 13, prerequisites: ["mq12"], description: "Arrive at Suchdol Fortress." },
  { id: "mq14", name: "Speak of the Devil", type: "main", region: "Kuttenberg", storyOrder: 14, prerequisites: ["mq13"], description: "Find Dry Devil at the Devil's Den." },
  { id: "mq15", name: "The Devil's Pack", type: "main", region: "Kuttenberg", storyOrder: 15, prerequisites: ["mq14"], description: "Recruit Dry Devil's scattered band." },
  { id: "mq16", name: "Into the Underworld", type: "main", region: "Kuttenberg", storyOrder: 16, prerequisites: ["mq15"], description: "Locate John of Liechtenstein." },
  { id: "mq17", name: "Via Argentum", type: "main", region: "Kuttenberg", storyOrder: 17, prerequisites: ["mq16"], description: "Investigate embezzlement in the mines." },
  { id: "mq18", name: "Taking French Leave", type: "main", region: "Kuttenberg", storyOrder: 18, prerequisites: ["mq17"], description: "Rescue Sir Hans Capon from Maleshov." },
  { id: "mq19", name: "The King's Gambit", type: "main", region: "Kuttenberg", storyOrder: 19, prerequisites: ["mq18"], description: "City Council intrigue involving King Sigismund." },
  { id: "mq20", name: "The Feast", type: "main", region: "Kuttenberg", storyOrder: 20, prerequisites: ["mq19"], description: "An alliance celebration at Raborsch." },
  { id: "mq21", name: "Exodus", type: "main", region: "Kuttenberg", storyOrder: 21, prerequisites: ["mq20"], description: "Help the residents of the Jewish Quarter." },
  { id: "mq22", name: "The Lion's Den", type: "main", region: "Kuttenberg", storyOrder: 22, prerequisites: ["mq21"], description: "Infiltrate Sigismund's camp; a murder investigation." },
  { id: "mq23", name: "Dancing with the Devil", type: "main", region: "Kuttenberg", storyOrder: 23, prerequisites: ["mq22"], description: "Assault on Maleshov Fortress." },
  { id: "mq24", name: "Oratores", type: "main", region: "Kuttenberg", storyOrder: 24, prerequisites: ["mq23"], note: "Point of no return for the Kuttenberg region — finish Kuttenberg side quests before this.", description: "Interrogate von Bergow and plan the strike on Sigismund." },
  { id: "mq25", name: "The Italian Job", type: "main", region: "Kuttenberg", storyOrder: 25, prerequisites: ["mq24"], description: "The royal silver heist at the Italian Court." },
  { id: "mq26", name: "Civilian Pragensis", type: "main", region: "Kuttenberg", storyOrder: 26, prerequisites: ["mq25"], description: "Celebrate the successful theft." },
  { id: "mq27", name: "So it begins...", type: "main", region: "Kuttenberg", storyOrder: 27, prerequisites: ["mq26"], description: "The initial defense of Suchdol fortress." },
  { id: "mq28", name: "Besieged", type: "main", region: "Kuttenberg", storyOrder: 28, prerequisites: ["mq27"], description: "Prepare for and survive the night assault." },
  { id: "mq29", name: "Hunger and Despair", type: "main", region: "Kuttenberg", storyOrder: 29, prerequisites: ["mq28"], description: "Scavenge for food during the ongoing siege." },
  { id: "mq30", name: "Reckoning", type: "main", region: "Kuttenberg", storyOrder: 30, prerequisites: ["mq29"], description: "Infiltrate the Prague camp and rescue Samuel." },
  { id: "mq31", name: "Last Rites Pt. 2", type: "main", region: "Kuttenberg", storyOrder: 31, prerequisites: ["mq30"], description: "Godwin's final defense of Suchdol." },
  { id: "mq32", name: "Judgement Day", type: "main", region: "Kuttenberg", storyOrder: 32, prerequisites: ["mq31"], description: "Retake the fortress; the story's conclusion." },

  // ---------------- Trosky — Side quests ----------------
  { id: "st01", name: "Frogs", type: "side", region: "Trosky", storyOrder: null, prerequisites: [], description: "Trosky side quest." },
  { id: "st02", name: "Mice", type: "side", region: "Trosky", storyOrder: null, prerequisites: [], description: "Trosky side quest." },
  { id: "st03", name: "Battle of the Frogs and Mice", type: "side", region: "Trosky", storyOrder: null, prerequisites: ["st01", "st02"], description: "Follows the 'Frogs' and 'Mice' side quests." },
  { id: "st04", name: "Combat Training I", type: "side", region: "Trosky", storyOrder: null, prerequisites: [], description: "Learn the basics of combat." },
  { id: "st05", name: "Combat Training II", type: "side", region: "Trosky", storyOrder: null, prerequisites: ["st04"], description: "Advanced combat training." },
  { id: "st06", name: "Materia Prima", type: "side", region: "Trosky", storyOrder: null, prerequisites: [], description: "Start of the Trosky alchemy questline." },
  { id: "st07", name: "Forbidden Fruit", type: "side", region: "Trosky", storyOrder: null, prerequisites: ["st06"], description: "Alchemy questline (continues Materia Prima)." },
  { id: "st08", name: "Opus Magnum", type: "side", region: "Trosky", storyOrder: null, prerequisites: ["st07"], description: "Conclusion of the Trosky alchemy questline." },
  { id: "st09", name: "The Blacksmith's Son", type: "side", region: "Trosky", storyOrder: null, prerequisites: [], description: "Trosky side quest." },
  { id: "st10", name: "The Jaunt", type: "side", region: "Trosky", storyOrder: null, prerequisites: [], description: "Trosky side quest." },
  { id: "st11", name: "The Hermit", type: "side", region: "Trosky", storyOrder: null, prerequisites: [], description: "Trosky side quest." },
  { id: "st12", name: "Mutt", type: "side", region: "Trosky", storyOrder: null, prerequisites: [], description: "Find and bond with a dog companion." },
  { id: "st13", name: "Lackey", type: "side", region: "Trosky", storyOrder: null, prerequisites: [], description: "Trosky side quest." },
  { id: "st14", name: "Bad Blood", type: "side", region: "Trosky", storyOrder: null, prerequisites: [], description: "Trosky side quest." },
  { id: "st15", name: "Invaders", type: "side", region: "Trosky", storyOrder: null, prerequisites: [], description: "Trosky side quest." },
  { id: "st16", name: "Miri Fajta", type: "side", region: "Trosky", storyOrder: null, prerequisites: [], description: "A questline involving the local Romani community." },
  { id: "st17", name: "Troubadours", type: "side", region: "Trosky", storyOrder: null, prerequisites: [], description: "Trosky side quest." },

  // ---------------- Kuttenberg — Side quests ----------------
  { id: "sk01", name: "Spoils of War", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: [], missable: true, note: "Missable — best completed during the main quest 'The Devil's Pack'.", description: "Kuttenberg side quest." },
  { id: "sk02", name: "The Fifth Commandment", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: [], description: "Kuttenberg side quest." },
  { id: "sk03", name: "Ars Dimicatoria", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: [], description: "Combat school questline; required before the Tournament." },
  { id: "sk04", name: "Kuttenberg Tournament", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: ["sk03"], description: "Compete in the tournament (requires Ars Dimicatoria)." },
  { id: "sk05", name: "Feast for the Poor", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: [], description: "Kuttenberg side quest." },
  { id: "sk06", name: "The Spark", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: [], description: "Kuttenberg side quest." },
  { id: "sk07", name: "A Good Scrub", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: [], description: "Bathhouse questline; required before Ill Repute." },
  { id: "sk08", name: "Ill Repute", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: ["sk07"], description: "Continues 'A Good Scrub'." },
  { id: "sk09", name: "Yackers'n'Fash", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: [], description: "Required before Striped Tonies." },
  { id: "sk10", name: "Striped Tonies", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: ["sk09"], description: "Continues 'Yackers'n'Fash'." },
  { id: "sk11", name: "In Vino Veritas", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: [], description: "Kuttenberg side quest." },
  { id: "sk12", name: "Post Scriptum", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: [], description: "Kuttenberg side quest." },
  { id: "sk13", name: "Victimised", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: [], description: "Kuttenberg side quest." },
  { id: "sk14", name: "The Magic Arrow", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: [], description: "Kuttenberg side quest." },
  { id: "sk15", name: "Bellatores", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: [], description: "Kuttenberg side quest." },
  { id: "sk16", name: "Ransom", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: [], description: "Kuttenberg side quest." },
  { id: "sk17", name: "Lost Honour", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: [], description: "Kuttenberg side quest." },
  { id: "sk18", name: "Hush, My Darling...", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: [], description: "Kuttenberg side quest." },
  { id: "sk19", name: "Dragon's Lair", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: [], description: "Kuttenberg side quest." },
  { id: "sk20", name: "The Heirloom", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: [], description: "Kuttenberg side quest." },
  { id: "sk21", name: "The Thunderstone", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: [], description: "Kuttenberg side quest." },
  { id: "sk22", name: "Thou art but dust...", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: [], description: "Kuttenberg side quest." },
  { id: "sk23", name: "The Mouth of Hell", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: [], description: "Kuttenberg side quest." },
  { id: "sk24", name: "All's fair...", type: "side", region: "Kuttenberg", storyOrder: null, prerequisites: [], description: "Kuttenberg side quest." },
]
