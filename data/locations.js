/*
  Kingdom Come: Deliverance 2 — Locations (map points).
  Add a new place by appending another object to the array.
  Fields:
    id      unique key
    name    display name
    region  "Trosky" | "Kuttenberg"  (must match the quests' regions)
    area    settlement / sub-area (free text)
    type    "Merchant" | "Notable" | "Chest" | "Treasure" | "Loot"
    note    free hint

  This is a curated starter set of confirmed merchants and landmarks.
  KCD2 has hundreds of treasure/chest spots; add your own finds here as you go
  (use type "Treasure" or "Chest"). Sources: see README.
*/
window.KCD2_LOCATIONS = [
  // ---------------- Trosky ----------------
  { id: "loc-t01", name: "Trader", region: "Trosky", area: "Troskowitz", type: "Merchant", note: "General trader in the main town of the Trosky region." },
  { id: "loc-t02", name: "Tailor", region: "Trosky", area: "Troskowitz", type: "Merchant", note: "Clothing and armour padding." },
  { id: "loc-t03", name: "Carpenter", region: "Trosky", area: "Troskowitz", type: "Merchant", note: "Woodwork and related goods." },
  { id: "loc-t04", name: "Saddler", region: "Trosky", area: "Semine", type: "Merchant", note: "Horse tack and related goods (western side of Semine)." },
  { id: "loc-t05", name: "Combat Arena", region: "Trosky", area: "Semine", type: "Notable", note: "Fighting arena on the southern edge of Semine." },
  { id: "loc-t06", name: "Bozhena's Hut", region: "Trosky", area: "Forest", type: "Notable", note: "Herb woman; refuge during the early main quests." },
  { id: "loc-t07", name: "Trosky Castle", region: "Trosky", area: "Trosky Castle", type: "Notable", note: "Major castle and setting of several main quests." },
  { id: "loc-t08", name: "Nebakov Fortress", region: "Trosky", area: "Nebakov", type: "Notable", note: "Fortress featured in the late Trosky main quests." },
  { id: "loc-t09", name: "Rocktower Pond", region: "Trosky", area: "Rocktower", type: "Notable", note: "Early travel destination with Sir Hans." },

  // ---------------- Kuttenberg ----------------
  { id: "loc-k01", name: "Market Square Traders", region: "Kuttenberg", area: "Kuttenberg (city)", type: "Merchant", note: "General traders, food and specialty goods on the central market square." },
  { id: "loc-k02", name: "Gunmaker", region: "Kuttenberg", area: "Craftsman's Row", type: "Merchant", note: "Repairs firearms and sells ammunition (eastern commercial district)." },
  { id: "loc-k03", name: "Horse Traders", region: "Kuttenberg", area: "City gates", type: "Merchant", note: "Mounts, horse equipment and grooming near the gates." },
  { id: "loc-k04", name: "Tailor", region: "Kuttenberg", area: "Kuttenberg (city)", type: "Merchant", note: "One of several tailors in the city." },
  { id: "loc-k05", name: "Blacksmith", region: "Kuttenberg", area: "Kuttenberg (city)", type: "Merchant", note: "Weapons, armour and repairs." },
  { id: "loc-k06", name: "Suchdol Fortress", region: "Kuttenberg", area: "Suchdol", type: "Notable", note: "Key fortress in the Kuttenberg main story." },
  { id: "loc-k07", name: "Maleshov Fortress", region: "Kuttenberg", area: "Maleshov", type: "Notable", note: "Fortress featured in several main quests." },
  { id: "loc-k08", name: "Devil's Den", region: "Kuttenberg", area: "Devil's Den", type: "Notable", note: "Hideout of Dry Devil's band." },
  { id: "loc-k09", name: "Sedlec", region: "Kuttenberg", area: "Sedlec", type: "Notable", note: "Settlement near Kuttenberg (ossuary / monastery area)." },
]
