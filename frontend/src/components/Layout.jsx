import Sidebar from './Sidebar'
import TopBar from './TopBar'

function Layout({ children }) {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Sidebar />
      </aside>

      <div className="app-main">
        <header className="app-header">
          <TopBar />
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  )
}

export default Layout
