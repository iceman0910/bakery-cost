// src/App.jsx
import React, { useState } from 'react'
import RawPage from './pages/RawPage'
import PrepPage from './pages/PrepPage'
import FinishedPage from './pages/FinishedPage'
import './index.css'

const TABS = [
  { id: 'raw',      label: '原料食材', icon: '🌾' },
  { id: 'prep',     label: '備料食材', icon: '🥣' },
  { id: 'finished', label: '成品成本', icon: '🍞' },
]

export default function App() {
  const [tab, setTab] = useState('raw')

  return (
    <div className="layout">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🥐</span>
            <span className="logo-text">烘焙成本計算</span>
          </div>
          <nav className="nav">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`nav-btn ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                <span className="nav-icon">{t.icon}</span>
                <span className="nav-label">{t.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="main">
        {tab === 'raw'      && <RawPage />}
        {tab === 'prep'     && <PrepPage />}
        {tab === 'finished' && <FinishedPage />}
      </main>
    </div>
  )
}
