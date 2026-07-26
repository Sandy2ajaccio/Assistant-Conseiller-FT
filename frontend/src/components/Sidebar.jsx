import { NavLink } from 'react-router-dom'

const navItems = [
  { label: '📊 Tableau de bord', to: '/prescriptions' },
  { label: '🚀 Assistant de mission', to: '/assistant' },
  { label: '📚 Centre de connaissances', to: '/connaissances' },
  { label: '⚙ Paramètres', to: '/parametres' },
]

function Sidebar() {
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
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
