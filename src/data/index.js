// Zentraler Zugriff auf alle Spieldaten.
// Neue JSON-Dateien hier importieren und exportieren, dann stehen sie
// überall in der App zur Verfügung. So bleibt das Laden an einer Stelle.

import recipes from './recipes.json'
import quests from './quests.json'
import locations from './locations.json'

export { recipes, quests, locations }

// ---- Abgeleitete Listen (für Filter-Dropdowns o. Ä.) ----

const uniqueSorted = (values) =>
  [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'de'))

/** Alle vorkommenden Zutaten über alle Rezepte. */
export const allIngredients = uniqueSorted(recipes.flatMap((r) => r.ingredients))

/** Alle vorkommenden Wirkungen (Effekt-Kategorien). */
export const allEffects = uniqueSorted(recipes.map((r) => r.effect))

/** Alle Regionen aus Quests und Loot-Orten zusammengeführt. */
export const allRegions = uniqueSorted([
  ...quests.map((q) => q.region),
  ...locations.map((l) => l.region),
])

/** Alle Orts-Typen (Truhe/Händler/Loot). */
export const allLocationTypes = uniqueSorted(locations.map((l) => l.type))

/** Quest-ID -> Quest für schnelles Nachschlagen (z. B. Voraussetzungen). */
export const questsById = Object.fromEntries(quests.map((q) => [q.id, q]))
