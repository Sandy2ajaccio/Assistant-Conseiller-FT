import { analyses } from '../data/regles'

function AnalyseIA() {
  return (
    <section className="dashboard-card">
      <div className="card-header">
        <h3>Analyse IA</h3>
        <p>Liste d’éléments métier à considérer pour le suivi.</p>
      </div>
      <ul className="list-card">
        {analyses.map((item) => (
          <li key={item.id}>
            <strong>{item.titre}</strong>
            <p>{item.description}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default AnalyseIA
