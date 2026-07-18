function Alertes() {
  return (
    <section className="dashboard-card">
      <div className="card-header">
        <h3>Alertes</h3>
        <p>Information synthétique sur les éléments à surveiller.</p>
      </div>
      <div className="alert-list">
        <article className="alert-item">
          <strong>DPA en attente</strong>
          <p>Plusieurs dossiers attendent une dernière évaluation métier.</p>
        </article>
        <article className="alert-item">
          <strong>Demandes d’affectation à traiter</strong>
          <p>Des dossiers nécessitent une affectation de portefeuille.</p>
        </article>
        <article className="alert-item">
          <strong>Gestion des manquements</strong>
          <p>Identifier les retours et les pièces manquantes pour réouverture.</p>
        </article>
        <article className="alert-item">
          <strong>Convocations d’ateliers à préparer</strong>
          <p>Préparer les convocations pour les prochains créneaux collectifs.</p>
        </article>
      </div>
    </section>
  )
}

export default Alertes
