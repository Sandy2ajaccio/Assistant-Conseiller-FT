import { INDICES_CRE } from '../data/suiviRemobilisation.js'

const normaliserTexte = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[’']/g, ' ')

const ajouterIndice = (map, id, motif) => {
  if (!INDICES_CRE.some((item) => item.id === id)) return
  if (!map.has(id)) map.set(id, motif)
}

const profilsDuDossier = (record = {}) => new Set(
  Array.isArray(record.profils)
    ? record.profils
    : String(record.profils || '').split(/[;,|]/).map((item) => item.trim()).filter(Boolean),
)

const detecterFaitObligations = (texte) => {
  if (/second.{0,20}refus.{0,30}(ore|offre raisonnable)|deux.{0,20}refus.{0,30}(ore|offre raisonnable)/.test(texte)) {
    return { fait: 'second-refus-ore', label: 'second refus possible d’une offre raisonnable d’emploi' }
  }
  if (/fraude|fausse declaration/.test(texte)) {
    return { fait: 'fraude-fausse-declaration', label: 'suspicion de fraude ou de fausse déclaration' }
  }
  if (/activite.{0,25}non declaree/.test(texte)) {
    return { fait: 'activite-courte-non-declaree', label: 'activité possiblement non déclarée' }
  }
  if (/refus.{0,25}(contrat d engagement|contrat engagement|ce\b)/.test(texte)) {
    return { fait: 'refus-contrat', label: 'refus possible du contrat d’engagement' }
  }
  if (/non respect.{0,30}(reconversion|prp)|projet de reconversion.{0,30}non respecte/.test(texte)) {
    return { fait: 'non-respect-prp', label: 'non-respect possible du projet de reconversion' }
  }
  if (/absence.{0,30}(rdv|rendez vous|convocation)|rendez vous.{0,30}(absent|non honore)|manquement|avertissement|obligation.{0,25}non respectee/.test(texte)) {
    return { fait: 'obligations-contrat', label: 'manquement possible aux obligations du contrat' }
  }
  return { fait: 'aucun', label: '' }
}

const detecterSituationDroits = (profils) => {
  if (profils.has('non_indemnise')) return { value: 'sans-droit', label: 'sans droit déclaré dans le portefeuille' }
  if (profils.has('are') || profils.has('ass') || profils.has('csp')) {
    return { value: 'droit-ouvert', label: 'allocation ou revenu de remplacement déclaré' }
  }
  if (profils.has('rsa') || profils.has('brsa_sans_orientation')) {
    return { value: 'a-confirmer', label: 'RSA détecté, composition du foyer et droits à confirmer' }
  }
  return { value: 'a-confirmer', label: 'situation de droits non renseignée' }
}

export const analyserControlesAutomatiquesDossier = ({ record = {}, dossier = {} } = {}) => {
  const profils = profilsDuDossier(record)
  const textePortefeuille = [
    record.alerte,
    record.motif,
    record.statut,
    record.decision,
    record.commentaires,
    record.historiqueAppels,
    record.historiqueMails,
    record.historiqueEntretiens,
    record.historiqueCourriers,
    record.actionRealisee,
    record.contratEngagement,
    record.prestation,
    record.atelier,
    record.formation,
  ].filter(Boolean).join(' ')
  const texteDossier = [
    dossier.demande,
    dossier.besoin,
    dossier.situationAdministrative,
    dossier.situationPersonnelle,
    dossier.parcoursProfessionnel,
    dossier.projet,
    dossier.formation,
    ...(Array.isArray(dossier.freins) ? dossier.freins : []),
    dossier.notes,
  ].filter(Boolean).join(' ')
  const texte = normaliserTexte(`${textePortefeuille} ${texteDossier}`)
  const faitExistant = dossier.suiviObligations?.fait && dossier.suiviObligations.fait !== 'aucun'
    ? { fait: dossier.suiviObligations.fait, label: 'fait déjà documenté dans le dossier' }
    : null
  const faitDetecte = faitExistant || detecterFaitObligations(texte)
  const situationDroits = dossier.suiviObligations?.situationDroits
    && dossier.suiviObligations.situationDroits !== 'a-confirmer'
    ? { value: dossier.suiviObligations.situationDroits, label: 'situation déjà documentée dans le dossier' }
    : detecterSituationDroits(profils)

  const indices = new Map()
  if (['mobilite', 'sante', 'logement', 'garde_enfants', 'parent_isole'].some((id) => profils.has(id))) {
    ajouterIndice(indices, 'contraintes-personnelles', 'Frein périphérique ou contrainte personnelle déclaré(e).')
  }
  if (profils.has('rqth')) ajouterIndice(indices, 'obligation-emploi', 'Situation de handicap ou RQTH déclarée.')
  if (profils.has('senior_50_plus') && (record.dateRetraitePrevisionnelle || Number(record.age) >= 58)) {
    ajouterIndice(indices, 'proche-retraite', 'Proximité possible de la retraite à mettre en contexte.')
  }
  if (profils.has('creation_entreprise') || /creation|reprise d entreprise|entrepreneur/.test(texte)) {
    ajouterIndice(indices, 'creation-entreprise', 'Projet ou activité de création/reprise repéré(e).')
  }
  if (/cv|profil de competences|carte de visite/.test(texte)) ajouterIndice(indices, 'profil-cv', 'CV ou profil de compétences mentionné.')
  if (/candidature|mise en relation|postul|recherche active/.test(texte)) ajouterIndice(indices, 'candidatures', 'Démarches de candidature mentionnées.')
  if (profils.has('numerique') || /numerique|pix|informatique/.test(texte)) {
    ajouterIndice(indices, 'autonomie-numerique', 'Autonomie numérique à vérifier.')
  }
  if (record.prestation || record.atelier || /prestation|atelier/.test(texte)) {
    ajouterIndice(indices, 'prestations', 'Atelier ou prestation présent(e) dans le dossier.')
  }
  if (record.formation || profils.has('formation') || /formation/.test(texte)) {
    ajouterIndice(indices, 'formations', 'Formation mentionnée dans le dossier.')
  }
  if (['reconversion', 'projet_a_confirmer', 'decouverte_metier'].some((id) => profils.has(id)) || /reconversion|projet professionnel/.test(texte)) {
    ajouterIndice(indices, 'projet-evolution', 'Projet d’évolution ou de reconversion repéré.')
  }
  if (record.telephone) ajouterIndice(indices, 'coordonnees', 'Coordonnée téléphonique présente dans le portefeuille.')
  if (record.dateInscription || record.ancienneteInscription) ajouterIndice(indices, 'duree-inscription', 'Ancienneté d’inscription disponible.')
  if (/contact|appel|mail|rendez vous|rdv|avertissement|absence/.test(texte)) {
    ajouterIndice(indices, 'contacts-conseiller', 'Contact, rendez-vous ou avertissement mentionné.')
  }
  if (/controle recherche|entretien cre|avertissement/.test(texte)) {
    ajouterIndice(indices, 'controle-precedent', 'Contrôle ou avertissement antérieur mentionné.')
  }
  if (/absence.{0,30}(entretien cre|rdv|rendez vous)/.test(texte)) {
    ajouterIndice(indices, 'presence-entretien-cre', 'Absence à un entretien ou rendez-vous mentionnée.')
  }
  if (/indisponible|indisponibilite/.test(texte)) ajouterIndice(indices, 'indisponibilite', 'Indisponibilité mentionnée.')
  if (record.actionRealisee) ajouterIndice(indices, 'actions-autonomes', 'Une action réalisée est renseignée.')

  const indicesDetails = [...indices.entries()].map(([id, motif]) => {
    const referentiel = INDICES_CRE.find((item) => item.id === id)
    return { id, motif, domaine: referentiel?.domaine || '', domaineLabel: referentiel?.domaineLabel || '', label: referentiel?.label || id }
  })
  const domaines = new Set(indicesDetails.map((item) => item.domaine).filter(Boolean))
  const contexteCreExplicite = /controle recherche|entretien cre|faisceau|avertissement|manquement|absence.{0,30}(rdv|rendez vous)/.test(texte)
  const faisceauAExaminer = contexteCreExplicite && indicesDetails.length >= 2 && domaines.size >= 2

  return {
    sourceTrouvee: Boolean(record.identifiant || texteDossier.trim()),
    obligations: {
      statut: faitDetecte.fait === 'aucun' ? 'ok' : 'a-verifier',
      faitSuggere: faitDetecte.fait,
      situationDroitsSuggeree: situationDroits.value,
      titre: faitDetecte.fait === 'aucun' ? 'Aucun signal M6 explicite détecté' : 'Signal M6 à vérifier',
      resume: faitDetecte.fait === 'aucun'
        ? `Contrôle effectué automatiquement. ${situationDroits.label}.`
        : `Le dossier mentionne un ${faitDetecte.label}. Aucune qualification ni sanction automatique.`,
    },
    cre: {
      statut: faisceauAExaminer ? 'a-verifier' : 'ok',
      indices: indicesDetails,
      domaines: domaines.size,
      faisceauAExaminer,
      titre: faisceauAExaminer ? 'Faisceau CRE potentiel à examiner' : 'Contrôle CRE automatique terminé',
      resume: indicesDetails.length === 0
        ? 'Aucun indice exploitable n’est repéré dans les données disponibles.'
        : `${indicesDetails.length} point(s) de contexte repéré(s) dans ${domaines.size} domaine(s). ${faisceauAExaminer ? 'Le conseiller doit confirmer les faits et les preuves.' : 'Ces éléments ne suffisent pas à ouvrir un faisceau CRE.'}`,
    },
    nePasConvoquer: String(dossier.codeSituationOp2 || record.codeSituationOp2 || '').trim().toUpperCase() === 'IA',
  }
}

export default analyserControlesAutomatiquesDossier
