import { useEffect, useState } from 'react'

function App() {
  const [advisors, setAdvisors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/advisors/')
      .then((response) => response.json())
      .then((data) => setAdvisors(data))
      .catch(() => setAdvisors([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="app-shell">
      <header>
        <h1>Assistant Conseiller FT</h1>
        <p>Liste des conseillers disponibles</p>
      </header>

      {loading ? (
        <p>Chargement...</p>
      ) : advisors.length ? (
        <ul className="advisor-list">
          {advisors.map((advisor) => (
            <li key={advisor.id} className="advisor-card">
              <h2>{advisor.name}</h2>
              <p>{advisor.specialty || 'Spécialité non définie'}</p>
              <p>{advisor.email}</p>
              <p>{advisor.bio}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucun conseiller trouvé.</p>
      )}
    </div>
  )
}

export default App
