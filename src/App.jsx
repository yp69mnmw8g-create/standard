import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import AlchemyPage from './pages/AlchemyPage.jsx'
import QuestsPage from './pages/QuestsPage.jsx'
import RecommendationsPage from './pages/RecommendationsPage.jsx'
import MapPage from './pages/MapPage.jsx'
import './styles/App.css'

// Zentrale Definition der vier Bereiche. Neue Bereiche hier ergänzen,
// dann unten eine <Route> anlegen — Navigation aktualisiert sich automatisch.
const SECTIONS = [
  { path: '/alchemie', label: 'Alchemie', icon: '⚗️' },
  { path: '/quests', label: 'Quests', icon: '📜' },
  { path: '/empfehlung', label: 'Empfehlung', icon: '🎯' },
  { path: '/karte', label: 'Karte', icon: '🗺️' },
]

export default function App() {
  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <span className="app__brand-icon">⚔️</span>
          <div>
            <h1 className="app__title">KCD2 Companion</h1>
            <p className="app__subtitle">Kingdom Come: Deliverance 2 — Begleiter</p>
          </div>
        </div>
        <nav className="app__nav">
          {SECTIONS.map((s) => (
            <NavLink
              key={s.path}
              to={s.path}
              className={({ isActive }) =>
                'app__nav-link' + (isActive ? ' app__nav-link--active' : '')
              }
            >
              <span aria-hidden="true">{s.icon}</span> {s.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="app__main">
        <Routes>
          <Route path="/" element={<Navigate to="/alchemie" replace />} />
          <Route path="/alchemie" element={<AlchemyPage />} />
          <Route path="/quests" element={<QuestsPage />} />
          <Route path="/empfehlung" element={<RecommendationsPage />} />
          <Route path="/karte" element={<MapPage />} />
          <Route path="*" element={<div className="card">Seite nicht gefunden.</div>} />
        </Routes>
      </main>

      <footer className="app__footer">
        Lokales Tool · Alle Daten als JSON unter <code>src/data/</code> · Dummy-Daten (Platzhalter)
      </footer>
    </div>
  )
}
