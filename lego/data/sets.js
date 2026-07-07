// ============================================================
// LEGO Preis-Leistungs-Finder – Merkliste
// ============================================================
// Hier trägst du die Sets ein, die verglichen werden sollen.
// Es reicht die Setnummer! Name, Teile, Minifiguren, UVP und
// Live-Preise werden automatisch geholt (siehe fetch-prices.js).
//
// Optional kannst du pro Set deine subjektive Bewertung ergänzen:
//   prints : 0–10  (10 = alles bedruckt, 0 = reine Stickerflut;
//                   leer lassen = neutral 5)
//   design : 0–10  (Aussehen / Gefällt-mir-Faktor; leer = neutral 5)
//   note   : freier Kommentar, wird auf der Karte angezeigt
//
// Neues Set aufnehmen: einfach eine Zeile ergänzen, z. B.
//   { number: "10307" },
// speichern – beim nächsten Preis-Update (oder lokal via
// `node lego/fetch-prices.js`) ist es dabei.
// ============================================================

globalThis.LEGO_SETS = [
  // --- Ideas ---
  { number: "21348", prints: 9, note: "D&D – fast alles gedruckt, 10 exklusive Figuren" },
  { number: "21344" }, // Orient-Express
  { number: "21345" }, // Polaroid-Kamera
  { number: "21343" }, // Wikingerdorf

  // --- Icons / Erwachsene ---
  { number: "10316" }, // Herr der Ringe: Bruchtal
  { number: "10330" }, // McLaren MP4/4 & Ayrton Senna
  { number: "10326" }, // Naturhistorisches Museum
  { number: "10327" }, // Dune Atreides Royal Ornithopter
  { number: "10328" }, // Rosenstrauß
  { number: "10329" }, // Mini-Pflanzen
  { number: "10338" }, // Transformers Bumblebee

  // --- Technic ---
  { number: "42151" }, // Bugatti Bolide
  { number: "42161" }, // Lamborghini Huracán Tecnica
  { number: "42172" }, // McLaren P1

  // --- Star Wars ---
  { number: "75367" }, // Venator
  { number: "75375" }, // Millennium Falcon (Midi)
  { number: "75379" }, // R2-D2

  // --- Harry Potter ---
  { number: "76419" }, // Schloss Hogwarts mit Schlossgelände

  // --- Marvel / Disney ---
  { number: "76269" }, // Avengers Tower
  { number: "43230" }, // 100 Jahre Disney Kamera

  // --- Ninjago ---
  { number: "71799" }, // Die Märkte von Ninjago City

  // --- Art / Creator ---
  { number: "31212" }, // Milchstraßen-Galaxie
];
