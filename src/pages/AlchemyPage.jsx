import { useMemo, useState } from 'react'
import { recipes, allIngredients, allEffects } from '../data/index.js'

export default function AlchemyPage() {
  const [search, setSearch] = useState('')
  const [ingredient, setIngredient] = useState('')
  const [effect, setEffect] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return recipes.filter((r) => {
      const matchesSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.ingredients.some((i) => i.toLowerCase().includes(q)) ||
        r.effectDescription.toLowerCase().includes(q)
      const matchesIngredient = !ingredient || r.ingredients.includes(ingredient)
      const matchesEffect = !effect || r.effect === effect
      return matchesSearch && matchesIngredient && matchesEffect
    })
  }, [search, ingredient, effect])

  const selected = recipes.find((r) => r.id === selectedId) || null

  return (
    <div>
      <div className="page__header">
        <h2>⚗️ Alchemie-Rezepte</h2>
        <p>Durchsuchbare Rezepte mit Zutaten, Brau-Schritten und Wirkung.</p>
      </div>

      <div className="toolbar">
        <div className="field" style={{ flex: '1 1 220px' }}>
          <label htmlFor="alch-search">Suche</label>
          <input
            id="alch-search"
            type="search"
            placeholder="Name, Zutat oder Wirkung…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="alch-ingredient">Zutat</label>
          <select id="alch-ingredient" value={ingredient} onChange={(e) => setIngredient(e.target.value)}>
            <option value="">Alle</option>
            {allIngredients.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="alch-effect">Wirkung</label>
          <select id="alch-effect" value={effect} onChange={(e) => setEffect(e.target.value)}>
            <option value="">Alle</option>
            {allEffects.map((eff) => (
              <option key={eff} value={eff}>{eff}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="split">
        <div className="list">
          {filtered.length === 0 && <div className="empty">Keine Rezepte gefunden.</div>}
          {filtered.map((r) => (
            <button
              key={r.id}
              className={'card clickable' + (r.id === selectedId ? ' card--selected' : '')}
              onClick={() => setSelectedId(r.id)}
            >
              <div className="row-between">
                <strong>{r.name}</strong>
                <span className="tag tag--accent">{r.effect}</span>
              </div>
              <p className="muted" style={{ margin: '0.4rem 0 0' }}>
                {r.ingredients.join(', ')}
              </p>
            </button>
          ))}
        </div>

        <div className="detail">
          {selected ? (
            <div className="card">
              <div className="row-between">
                <h3>{selected.name}</h3>
                <span className="tag tag--accent">{selected.effect}</span>
              </div>
              <p>{selected.effectDescription}</p>

              <h4>Zutaten</h4>
              <ul>
                {selected.ingredients.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>

              <h4>Brau-Schritte</h4>
              <ol>
                {selected.steps.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ol>

              {selected.tier && (
                <p className="muted">Stärke: {selected.tier}</p>
              )}
            </div>
          ) : (
            <div className="card empty">Wähle links ein Rezept für die Detailansicht.</div>
          )}
        </div>
      </div>
    </div>
  )
}
