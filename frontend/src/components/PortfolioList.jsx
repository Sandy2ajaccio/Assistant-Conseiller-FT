import { portefeuilles } from '../data/portefeuilles'

function PortfolioList() {
  return (
    <section className="dashboard-card">
      <div className="card-header">
        <h3>Portefeuilles métiers</h3>
        <p>Catégories France Travail pour le suivi des bénéficiaires.</p>
      </div>
      <div className="card-grid">
        {portefeuilles.map((item) => (
          <article key={item.id} className="small-card">
            <h4>{item.nom}</h4>
            <p>{item.description}</p>
            <span className={item.actif ? 'status-active' : 'status-inactive'}>
              {item.actif ? 'Actif' : 'Inactif'}
            </span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default PortfolioList
