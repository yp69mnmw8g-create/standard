/*
  Alchemie-Rezepte.
  Neue Rezepte einfach als weiteres Objekt ans Array anhängen.
  Felder:
    id               eindeutige Kennung (Text)
    name             Anzeigename
    ingredients      Liste der Zutaten
    steps            Liste der Brau-Schritte (Reihenfolge zählt)
    effect           Wirkungs-Kategorie (für den Filter)
    effectDescription kurze Beschreibung der Wirkung
    tier             Stärke: "schwach" | "mittel" | "stark"
  Hinweis: Dummy-/Platzhalter-Daten, keine echten Spielwerte.
*/
window.KCD2_RECIPES = [
  {
    id: "recipe-001",
    name: "Dummy-Trank der Vitalität",
    ingredients: ["Platzhalter-Kraut", "Quellwasser", "Beispiel-Blüte"],
    steps: [
      "Quellwasser in den Kessel geben und zum Sieden bringen.",
      "Platzhalter-Kraut hinzufügen und 1 Sandzeit kochen.",
      "Beispiel-Blüte zerstoßen und einrühren.",
      "Abfüllen.",
    ],
    effect: "Heilung",
    effectDescription: "Stellt über kurze Zeit Platzhalter-Lebenspunkte wieder her.",
    tier: "schwach",
  },
  {
    id: "recipe-002",
    name: "Beispiel-Elixier der Stärke",
    ingredients: ["Test-Wurzel", "Platzhalter-Kraut", "Branntwein (Dummy)"],
    steps: [
      "Branntwein einfüllen und erhitzen.",
      "Test-Wurzel hinzugeben und ziehen lassen.",
      "Platzhalter-Kraut nach dem Aufkochen einrühren.",
      "Abfüllen.",
    ],
    effect: "Attribut",
    effectDescription: "Erhöht vorübergehend einen Dummy-Stärkewert.",
    tier: "mittel",
  },
  {
    id: "recipe-003",
    name: "Platzhalter-Sud gegen Müdigkeit",
    ingredients: ["Beispiel-Blüte", "Test-Beere", "Quellwasser"],
    steps: [
      "Quellwasser zum Sieden bringen.",
      "Test-Beere zerquetschen und hinzufügen.",
      "Beispiel-Blüte einrühren und kurz ziehen lassen.",
      "Abfüllen.",
    ],
    effect: "Ausdauer",
    effectDescription: "Reduziert Dummy-Erschöpfung für eine Weile.",
    tier: "schwach",
  },
  {
    id: "recipe-004",
    name: "Dummy-Gift (Demonstration)",
    ingredients: ["Test-Pilz", "Test-Wurzel", "Branntwein (Dummy)"],
    steps: [
      "Branntwein erhitzen.",
      "Test-Pilz fein zerstoßen und einrühren.",
      "Test-Wurzel hinzufügen und einkochen.",
      "Vorsichtig abfüllen.",
    ],
    effect: "Schaden",
    effectDescription: "Fügt einem Dummy-Ziel über Zeit Platzhalter-Schaden zu.",
    tier: "mittel",
  },
  {
    id: "recipe-005",
    name: "Beispiel-Trank der Schnelligkeit",
    ingredients: ["Platzhalter-Kraut", "Test-Beere", "Quellwasser"],
    steps: [
      "Quellwasser erhitzen.",
      "Platzhalter-Kraut hinzufügen.",
      "Test-Beere zerquetschen und einrühren.",
      "Abfüllen.",
    ],
    effect: "Mobilität",
    effectDescription: "Erhöht kurzzeitig die Dummy-Bewegungsgeschwindigkeit.",
    tier: "schwach",
  },
  {
    id: "recipe-006",
    name: "Test-Elixier der Klarheit",
    ingredients: ["Beispiel-Blüte", "Test-Pilz", "Quellwasser"],
    steps: [
      "Quellwasser zum Kochen bringen.",
      "Test-Pilz hinzufügen und ziehen lassen.",
      "Beispiel-Blüte einrühren.",
      "Abfüllen.",
    ],
    effect: "Attribut",
    effectDescription: "Hebt einen Dummy-Wahrnehmungswert kurzzeitig an.",
    tier: "stark",
  },
  {
    id: "recipe-007",
    name: "Platzhalter-Salbe der Heilung",
    ingredients: ["Platzhalter-Kraut", "Test-Wurzel", "Bienenwachs (Dummy)"],
    steps: [
      "Bienenwachs schmelzen.",
      "Platzhalter-Kraut zerstoßen und einrühren.",
      "Test-Wurzel hinzufügen und verrühren.",
      "Erkalten lassen und abfüllen.",
    ],
    effect: "Heilung",
    effectDescription: "Beschleunigt die Dummy-Regeneration leichter Wunden.",
    tier: "mittel",
  },
]
