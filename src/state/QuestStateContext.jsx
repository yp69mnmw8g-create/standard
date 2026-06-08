import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// Hält den lokalen Fortschritt: erledigte Quests + aktuelles Spieler-Level.
// Persistiert in localStorage, damit der Stand einen Reload überlebt.
// Es wird KEINE Datenbank verwendet — nur Browser-Speicher.

const QuestStateContext = createContext(null)

const STORAGE_KEY = 'kcd2-companion.questState.v1'

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { level: 1, completed: [] }
    const parsed = JSON.parse(raw)
    return {
      level: Number(parsed.level) || 1,
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
    }
  } catch {
    return { level: 1, completed: [] }
  }
}

export function QuestStateProvider({ children }) {
  const [level, setLevel] = useState(() => loadInitial().level)
  // Set für schnelle Lookups; nach außen als Array gespeichert.
  const [completed, setCompleted] = useState(() => new Set(loadInitial().completed))

  useEffect(() => {
    const payload = JSON.stringify({ level, completed: [...completed] })
    localStorage.setItem(STORAGE_KEY, payload)
  }, [level, completed])

  const toggleCompleted = (questId) => {
    setCompleted((prev) => {
      const next = new Set(prev)
      if (next.has(questId)) next.delete(questId)
      else next.add(questId)
      return next
    })
  }

  const isCompleted = (questId) => completed.has(questId)

  const resetProgress = () => {
    setLevel(1)
    setCompleted(new Set())
  }

  const value = useMemo(
    () => ({ level, setLevel, completed, isCompleted, toggleCompleted, resetProgress }),
    [level, completed],
  )

  return <QuestStateContext.Provider value={value}>{children}</QuestStateContext.Provider>
}

export function useQuestState() {
  const ctx = useContext(QuestStateContext)
  if (!ctx) throw new Error('useQuestState muss innerhalb von <QuestStateProvider> verwendet werden')
  return ctx
}
