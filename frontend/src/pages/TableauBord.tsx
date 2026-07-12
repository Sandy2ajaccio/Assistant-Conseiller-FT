function TableauBord() {
  return (
    <section className="page-card">
      <div className="page-title">
        <div>
          <h2>Tableau de bord</h2>
          <p>Vue synthétique du portefeuille métier.</p>
        </div>
      </div>

      <div className="grid-grid">
        <article className="metric-card">
          <h3>Demandes en cours</h3>
          <p>12</p>
        </article>
        <article className="metric-card">
          <h3>Alertes</h3>
          <p>3</p>
        </article>
        <article className="metric-card">
          <h3>Portefeuilles actifs</h3>
          <p>5</p>
        </article>
      </div>

      <div className="page-panel">
        <h3>Suivi métier</h3>
        <p>Cette interface est une maquette de logiciel métier pour les conseillers France Travail.</p>
      </div>
    </section>
  )
}

export default TableauBord
