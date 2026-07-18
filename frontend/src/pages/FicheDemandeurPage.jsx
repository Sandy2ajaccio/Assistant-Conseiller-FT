import SectionCard from '../components/SectionCard'

function FicheDemandeurPage() {
  return (
    <section className="demandeur-page">
      <div className="page-title">
        <div>
          <h2>Fiche demandeur</h2>
          <p>Vue professionnelle de consultation du dossier.</p>
        </div>
      </div>

      <p className="decision-note">
        Cap Décision FT analyse, vérifie et propose des pistes. La décision finale appartient toujours au conseiller.
      </p>

      <div className="demandeur-grid demandeur-grid-professional">
        <div className="column column-main">
          <SectionCard title="Dossier" description="Informations d'identification métier.">
            <div className="profile-list">
              <div>
                <strong>Civilité</strong>
                <p>M. / Mme</p>
              </div>
              <div>
                <strong>Âge</strong>
                <p></p>
              </div>
              <div>
                <strong>Date d'inscription</strong>
                <p></p>
              </div>
              <div>
                <strong>Portefeuille actuel</strong>
                <p></p>
              </div>
              <div>
                <strong>Référent</strong>
                <p></p>
              </div>
              <div>
                <strong>Statut du dossier</strong>
                <p></p>
              </div>
            </div>
            <span className="rgpd-badge">Analyse anonymisée – aide à la décision uniquement</span>
          </SectionCard>
        </div>

        <div className="column column-secondary">
          <SectionCard title="Situation" description="Vision consolidée de la situation actuelle.">
            <div className="profile-list">
              <div>
                <strong>RSA</strong>
                <p></p>
              </div>
              <div>
                <strong>ARE</strong>
                <p></p>
              </div>
              <div>
                <strong>Fin des droits ARE</strong>
                <p></p>
              </div>
              <div>
                <strong>Projet professionnel</strong>
                <p></p>
              </div>
              <div>
                <strong>Recherche d'emploi</strong>
                <p></p>
              </div>
              <div>
                <strong>Freins identifiés</strong>
                <p></p>
              </div>
              <div>
                <strong>Contrat d'engagement</strong>
                <p></p>
              </div>
              <div>
                <strong>DPA réalisée</strong>
                <p></p>
              </div>
              <div>
                <strong>Premier entretien réalisé</strong>
                <p></p>
              </div>
              <div>
                <strong>Dernier entretien</strong>
                <p></p>
              </div>
              <div>
                <strong>Dernière action</strong>
                <p></p>
              </div>
              <div>
                <strong>Prestations réalisées</strong>
                <p></p>
              </div>
              <div>
                <strong>Ateliers réalisés</strong>
                <p></p>
              </div>
              <div>
                <strong>Formations</strong>
                <p></p>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="column column-aside">
          <SectionCard title="Assistant expert" description="Synthèse d'appui à la décision du conseiller.">
            <div className="assistant-list">
              <div>
                <strong>Score métier</strong>
                <p></p>
              </div>
              <div>
                <strong>Niveau de priorité</strong>
                <p></p>
              </div>
              <div>
                <strong>Alertes</strong>
                <ul />
              </div>
              <div>
                <strong>Questions à poser</strong>
                <ul />
              </div>
              <div>
                <strong>Contrôles à effectuer</strong>
                <ul />
              </div>
              <div>
                <strong>Portefeuille conseillé</strong>
                <p></p>
              </div>
              <div>
                <strong>Ateliers conseillés</strong>
                <ul />
              </div>
              <div>
                <strong>Prestations conseillées</strong>
                <ul />
              </div>
              <div>
                <strong>Partenaires à mobiliser</strong>
                <ul />
              </div>
              <div>
                <strong>Actions proposées</strong>
                <ul />
              </div>
              <div>
                <strong>Synthèse prête à copier dans le SI</strong>
                <textarea rows={8} readOnly placeholder="Synthèse en lecture seule" />
              </div>
            </div>
            <button type="button" className="copy-button">
              Copier la synthèse
            </button>
          </SectionCard>
        </div>
      </div>
    </section>
  )
}

export default FicheDemandeurPage
