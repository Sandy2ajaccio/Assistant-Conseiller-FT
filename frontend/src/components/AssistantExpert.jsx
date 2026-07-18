import { analyserDemandeur } from '../services/moteurExpert'

function AssistantExpert({ demandeur, summary = false }) {
  const analyse = analyserDemandeur(demandeur)
  const actionsPrincipales = analyse.actions.slice(0, 3)

  const copierSynthese = async () => {
    await navigator.clipboard.writeText(analyse.synthese)
  }

  return (
    <section className={`dashboard-card section-card ${summary ? 'assistant-summary' : ''}`}>
      <div className="card-header">
        <h3>Assistant Expert</h3>
        <p>{summary ? 'Résumé métier pour le tableau de bord.' : 'Analyse métier structurée pour aider le conseiller.'}</p>
      </div>

      {summary ? (
        <div className="assistant-summary-body">
          <div className="assistant-summary-row">
            <strong>Alertes</strong>
            <p>{analyse.alertes.length}</p>
          </div>
          <div className="assistant-summary-row">
            <strong>Priorité</strong>
            <p>{analyse.priorite}</p>
          </div>
          <div className="assistant-summary-row">
            <strong>Portefeuille conseillé</strong>
            <p>{analyse.portefeuilleConseille}</p>
          </div>
          <div className="assistant-summary-actions">
            <strong>Actions principales</strong>
            <ul>
              {actionsPrincipales.length > 0 ? (
                actionsPrincipales.map((action) => <li key={action}>{action}</li>)
              ) : (
                <li>Aucune action prioritaire identifiée.</li>
              )}
            </ul>
          </div>
        </div>
      ) : (
        <>
          <div className="assistant-metric">
            <div>
              <strong>Score métier</strong>
              <p>{analyse.score}</p>
            </div>

            <div>
              <strong>Niveau de priorité</strong>
              <p>{analyse.priorite}</p>
            </div>
          </div>

          <div className="assistant-list">
            <div>
              <strong>Analyse IA</strong>
              <p>Évaluation croisée du dossier et des comportements de recherche.</p>
            </div>

            <div>
              <strong>Alertes</strong>
              <ul>
                {analyse.alertes.length > 0 ? (
                  analyse.alertes.map((item) => <li key={item}>{item}</li>)
                ) : (
                  <li>Aucune alerte métier spécifique.</li>
                )}
              </ul>
            </div>

            <div>
              <strong>Vérifications</strong>
              <ul>
                {analyse.verifications.length > 0 ? (
                  analyse.verifications.map((item) => <li key={item}>{item}</li>)
                ) : (
                  <li>Aucune vérification spécifique.</li>
                )}
              </ul>
            </div>

              <div>
              <strong>Questions à poser</strong>
              <ul>
                {analyse.questions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <strong>Portefeuille conseillé</strong>
              <p>{analyse.portefeuilleConseille}</p>
              <p className="assistant-note">Ce portefeuille est proposé en fonction des freins de situation et de la reconnaissance TH.</p>
            </div>

            <div>
              <strong>Prestations conseillées</strong>
              <ul>
                {analyse.prestationsDetails.length > 0 ? (
                  analyse.prestationsDetails.map((item) => (
                    <li key={item.message}>
                      <span>{item.message}</span>
                      <p className="assistant-reason">{item.raison}</p>
                    </li>
                  ))
                ) : (
                  <li>Pas de prestation spécifique recommandée.</li>
                )}
              </ul>
            </div>

            <div>
              <strong>Ateliers conseillés</strong>
              <ul>
                {analyse.ateliersDetails.length > 0 ? (
                  analyse.ateliersDetails.map((item) => (
                    <li key={item.message}>
                      <span>{item.message}</span>
                      <p className="assistant-reason">{item.raison}</p>
                    </li>
                  ))
                ) : (
                  <li>Pas d’atelier supplémentaire recommandé.</li>
                )}
              </ul>
            </div>

            <div>
              <strong>Actions proposées</strong>
              <ul>
                {analyse.actionsDetails.length > 0 ? (
                  analyse.actionsDetails.map((item) => (
                    <li key={item.message}>
                      <span>{item.message}</span>
                      <p className="assistant-reason">{item.raison}</p>
                    </li>
                  ))
                ) : (
                  <li>Aucune action automatique ; le conseiller décide.</li>
                )}
              </ul>
            </div>

            <div>
              <strong>Synthèse</strong>
              <p>{analyse.synthese}</p>
              <button type="button" className="copy-button" onClick={copierSynthese}>
                Copier la synthèse
              </button>
            </div>

            <div className="assistant-note">
              Le conseiller reste décideur : ces recommandations expliquent pourquoi elles sont proposées, mais la décision finale revient au référent.
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default AssistantExpert
