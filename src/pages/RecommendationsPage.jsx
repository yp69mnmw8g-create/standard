import { useMemo } from 'react'
import { quests, questsById } from '../data/index.js'
import { useQuestState } from '../state/QuestStateContext.jsx'
import { recommendQuests } from '../lib/recommendations.js'

const STATUS_META = {
  ready: { label: 'Bereit', cls: 'tag--ok' },
  soon: { label: 'Bald', cls: 'tag--accent' },
  locked: { label: 'Gesperrt', cls: 'tag--open' },
}

export default function RecommendationsPage() {
  const { level, setLevel, completed, isCompleted, toggleCompleted, resetProgress } = useQuestState()

  const recommendations = useMemo(
    () => recommendQuests({ quests, questsById, completedSet: completed, level }),
    [completed, level],
  )

  return (
    <div>
      <div className="page__header">
        <h2>🎯 Quest-Empfehlung</h2>
        <p>Gib dein Level ein und markiere erledigte Quests — sortiert nach Level, Voraussetzungen und Story-Logik.</p>
      </div>

      <div className="toolbar">
        <div className="field">
          <label htmlFor="rec-level">Dein aktuelles Level</label>
          <input
            id="rec-level"
            type="number"
            min="1"
            value={level}
            onChange={(e) => setLevel(Math.max(1, Number(e.target.value) || 1))}
            style={{ width: '7rem' }}
          />
        </div>
        <div className="field" style={{ justifyContent: 'flex-end' }}>
          <label>&nbsp;</label>
          <button onClick={resetProgress}>Fortschritt zurücksetzen</button>
        </div>
      </div>

      <div className="split">
        {/* Erledigte Quests markieren */}
        <div>
          <h3>Erledigte Quests</h3>
          <div className="list">
            {quests.map((q) => (
              <label key={q.id} className="card checkbox-row">
                <input
                  type="checkbox"
                  checked={isCompleted(q.id)}
                  onChange={() => toggleCompleted(q.id)}
                />
                <span>
                  <strong>{q.name}</strong>
                  <br />
                  <span className="muted">{q.region} · Level {q.recommendedLevel}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Empfehlungsliste */}
        <div>
          <h3>Das solltest du als Nächstes machen</h3>
          <div className="list">
            {recommendations.length === 0 && (
              <div className="empty">Alle Quests erledigt — gut gemacht! 🎉</div>
            )}
            {recommendations.map((rec, idx) => {
              const meta = STATUS_META[rec.status]
              return (
                <div key={rec.quest.id} className="card">
                  <div className="row-between">
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline' }}>
                      <span className="rec-rank">{idx + 1}</span>
                      <strong>{rec.quest.name}</strong>
                    </div>
                    <span className={'tag ' + meta.cls}>{meta.label}</span>
                  </div>
                  <div className="tag-row">
                    <span className="tag">📍 {rec.quest.region}</span>
                    <span className="tag badge-level">Level {rec.quest.recommendedLevel}</span>
                  </div>
                  <ul className="muted" style={{ margin: '0.3rem 0 0', paddingLeft: '1.2rem' }}>
                    {rec.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
