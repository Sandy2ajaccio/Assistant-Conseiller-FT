import { useRef, useState } from 'react'
import SectionCard from '../components/SectionCard'
import DecisionNotice from '../components/DecisionNotice'
import { analyserSituation } from '../services/moteurExpert'
import { portefeuillesCorse } from '../data/configurationCorse'

const RESULT_KEYS = [
  ['Score métier', 'score'],
  ['Priorité', 'priorite'],
  ['Pourquoi ?', 'pourquoi'],
  ['Alertes', 'alertes'],
  ['Contrôles à effectuer', 'verifications'],
  ['Portefeuille conseillé', 'portefeuilleConseille'],
  ['Ateliers conseillés', 'ateliers'],
  ['Prestations conseillées', 'prestations'],
  ['Partenaires conseillés', 'partenaires'],
  ['Questions à poser', 'questions'],
  ['Actions proposées', 'actions'],
  ['Synthèse prête à copier', 'synthese'],
]

function AnalyseSituationPage() {
  const formRef = useRef(null)
  const [resultat, setResultat] = useState(null)

  const toList = (value) => {
    return String(value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  const renderValue = (value) => {
    if (Array.isArray(value)) {
      return (
        <ul>
          {value.length === 0 ? (
            <li>Aucun élément</li>
          ) : (
            value.map((item, index) => {
              if (typeof item === 'string') {
                return <li key={`${item}-${index}`}>{item}</li>
              }

              if (item && typeof item === 'object') {
                return (
                  <li key={`${item.nom || 'item'}-${index}`}>
                    <span>{item.nom || 'Élément'}</span>
                    {item.pourquoi ? <p className="assistant-reason">{item.pourquoi}</p> : null}
                  </li>
                )
              }

              return null
            })
          )}
        </ul>
      )
    }

    return <p>{value || 'Non renseigné'}</p>
  }

  const onSubmit = (event) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const freins = formData.getAll('freins')

    const situation = {
      civilite: formData.get('civilite') || '',
      age: formData.get('age') ? Number(formData.get('age')) : null,
      dateInscription: formData.get('dateInscription') || '',
      rsa: formData.get('rsa') === 'oui',
      are: formData.get('are') === 'oui',
      dateFinAre: formData.get('dateFinAre') || '',
      portefeuille: formData.get('portefeuille') || '',
      dpaRealisee: formData.get('dpaRealisee') === 'oui',
      premierEntretienRealise: formData.get('premierEntretienRealise') === 'oui',
      contratEngagementSigne: formData.get('contratEngagementSigne') === 'oui',
      projetProfessionnel: formData.get('projetProfessionnel') || '',
      rechercheEmploi: formData.get('rechercheEmploi') || '',
      cvVisible: formData.get('cvVisible') === 'oui',
      rqth: formData.get('rqth') === 'oui',
      freins,
      nombreFreins: freins.length,
      prestations: toList(formData.get('prestations')),
      ateliers: toList(formData.get('ateliers')),
      formations: toList(formData.get('formations')),
    }

    setResultat(analyserSituation(situation))
  }

  const onCopySynthese = async () => {
    if (!resultat?.synthese) return
    await navigator.clipboard.writeText(resultat.synthese)
  }

  const onNewAnalysis = () => {
    formRef.current?.reset()
    setResultat(null)
  }

  return (
    <section className="demandeur-page">
      <div className="page-title">
        <div>
          <h2>Analyse de situation</h2>
          <p>Écran principal de la V1 simplifiée.</p>
          <span className="rgpd-badge">Analyse anonymisée – aide à la décision uniquement</span>
        </div>
      </div>

      <DecisionNotice />

      <section className="dashboard-card section-card">
        <div className="card-header">
          <h3>Cadre RGPD</h3>
          <p>Respect strict de l’anonymisation dans l’application.</p>
        </div>
        <div className="mission-two-columns">
          <div>
            <strong>Ne jamais demander ou enregistrer</strong>
            <ul>
              <li>Nom</li>
              <li>Prénom</li>
              <li>Identifiant France Travail</li>
              <li>Téléphone</li>
              <li>Adresse</li>
              <li>Mail du demandeur d’emploi</li>
            </ul>
          </div>
          <div>
            <strong>Données autorisées</strong>
            <ul>
              <li>M. ou Mme</li>
              <li>Âge</li>
              <li>Données administratives utiles à l’analyse</li>
              <li>Données professionnelles utiles à l’analyse</li>
            </ul>
          </div>
        </div>
      </section>

      <form ref={formRef} className="demandeur-grid demandeur-grid-professional" onSubmit={onSubmit}>
        <div className="column column-main">
          <SectionCard title="1. Saisie de la situation" description="Conserver uniquement les données autorisées par la V1 RGPD.">
            <div className="profile-list">
              <div>
                <strong>Civilité</strong>
                <div className="choice-row">
                  <label>
                    <input type="radio" name="civilite" value="M." defaultChecked /> M.
                  </label>
                  <label>
                    <input type="radio" name="civilite" value="Mme" /> Mme
                  </label>
                </div>
              </div>

              <div>
                <strong>Âge</strong>
                <input type="number" name="age" min="16" max="99" placeholder="Ex: 36" />
              </div>

              <div>
                <strong>Date d'inscription</strong>
                <input type="date" name="dateInscription" />
              </div>

              <div>
                <strong>RSA</strong>
                <div className="choice-row">
                  <label>
                    <input type="radio" name="rsa" value="oui" /> Oui
                  </label>
                  <label>
                    <input type="radio" name="rsa" value="non" defaultChecked /> Non
                  </label>
                </div>
              </div>

              <div>
                <strong>ARE</strong>
                <div className="choice-row">
                  <label>
                    <input type="radio" name="are" value="oui" /> Oui
                  </label>
                  <label>
                    <input type="radio" name="are" value="non" defaultChecked /> Non
                  </label>
                </div>
              </div>

              <div>
                <strong>Fin ARE</strong>
                <input type="date" name="dateFinAre" />
              </div>

              <div>
                <strong>Portefeuille</strong>
                <select name="portefeuille" defaultValue="">
                  <option value="" disabled>
                    Sélectionner un portefeuille
                  </option>
                  {portefeuillesCorse.map((portefeuille) => (
                    <option key={portefeuille} value={portefeuille}>
                      {portefeuille}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <strong>DPA</strong>
                <div className="choice-row">
                  <label>
                    <input type="radio" name="dpaRealisee" value="oui" /> Oui
                  </label>
                  <label>
                    <input type="radio" name="dpaRealisee" value="non" defaultChecked /> Non
                  </label>
                </div>
              </div>

              <div>
                <strong>Premier entretien</strong>
                <div className="choice-row">
                  <label>
                    <input type="radio" name="premierEntretienRealise" value="oui" /> Oui
                  </label>
                  <label>
                    <input type="radio" name="premierEntretienRealise" value="non" defaultChecked /> Non
                  </label>
                </div>
              </div>

              <div>
                <strong>Contrat d'engagement</strong>
                <div className="choice-row">
                  <label>
                    <input type="radio" name="contratEngagementSigne" value="oui" /> Oui
                  </label>
                  <label>
                    <input type="radio" name="contratEngagementSigne" value="non" defaultChecked /> Non
                  </label>
                </div>
              </div>

              <div>
                <strong>Projet professionnel</strong>
                <textarea name="projetProfessionnel" rows={3} placeholder="Décrire le projet professionnel" />
              </div>

              <div>
                <strong>Recherche d'emploi</strong>
                <select name="rechercheEmploi" defaultValue="">
                  <option value="" disabled>
                    Sélectionner un niveau
                  </option>
                  <option>Très active</option>
                  <option>Active</option>
                  <option>Faible</option>
                  <option>Absente</option>
                </select>
              </div>

              <div>
                <strong>CV visible</strong>
                <div className="choice-row">
                  <label>
                    <input type="radio" name="cvVisible" value="oui" /> Oui
                  </label>
                  <label>
                    <input type="radio" name="cvVisible" value="non" defaultChecked /> Non
                  </label>
                </div>
              </div>

              <div>
                <strong>RQTH</strong>
                <div className="choice-row">
                  <label>
                    <input type="radio" name="rqth" value="oui" /> Oui
                  </label>
                  <label>
                    <input type="radio" name="rqth" value="non" defaultChecked /> Non
                  </label>
                </div>
              </div>

              <div>
                <strong>Freins</strong>
                <div className="choice-row">
                  {['Mobilité', 'Logement', 'Santé', 'Numérique', "Garde d'enfant", 'Justice', 'Endettement', 'Langue', 'Autre'].map(
                    (frein) => (
                      <label key={frein}>
                        <input type="checkbox" name="freins" value={frein} /> {frein}
                      </label>
                    ),
                  )}
                </div>
              </div>

              <div>
                <strong>Prestations déjà réalisées</strong>
                <input type="text" name="prestations" placeholder="Ex: Activ'Projet, CEJ" />
              </div>

              <div>
                <strong>Ateliers déjà réalisés</strong>
                <input type="text" name="ateliers" placeholder="Ex: Création CV, PIX Emploi" />
              </div>

              <div>
                <strong>Formations</strong>
                <input type="text" name="formations" placeholder="Ex: Formation transversale" />
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="column column-secondary">
          <div className="action-buttons">
            <button type="submit">Analyser la situation</button>
          </div>
        </div>
      </form>

      {resultat && (
        <SectionCard title="3. Résultat" description="Résultat de l'analyse métier pour le conseiller.">
          <div className="assistant-list">
            {RESULT_KEYS.map(([label, key]) => (
              <div key={key}>
                <strong>{label}</strong>
                {renderValue(resultat[key])}
              </div>
            ))}
          </div>

          <div className="action-buttons">
            <button type="button" className="copy-button" onClick={onCopySynthese}>
              Copier la synthèse
            </button>
            <button type="button" className="copy-button" onClick={onNewAnalysis}>
              Nouvelle analyse
            </button>
          </div>
        </SectionCard>
      )}
    </section>
  )
}

export default AnalyseSituationPage
