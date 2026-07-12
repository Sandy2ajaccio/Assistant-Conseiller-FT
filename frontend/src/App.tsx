import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import TableauBord from './pages/TableauBord'
import ListeDemandeurs from './pages/ListeDemandeurs'
import FicheDemandeur from './pages/FicheDemandeur'

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <aside className="app-sidebar">
          <div className="brand">
            <span>France Travail</span>
            <strong>Portefeuille</strong>
          </div>
          <nav className="nav-menu">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')} end>
              Tableau de bord
            </NavLink>
            <NavLink to="/demandeurs" className={({ isActive }) => (isActive ? 'active' : '')}>
              Liste des demandeurs
            </NavLink>
          </nav>
        </aside>

        <main className="app-content">
          <header className="app-header">
            <div>
              <h1>Portefeuille métier</h1>
              <p>Interface de suivi des portefeuilles et des demandeurs.</p>
            </div>
          </header>

          <Routes>
            <Route path="/" element={<TableauBord />} />
            <Route path="/demandeurs" element={<ListeDemandeurs />} />
            <Route path="/demandeurs/:id" element={<FicheDemandeur />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
