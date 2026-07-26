import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import DecisionNotice from '../components/DecisionNotice'
import { missions } from '../data/missions'

const ASSISTANT_MISSION_IDS = [
  'telephone',
  'vcm',
  'accueil-physique',
  'dpa-premier-entretien',
  'entretien-suivi',
  'absences-manquements',
]

function AccueilMissionsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedMissionId, setSelectedMissionId] = useState('')
  const [situation, setSituation] = useState('')

  const assistantMissions = missions.filter((mission) => ASSISTANT_MISSION_IDS.includes(mission.id))
  const isAssistantPage = location.pathname === '/assistant'

  const onLaunchMission = () => {
    const mission = assistantMissions.find((item) => item.id === selectedMissionId)
    if (!mission) return
    navigate(mission.path)
  }

  return (
    <section className="demandeur-page">
      <div className="page-title">
        <div>
          <h2>{isAssistantPage ? 'Assistant de mission' : 'Accueil'}</h2>
          <p>
            {isAssistantPage
              ? 'Parcours guidé en 3 étapes pour préparer votre action métier.'
              : 'Version V1 : accès recentré sur l Assistant de mission et les modules essentiels.'}
          </p>
          <span className="rgpd-badge">Analyse anonymisée – aide à la décision uniquement</span>
        </div>
      </div>

      <DecisionNotice />

      {!isAssistantPage ? (
        <section className="dashboard-card section-card">
          <div className="card-header">
            <h3>🚀 Assistant de mission</h3>
            <p>Démarrer le parcours guidé pour les missions d entretien.</p>
          </div>
          <div className="action-buttons">
            <Link to="/assistant" className="inline-link-button">
              Ouvrir l Assistant de mission
            </Link>
          </div>
        </section>
      ) : (
        <section className="dashboard-card section-card">
          <div className="card-header">
            <h3>🚀 Assistant de mission</h3>
            <p>Progression guidée pour structurer l analyse du conseiller.</p>
          </div>

          <div className="profile-list">
            <div>
              <strong>Étape 1</strong>
              <p>Choix de la mission :</p>
              <select value={selectedMissionId} onChange={(event) => setSelectedMissionId(event.target.value)}>
                <option value="" disabled>
                  Sélectionner une mission
                </option>
                {assistantMissions.map((mission) => (
                  <option key={mission.id} value={mission.id}>
                    {mission.id === 'absences-manquements' ? 'Gestion des absences' : mission.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <strong>Étape 2</strong>
              <p>Décrivez la situation</p>
              <textarea
                rows={4}
                value={situation}
                onChange={(event) => setSituation(event.target.value)}
                placeholder="Décrivez la situation"
              />
            </div>

            <div>
              <strong>Étape 3</strong>
              <div className="action-buttons">
                <button type="button" className="inline-link-button" onClick={onLaunchMission} disabled={!selectedMissionId}>
                  🧠 Analyser
                </button>
              </div>
            </div>

            <div>
              <strong>Situation</strong>
              <p></p>
            </div>
            <div>
              <strong>Ce que je remarque</strong>
              <p></p>
            </div>
            <div>
              <strong>Ce que je dois vérifier</strong>
              <p></p>
            </div>
            <div>
              <strong>Vigilances métier</strong>
              <p></p>
            </div>
            <div>
              <strong>Prestations proposées</strong>
              <p></p>
            </div>
            <div>
              <strong>Ateliers proposés</strong>
              <p></p>
            </div>
            <div>
              <strong>Partenaires proposés</strong>
              <p></p>
            </div>
            <div>
              <strong>Portefeuille conseillé</strong>
              <p></p>
            </div>
            <div>
              <strong>Plan d'action</strong>
              <p></p>
            </div>
            <div>
              <strong>Synthèse</strong>
              <p></p>
            </div>
            <div>
              <strong>Action MAP</strong>
              <p></p>
            </div>
          </div>
        </section>
      )}
    </section>
  )
}

export default AccueilMissionsPage
