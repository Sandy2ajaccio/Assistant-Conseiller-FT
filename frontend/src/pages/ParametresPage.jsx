import DecisionNotice from '../components/DecisionNotice'

function ParametresPage() {
  return (
    <section className="demandeur-page">
      <section className="page-card">
        <div className="page-title">
          <div>
            <h2>Paramètres</h2>
            <p>Configuration de Cap Décision FT côté frontend.</p>
            <span className="rgpd-badge">Analyse anonymisée – aide à la décision uniquement</span>
          </div>
        </div>
      </section>

      <DecisionNotice />

      <section className="dashboard-card section-card">
        <div className="card-header">
          <h3>Authentification Google</h3>
          <p>Préparation frontend uniquement, sans connexion Firebase active.</p>
        </div>

        <ul className="list-card">
          <li>Emplacement réservé pour le bouton de connexion Google.</li>
          <li>Structure de page prête pour intégrer un état connecté/non connecté.</li>
          <li>Aucun appel backend ni fournisseur d’authentification configuré à ce stade.</li>
        </ul>
      </section>

      <section className="dashboard-card section-card">
        <div className="card-header">
          <h3>Règles RGPD</h3>
          <p>Le module n’accepte que les données anonymisées utiles à l’analyse métier.</p>
        </div>
      </section>
    </section>
  )
}

export default ParametresPage
