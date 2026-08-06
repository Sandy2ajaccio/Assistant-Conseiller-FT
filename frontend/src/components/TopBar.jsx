import SearchBar from './SearchBar'
import { useLocation } from 'react-router-dom'

const TITLES = {
  '/': 'Assistant de mission',
  '/analyse': 'Analyse de situation',
  '/dashboard': 'Tableau de bord',
  '/assistant': 'Assistant de mission',
  '/connaissances': 'Centre de connaissances',
  '/formations': 'Formations à venir',
  '/veille-officielle': 'Veille officielle',
  '/parametres': 'Paramètres',
}

function TopBar() {
  const location = useLocation()
  const title = location.pathname.startsWith('/missions/')
    ? 'Module mission'
    : (TITLES[location.pathname] || 'Cap Décision FT')

  return (
    <div className="topbar-row">
      <div>
        <p className="topbar-label">Cap Décision FT</p>
        <p className="topbar-label">Assistant personnel d’aide à la décision – France Travail Corse</p>
        <h1 className="topbar-title">{title}</h1>
      </div>
      <SearchBar />
    </div>
  )
}

export default TopBar
