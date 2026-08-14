import { useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

function Layout({ children }) {
  const [menuOuvert, setMenuOuvert] = useState(false)

  return (
    <div className="app-shell">
      <aside className={`app-sidebar${menuOuvert ? ' app-sidebar-ouvert' : ''}`}>
        <Sidebar onNavigate={() => setMenuOuvert(false)} />
      </aside>

      {menuOuvert ? (
        <button
          type="button"
          className="app-sidebar-overlay"
          aria-label="Fermer le menu de navigation"
          onClick={() => setMenuOuvert(false)}
        />
      ) : null}

      <div className="app-main">
        <header className="app-header">
          <button
            type="button"
            className="app-menu-toggle"
            aria-label="Ouvrir le menu de navigation"
            onClick={() => setMenuOuvert(true)}
          >
            ☰
          </button>
          <TopBar />
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  )
}

export default Layout
