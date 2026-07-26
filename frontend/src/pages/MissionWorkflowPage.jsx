import { Link, useParams } from 'react-router-dom'
import DecisionNotice from '../components/DecisionNotice'
import { missionWorkflow, missions } from '../data/missions'
import { portefeuillesCorse } from '../data/configurationCorse'
import { dpa, premierEntretien, creu } from '../knowledge/reglesMetier'
import { ateliersCorse } from '../knowledge/ateliers'
import { prestationsCorse } from '../knowledge/prestations'
import { partenairesCorse } from '../knowledge/partenaires'

const missionSpecificRefs = {
  'dpa-premier-entretien': {
    points: dpa.objectifs,
    checks: premierEntretien.pointsDeVigilance,
  },
  creu: {
    points: creu.verifications,
    checks: creu.justificatifsAdmis,
  },
  'recherche-atelier': {
    points: ateliersCorse.map((item) => item.nom),
    checks: ateliersCorse.map((item) => item.vigilance),
  },
  'recherche-prestation': {
    points: prestationsCorse.map((item) => item.nom),
    checks: prestationsCorse.map((item) => item.vigilance),
  },
  'recherche-partenaire': {
    points: partenairesCorse.map((item) => item.nom),
    checks: partenairesCorse.map((item) => item.vigilance),
  },
}

function MissionWorkflowPage() {
  const { missionId } = useParams()
  const mission = missions.find((item) => item.id === missionId)

  if (!mission || mission.path === '/connaissances') {
    return (
      <section className="page-card">
        <h2>Mission introuvable</h2>
        <p>Cette mission n est pas disponible.</p>
        <Link className="secondary-link" to="/">
          Retour à l accueil
        </Link>
      </section>
    )
  }

  const references = missionSpecificRefs[missionId] || {
    points: dpa.actionsPossibles,
    checks: dpa.pointsVigilance,
  }

  return (
    <section className="demandeur-page">
      <div className="page-title">
        <div>
          <h2>{mission.label}</h2>
          <p>{mission.description}</p>
          <span className="rgpd-badge">Analyse anonymisée – aide à la décision uniquement</span>
        </div>
      </div>

      <DecisionNotice />

      <section className="dashboard-card section-card">
        <div className="card-header">
          <h3>Déroulement de mission</h3>
          <p>Trame commune à appliquer pour chaque mission.</p>
        </div>
        <ol className="workflow-list">
          {missionWorkflow.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="dashboard-card section-card">
        <div className="card-header">
          <h3>Références Corse utiles</h3>
          <p>Sélection issue du dossier knowledge et de la configuration Corse.</p>
        </div>
        <div className="mission-two-columns">
          <div>
            <strong>Points à préparer</strong>
            <ul>
              {references.points.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Points de vérification MAP</strong>
            <ul>
              {references.checks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="dashboard-card section-card">
        <div className="card-header">
          <h3>Portefeuilles disponibles</h3>
        </div>
        <div className="portfolio-tags">
          {portefeuillesCorse.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <div className="action-buttons">
          <Link to="/analyse" className="inline-link-button">Ouvrir l analyse de situation</Link>
          <Link to="/connaissances" className="inline-link-button">Consulter le centre de connaissances</Link>
        </div>
      </section>
    </section>
  )
}

export default MissionWorkflowPage
