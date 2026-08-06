import { useRef, useState } from 'react'
import SectionCard from '../components/SectionCard'
import DecisionNotice from '../components/DecisionNotice'
import { analyserSituation360 } from '../engines/moteurDiagnostic360'
import { portefeuillesCorse } from '../data/configurationCorse'

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

    setResultat(analyserSituation360(situation))
  }

  const onCopySynthese = async () => {
    if (!resultat?.synthese) return
    const orientation = resultat.orientation?.portefeuillePrincipal?.libelle || 'À confirmer'
    const lignes = [
      `Catégorie : ${resultat.categorie?.libelle || 'À confirmer'}`,
      `Priorité : ${resultat.priorite?.niveau || 'À confirmer'} (${resultat.priorite?.score ?? 0}/100)`,
      `Orientation proposée : ${orientation}`,
      `Objectif principal : ${resultat.synthese.objectifPrincipal || 'À préciser'}`,
      `Accompagnement principal : ${resultat.synthese.accompagnementPrincipal || 'À préciser'}`,
      `Alertes : ${(resultat.synthese.alertes || []).join(' ; ') || 'Aucune'}`,
      `Actions : ${(resultat.synthese.actions || []).join(' ; ') || 'À définir'}`,
      `Prescriptions : ${(resultat.prescriptions?.recommandations || []).map((item) => item.nom).join(' ; ') || 'Aucune proposition automatique'}`,
      'Décision humaine requise : confirmer l’orientation et les prescriptions selon la situation et les procédures internes France Travail.',
    ]
    await navigator.clipboard.writeText(lignes.join('\n'))
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
        <>
          <SectionCard title="3. Diagnostic 360" description="Analyse multidimensionnelle et recommandations à confirmer par le conseiller.">
            <div className="assistant-list">
              <div><strong>Catégorie</strong>{renderValue(resultat.categorie?.libelle)}</div>
              <div><strong>Description</strong>{renderValue(resultat.categorie?.description)}</div>
              <div><strong>Priorité</strong>{renderValue(`${resultat.priorite?.niveau || 'À confirmer'} · ${resultat.priorite?.score ?? 0}/100`)}</div>
              <div><strong>Motifs de priorité</strong>{renderValue(resultat.priorite?.motifs)}</div>
              <div><strong>Orientation proposée</strong>{renderValue(resultat.orientation?.portefeuillePrincipal?.libelle)}</div>
              <div><strong>Motifs d’orientation</strong>{renderValue(resultat.orientation?.portefeuillePrincipal?.motifs)}</div>
              <div><strong>Alternatives</strong>{renderValue((resultat.orientation?.alternatives || []).map((item) => `${item.libelle} (${item.score})`))}</div>
              <div><strong>Droits déclarés</strong>{renderValue(resultat.situationAdministrative?.droits)}</div>
              <div><strong>Projet</strong>{renderValue(resultat.projet?.projet)}</div>
              <div><strong>Projet confirmé</strong>{renderValue(resultat.projet?.projetConfirme ? 'Oui' : 'À confirmer')}</div>
              <div><strong>Disponibilité immédiate</strong>{renderValue(resultat.disponibilite?.disponibleImmediatement === true ? 'Oui' : resultat.disponibilite?.disponibleImmediatement === false ? 'Non' : 'À vérifier')}</div>
              <div><strong>Freins</strong>{renderValue(resultat.freins)}</div>
              <div><strong>Alertes</strong>{renderValue(resultat.synthese?.alertes)}</div>
              <div><strong>Questions à poser</strong>{renderValue(resultat.synthese?.questions)}</div>
              <div><strong>Actions conseiller</strong>{renderValue(resultat.synthese?.actions)}</div>
              <div><strong>Recommandations</strong>{renderValue(resultat.synthese?.recommandations)}</div>
              <div><strong>Objectif principal</strong>{renderValue(resultat.synthese?.objectifPrincipal)}</div>
              <div><strong>Accompagnement principal</strong>{renderValue(resultat.synthese?.accompagnementPrincipal)}</div>
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

          <SectionCard
            title="4. Prescriptions recommandées"
            description="Suggestions à valider selon l’éligibilité, la disponibilité et les procédures internes France Travail."
          >
            <div className="assistant-list">
              {resultat.prescriptions?.recommandations?.length ? (
                resultat.prescriptions.recommandations.map((prescription) => (
                  <div key={prescription.id || prescription.nom}>
                    <strong>{prescription.nom}</strong>
                    <p>{[prescription.type, prescription.categorie].filter(Boolean).join(' · ')}</p>
                    {prescription.objectif ? <p>{prescription.objectif}</p> : null}
                    <p className="assistant-reason"><strong>Score :</strong> {prescription.score}</p>
                    <div><strong>Motifs</strong>{renderValue(prescription.motifs)}</div>
                    {prescription.publicCible ? <p><strong>Public :</strong> {prescription.publicCible}</p> : null}
                    {prescription.conditionsAcces?.length ? <div><strong>Conditions d’accès</strong>{renderValue(prescription.conditionsAcces)}</div> : null}
                    {prescription.vigilances?.length ? <div><strong>Vigilances</strong>{renderValue(prescription.vigilances)}</div> : null}
                    <p className="assistant-reason"><strong>Validation conseiller requise avant prescription.</strong></p>
                  </div>
                ))
              ) : (
                <p>Aucune prescription recommandée avec les informations saisies.</p>
              )}
            </div>
          </SectionCard>
        </>
      )}
    </section>
  )
}

export default AnalyseSituationPage
