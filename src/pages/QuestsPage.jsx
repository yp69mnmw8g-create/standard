import { useMemo, useState } from 'react'
import { quests, questsById, allRegions } from '../data/index.js'
import { useQuestState } from '../state/QuestStateContext.jsx'

export default function QuestsPage() {
  const { isCompleted, toggleCompleted } = useQuestState()
  const [region, setRegion] = useState('')
  const [status, setStatus] = useState('') // '', 'open', 'done'

  const filtered = useMemo(() => {
    return quests.filter((q) => {
      const matchesRegion = !region || q.region === region
      const done = isCompleted(q.id)
      const matchesStatus =
        !status || (status === 'done' ? done : !done)
      return matchesRegion && matchesStatus
    })
  }, [region, status, isCompleted])

  return (
    <div>
      <div className="page__header">
        <h2>📜 Quest-Übersicht</h2>
        <p>Status (offen/erledigt) wird lokal gespeichert. Filtere nach Region und Status.</p>
      </div>

      <div className="toolbar">
        <div className="field">
          <label htmlFor="quest-region">Region</label>
          <select id="quest-region" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">Alle</option>
            {allRegions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="quest-status">Status</label>
          <select id="quest-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Alle</option>
            <option value="open">Offen</option>
            <option value="done">Erledigt</option>
          </select>
        </div>
      </div>

      <div className="list">
        {filtered.length === 0 && <div className="empty">Keine Quests für diese Filter.</div>}
        {filtered.map((q) => {
          const done = isCompleted(q.id)
          return (
            <div key={q.id} className="card">
              <div className="row-between">
                <h3 style={{ margin: 0 }}>{q.name}</h3>
                <span className={'tag ' + (done ? 'tag--ok' : 'tag--open')}>
                  {done ? 'Erledigt' : 'Offen'}
                </span>
              </div>
              <p style={{ margin: '0.4rem 0' }}>{q.description}</p>
              <div className="tag-row">
                <span className="tag">📍 {q.region}</span>
                <span className="tag badge-level">Level {q.recommendedLevel}</span>
                {q.prerequisites.length > 0 && (
                  <span className="tag">
                    Voraussetzung: {q.prerequisites.map((id) => questsById[id]?.name || id).join(', ')}
                  </span>
                )}
              </div>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={done}
                  onChange={() => toggleCompleted(q.id)}
                />
                Als erledigt markieren
              </label>
            </div>
          )
        })}
      </div>
    </div>
  )
}
