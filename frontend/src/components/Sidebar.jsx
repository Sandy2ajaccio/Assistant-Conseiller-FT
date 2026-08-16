import { useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'

import { dateId, summarizeUrgencies } from '../services/urgencyCalendarRules.js'
import { loadUrgencies, subscribeUrgencies } from '../services/urgencyCalendarService.js'

const navItems = [
  { label: '📅 Agenda et urgences', to: '/agenda', agenda: true },
  { label: '🚀 Assistant de mission', to: '/assistant' },
  { label: '👥 Demandeurs', to: '/demandeurs' },
  { label: '📚 Centre de connaissances', to: '/connaissances' },
  { label: '🎓 Formations', to: '/formations' },
  { label: '📰 Veille officielle', to: '/veille-officielle' },
  { label: '⚙ Paramètres', to: '/parametres' },
]

function Sidebar({ onNavigate }) {
  const [urgencies, setUrgencies] = useState(() => loadUrgencies())
  useEffect(() => subscribeUrgencies(setUrgencies), [])

  const alertCount = useMemo(() => {
    const summary = summarizeUrgencies(urgencies, dateId())
    return summary.overdue.length + summary.today.length
  }, [urgencies])

  return (
    <div>
      <div className="brand">
        <strong>Cap Décision FT</strong>
        <span>Assistant personnel d’aide à la décision – France Travail Corse</span>
      </div>

      <nav className="nav-menu" aria-label="Navigation principale">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) => (isActive ? 'active' : '')}
            end={item.to === '/'}
            onClick={onNavigate}
          >
            <span>{item.label}</span>
            {item.agenda && alertCount ? (
              <span
                aria-label={`${alertCount} urgence(s) à traiter`}
                style={{
                  marginLeft: 'auto',
                  minWidth: 24,
                  padding: '2px 7px',
                  borderRadius: 999,
                  background: '#d32f2f',
                  color: 'white',
                  fontWeight: 900,
                  textAlign: 'center',
                }}
              >
                {alertCount}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
