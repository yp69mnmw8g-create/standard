/*
  Loot-Orte / Karte.
  Neuen Ort als weiteres Objekt ans Array anhängen.
  Felder:
    id      eindeutige Kennung (Text)
    name    Anzeigename
    region  Region (muss zu data/quests.js passen, damit die Karte verknüpft)
    type    "Truhe" | "Händler" | "Loot"
    note    freier Hinweis
  Hinweis: Dummy-/Platzhalter-Daten.
*/
window.KCD2_LOCATIONS = [
  { id: "loc-001", name: "Dummy-Truhe am Wegkreuz", region: "Dummy-Tal", type: "Truhe", note: "Platzhalter-Notiz: Versteckt hinter einem Beispiel-Felsen." },
  { id: "loc-002", name: "Wandernder Test-Händler", region: "Dummy-Tal", type: "Händler", note: "Platzhalter-Notiz: Verkauft Dummy-Tränke und einfache Ausrüstung." },
  { id: "loc-003", name: "Beispiel-Lager im Beispielwald", region: "Beispielwald", type: "Loot", note: "Platzhalter-Notiz: Mehrere lose Dummy-Gegenstände am Boden." },
  { id: "loc-004", name: "Schmuggler-Truhe (Dummy)", region: "Beispielwald", type: "Truhe", note: "Platzhalter-Notiz: Benötigt Schloss-Knacken Stufe Beispiel." },
  { id: "loc-005", name: "Marktstand der Platzhalter-Stadt", region: "Platzhalter-Stadt", type: "Händler", note: "Platzhalter-Notiz: Großes Dummy-Sortiment, faire Beispielpreise." },
  { id: "loc-006", name: "Keller-Truhe unter dem Wirtshaus", region: "Platzhalter-Stadt", type: "Truhe", note: "Platzhalter-Notiz: Zugang nur nachts (Dummy-Bedingung)." },
  { id: "loc-007", name: "Verlassener Test-Außenposten", region: "Testberge", type: "Loot", note: "Platzhalter-Notiz: Bewacht von Beispiel-Banditen." },
  { id: "loc-008", name: "Versteckte Berg-Truhe (Dummy)", region: "Testberge", type: "Truhe", note: "Platzhalter-Notiz: Hinter einem Beispiel-Wasserfall." },
  { id: "loc-009", name: "Reisender Waffen-Händler", region: "Testberge", type: "Händler", note: "Platzhalter-Notiz: Führt seltene Dummy-Waffen." },
]
