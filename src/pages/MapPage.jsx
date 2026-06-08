import { useMemo, useState } from 'react'
import { quests, locations, allRegions } from '../data/index.js'

const TYPE_ICON = { Truhe: '🧰', 'Händler': '🪙', Loot: '💰' }

export default function MapPage() {
  // Auswahl entweder per Quest oder direkt per Region.
  const [mode, setMode] = useState('region') // 'region' | 'quest'
  const [regionSel, setRegionSel] = useState(allRegions[0] || '')
  const [questSel, setQuestSel] = useState(quests[0]?.id || '')

  const activeRegion = useMemo(() => {
    if (mode === 'quest') {
      return quests.find((q) => q.id === questSel)?.region || ''
    }
    return regionSel
  }, [mode, regionSel, questSel])

  const inRegion = useMemo(
    () => locations.filter((l) => l.region === activeRegion),
    [activeRegion],
  )

  const questsInRegion = useMemo(
    () => quests.filter((q) => q.region === activeRegion),
    [activeRegion],
  )

  return (
    <div>
      <div className="page__header">
        <h2>🗺️ Karten-Ansicht</h2>
        <p>Wähle eine Quest oder Region und sieh Loot-Orte, Truhen und Händler derselben Region.</p>
      </div>

      <div className="toolbar">
        <div className="field">
          <label htmlFor="map-mode">Auswahl über</label>
          <select id="map-mode" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="region">Region</option>
            <option value="quest">Quest</option>
          </select>
        </div>
        {mode === 'region' ? (
          <div className="field">
            <label htmlFor="map-region">Region</label>
            <select id="map-region" value={regionSel} onChange={(e) => setRegionSel(e.target.value)}>
              {allRegions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="field">
            <label htmlFor="map-quest">Quest</label>
            <select id="map-quest" value={questSel} onChange={(e) => setQuestSel(e.target.value)}>
              {quests.map((q) => (
                <option key={q.id} value={q.id}>{q.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <strong>Aktive Region:</strong> {activeRegion || '—'}
        {questsInRegion.length > 0 && (
          <p className="muted" style={{ margin: '0.4rem 0 0' }}>
            Quests hier: {questsInRegion.map((q) => q.name).join(', ')}
          </p>
        )}
      </div>

      <h3>Orte in dieser Region</h3>
      <div className="grid">
        {inRegion.length === 0 && <div className="empty">Keine Orte in dieser Region erfasst.</div>}
        {inRegion.map((l) => (
          <div key={l.id} className="card">
            <div className="row-between">
              <strong>{l.name}</strong>
              <span className="tag tag--accent">
                {TYPE_ICON[l.type] || '📌'} {l.type}
              </span>
            </div>
            <p className="muted" style={{ margin: '0.4rem 0 0' }}>{l.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
