// ============================================================
// LEGO Preis-Leistungs-Finder – kuratierte Merkliste
// ============================================================
// Diese Sets werden IMMER angezeigt. Zusätzlich entdeckt der
// Preis-Fetcher bei jedem Lauf automatisch die aktuellen
// Top-Angebote aus dem Preisvergleich (Tag „Top-Deal“) –
// du musst hier also nichts pflegen, kannst aber:
//
//   number : Setnummer (Pflicht – alles andere kommt automatisch)
//   prints : 0–10  Druckteile statt Sticker (leer = neutral 5)
//   design : 0–10  Aussehen / Gefällt-mir (leer = neutral 5)
//   note   : Kommentar, wird auf der Karte angezeigt
//
// prints/design sind subjektive Einschätzungen – gern anpassen!
// ============================================================

globalThis.LEGO_SETS = [
  // --- Highlights mit aktuell starken Rabatten ---
  { number: "76294", design: 8, note: "X-Mansion – Modular-Feeling für Marvel-Fans, aktuell Top-Deal" },
  { number: "42228", design: 7, prints: 3, note: "McLaren MCL39 F1 – wie fast alle Technic-Renner sticker-lastig" },
  { number: "21360", design: 8, note: "Willy Wonka Schokoladenfabrik – verspieltes Ideas-Set" },
  { number: "10358", design: 8, note: "Soundwave – Kassetten-Nostalgie, transformiert wirklich" },
  { number: "76354", design: 7, note: "S.H.I.E.L.D.-Helicarrier – riesig fürs Geld" },
  { number: "10273", design: 9, note: "Geisterhaus auf dem Jahrmarkt – Fairground-Klassiker, läuft aus" },
  { number: "21318", design: 8, note: "Baumhaus – Botanik-Highlight, austauschbares Sommer/Herbst-Laub" },
  { number: "21061", design: 9, note: "Notre-Dame – beeindruckende Architektur, sehr viele Teile fürs Geld" },
  { number: "21063", design: 8, note: "Schloss Neuschwanstein – Architecture-Flaggschiff" },
  { number: "60339", design: 6, note: "Stuntshow-Doppellooping – oft über 50 % unter UVP, top für Kinder" },
  { number: "72152", design: 7, note: "Pikachu und Pokéball – Start der Pokémon-Reihe" },
  { number: "21337", design: 7, note: "Tischkicker – wirklich bespielbar, 22 Figuren" },

  // --- Große Klassiker / Display-Sets ---
  { number: "75192", design: 9, prints: 5, note: "UCS Millennium Falke – DAS Star-Wars-Flaggschiff, 7.541 Teile" },
  { number: "71043", design: 9, note: "Schloss Hogwarts – Mikromaßstab, gigantischer Umfang" },
  { number: "75367", design: 8, note: "Venator – Clone-Wars-Traum, mit Rabatt stark" },
  { number: "10316", design: 9, prints: 6, note: "Bruchtal – detailverliebt, 15 exklusive Minifiguren" },
  { number: "21348", design: 8, prints: 9, note: "D&D – fast alles gedruckt, 10 exklusive Figuren" },
  { number: "71799", design: 8, note: "Ninjago City Märkte – Riesenwert: 6.163 Teile, 21 Figuren" },
  { number: "76419", design: 8, note: "Hogwarts mit Schlossgelände – viel Schloss fürs Geld" },
  { number: "21356", design: 8, note: "Flussraddampfer – Ideas-Schmuckstück" },

  // --- Mittlere Preisklasse ---
  { number: "76454", design: 7, note: "Hogwarts Hauptturm – neue modulare Schloss-Reihe" },
  { number: "10326", design: 8, note: "Naturhistorisches Museum – Modular-Building-Qualität" },
  { number: "10327", design: 8, note: "Dune Ornithopter – Flügel bewegen sich, 8 Figuren" },
  { number: "21344", design: 8, note: "Orientexpress – stimmungsvoller Zug" },
  { number: "21343", design: 7, note: "Wikingerdorf – viel Landschaft und Figuren" },
  { number: "31212", design: 8, note: "Milchstraße – Wandbild mit 3D-Tiefe" },
  { number: "43230", design: 8, prints: 7, note: "Disney-Kamera – schönes Display-Set mit Prints" },
  { number: "42182", design: 7, note: "Apollo Mondauto LRV – Technik-Detailfest für NASA-Fans" },

  // --- Einstieg / Geschenke bis ~100 € ---
  { number: "75379", design: 8, note: "R2-D2 – beliebtes Display-Set, oft stark reduziert" },
  { number: "75375", design: 7, note: "Millennium Falke Midi – günstiger UCS-Look fürs Regal" },
  { number: "10330", design: 8, prints: 7, note: "McLaren MP4/4 & Senna – Ikone mit bedrucktem Helm" },
  { number: "10338", design: 7, note: "Bumblebee – transformierbar ohne Umbau" },
  { number: "21345", design: 8, prints: 8, note: "Polaroid – cleverer Mechanismus, viele Prints" },
  { number: "10328", design: 7, note: "Rosenstrauß – Geschenk-Klassiker, verblüht nie" },
  { number: "10329", design: 7, note: "Mini-Pflanzen – 9 kleine Hingucker" },
];
