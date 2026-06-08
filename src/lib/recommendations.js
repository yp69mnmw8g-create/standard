// Logik für die "Das solltest du als Nächstes machen"-Liste.
// Bewusst als reine Funktion gehalten (keine React-Abhängigkeit),
// damit sie leicht testbar und erweiterbar ist.

/**
 * Liefert die Voraussetzungen einer Quest, die noch NICHT erledigt sind.
 */
export function missingPrerequisites(quest, completedSet, questsById) {
  return (quest.prerequisites || [])
    .filter((id) => !completedSet.has(id))
    .map((id) => questsById[id]?.name || id)
}

/**
 * Berechnet eine sortierte Empfehlungsliste.
 *
 * Kriterien:
 *  1. Erledigte Quests fallen raus.
 *  2. "ready"  = alle Voraussetzungen erfüllt UND Level reicht aus.
 *     "soon"   = Voraussetzungen erfüllt, aber Level noch zu niedrig.
 *     "locked" = Voraussetzungen noch offen.
 *  3. Sortierung: ready vor soon vor locked, dann nach Story-Reihenfolge,
 *     dann nach empfohlenem Level.
 *
 * @returns Array von { quest, status, reasons, levelGap, missing }
 */
export function recommendQuests({ quests, questsById, completedSet, level }) {
  const statusRank = { ready: 0, soon: 1, locked: 2 }

  return quests
    .filter((q) => !completedSet.has(q.id))
    .map((quest) => {
      const missing = missingPrerequisites(quest, completedSet, questsById)
      const prereqsMet = missing.length === 0
      const levelMet = level >= quest.recommendedLevel
      const levelGap = Math.max(0, quest.recommendedLevel - level)

      let status
      if (!prereqsMet) status = 'locked'
      else if (!levelMet) status = 'soon'
      else status = 'ready'

      const reasons = []
      if (status === 'ready') {
        reasons.push('Level ausreichend', 'Voraussetzungen erfüllt')
      }
      if (status === 'soon') {
        reasons.push(`Level ${quest.recommendedLevel} empfohlen (dir fehlen ${levelGap})`)
      }
      if (status === 'locked') {
        reasons.push(`Zuerst erledigen: ${missing.join(', ')}`)
      }

      return { quest, status, reasons, levelGap, missing }
    })
    .sort((a, b) => {
      if (statusRank[a.status] !== statusRank[b.status]) {
        return statusRank[a.status] - statusRank[b.status]
      }
      const soA = a.quest.storyOrder ?? 999
      const soB = b.quest.storyOrder ?? 999
      if (soA !== soB) return soA - soB
      return a.quest.recommendedLevel - b.quest.recommendedLevel
    })
}
