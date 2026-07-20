import {
  ateliersCorse,
  prestationsCorse,
  portefeuillesCorse,
  partenairesCorse,
} from '../data/configurationCorse'
import { questionsConseiller } from '../knowledge/questionsConseiller'
import { partenaires as basePartenaires } from '../knowledge/partenaires'

const missionPushUnique = (list, value) => {
  if (value && !list.includes(value)) {
    list.push(value)
  }
}

const missionPushAlerte = (alertes, niveau, message, recommandation) => {
  if (!alertes.some((item) => item.message === message)) {
    alertes.push({ niveau, message, recommandation })
  }
}

const missionNormalize = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const missionIncludesAny = (text, terms) => {
  const normalized = missionNormalize(text)
  return terms.some((term) => normalized.includes(missionNormalize(term)))
}

const isMissionPayload = (value = {}) => {
  const source = value && typeof value === 'object' ? value : {}
  return (
    Object.prototype.hasOwnProperty.call(source, 'mission') ||
    Object.prototype.hasOwnProperty.call(source, 'situation') ||
    Object.prototype.hasOwnProperty.call(source, 'creationEntreprise') ||
    Object.prototype.hasOwnProperty.call(source, 'logement') ||
    Object.prototype.hasOwnProperty.call(source, 'numerique') ||
    Object.prototype.hasOwnProperty.call(source, 'iae')
  )
}

const analyserSituationMission = (donnees = {}) => {
  const {
    mission = '',
    situation = '',
    age = null,
    rsa = false,
    rqth = false,
    projet = '',
    mobilite = true,
    logement = true,
    sante = true,
    numerique = true,
    creationEntreprise = false,
    jeune = false,
    iae = false,
    rechercheEmploi = '',
    financeurFormation = '',
    formationFinanceur = '',
    demandeAffectation = false,
    affectationJustification = '',
    justificationAffectation = '',
    restrictionMedicale = false,
    solutionMobilite = '',
    orientationSante = '',
  } = donnees

  const textContext = `${mission} ${situation} ${projet} ${rechercheEmploi}`
  const projetTexte = String(projet || '').trim()
  const justificationTexte = String(affectationJustification || justificationAffectation || '').trim()
  const financeurTexte = String(formationFinanceur || financeurFormation || '').trim()
  const solutionMobiliteTexte = String(solutionMobilite || '').trim()
  const orientationSanteTexte = String(orientationSante || '').trim()

  const signalRSA = rsa || missionIncludesAny(textContext, ['rsa'])
  const signalRQTH = rqth || missionIncludesAny(textContext, ['rqth', 'handicap'])
  const signalFormation = missionIncludesAny(textContext, ['formation', 'afpa', 'prepa competences'])
  const signalCreationEntreprise =
    creationEntreprise || missionIncludesAny(textContext, ["creation d'entreprise", 'creation entreprise'])
  const signalMobilite = !mobilite || missionIncludesAny(textContext, ['mobilite', 'deplacement'])
  const signalLogement = !logement || missionIncludesAny(textContext, ['logement'])
  const signalSante = !sante || missionIncludesAny(textContext, ['sante'])
  const signalNumerique = !numerique || missionIncludesAny(textContext, ['numerique'])
  const signalIAE = iae || missionIncludesAny(textContext, ['iae', 'siae', 'insertion'])
  const signalJeune = jeune || (typeof age === 'number' && age < 26) || missionIncludesAny(textContext, ['jeune', 'cej'])
  const signalDemandeAffectation = demandeAffectation || missionIncludesAny(textContext, ['demande affectation', 'affectation'])
  const signalRestrictionMedicale = restrictionMedicale || missionIncludesAny(textContext, ['restriction medicale'])
  const signalRechercheEmploi =
    missionIncludesAny(String(rechercheEmploi), ['active', 'recherche', 'oui']) ||
    missionIncludesAny(textContext, ['recherche emploi', 'candidature'])

  const projetDefini =
    projetTexte.length >= 4 &&
    !missionIncludesAny(projetTexte, ['non defini', 'pas de projet', 'aucun projet', 'a definir', 'a preciser'])
  const niveauRenseigne = missionIncludesAny(textContext, ['niveau', 'bac', 'diplome', 'qualification', 'competence'])
  const disponibiliteRenseignee = missionIncludesAny(textContext, ['disponible', 'disponibilite'])
  const prerequisRenseignes = missionIncludesAny(textContext, ['prerequis', 'pre requis'])
  const statutCreationRenseigne = missionIncludesAny(textContext, [
    'statut',
    'micro-entreprise',
    'auto entrepreneur',
    'sasu',
    'eurl',
  ])
  const contratEngagementSigne = missionIncludesAny(textContext, ['contrat engagement signe', "contrat d'engagement", 'contrat signe'])
  const criteresIAERenseignes = missionIncludesAny(textContext, ['criteres iae', 'eligibilite iae'])

  const situationAdministrative = []
  const vigilances = []
  const prestations = []
  const ateliers = []
  const partenaires = []
  const questions = []
  const actions = []
  const alertesMetier = []
  const checklistItems = []

  const pushChecklist = (bloc, label, checked) => {
    checklistItems.push({ bloc, label, checked: Boolean(checked) })
  }

  let portefeuille = 'portefeuille mutualise'

  if (mission) missionPushUnique(situationAdministrative, `Mission: ${mission}`)
  if (situation) missionPushUnique(situationAdministrative, `Situation: ${situation}`)
  if (typeof age === 'number') missionPushUnique(situationAdministrative, `Age: ${age} ans`)

  if (signalRSA) {
    missionPushUnique(situationAdministrative, 'RSA')
    missionPushUnique(prestations, 'Accompagnement global')
    missionPushUnique(partenaires, basePartenaires.rsa?.[0]?.nom || 'Collectivité de Corse - Service insertion')
    missionPushUnique(vigilances, "Suivi RSA: verifier le contrat d'engagement et les obligations d'activite.")
    questions.push(...(questionsConseiller.rsa || []))
    portefeuille = 'portefeuille accompagnement global'
  }

  if (signalRQTH) {
    missionPushUnique(situationAdministrative, 'RQTH / Handicap')
    missionPushUnique(partenaires, basePartenaires.handicap?.[0]?.nom || 'Cap Emploi A Murza')
    missionPushUnique(prestations, 'Emploi accompagné')
    missionPushUnique(vigilances, 'Handicap: securiser les adaptations necessaires du parcours.')
    questions.push(...(questionsConseiller.rqth || []))
    portefeuille = 'portefeuille specialise handicap'
  }

  if (signalFormation) {
    missionPushUnique(partenaires, basePartenaires.formation?.[0]?.nom || 'AFPA Ajaccio')
    missionPushUnique(prestations, 'Prépa Compétences')
    missionPushUnique(vigilances, 'Formation: verifier prerequis, financement et debouches.')
    questions.push(...(questionsConseiller.formation || []))

    pushChecklist('formation', 'Vérifier le projet professionnel', projetDefini)
    pushChecklist('formation', 'Vérifier le niveau', niveauRenseigne)
    pushChecklist('formation', 'Vérifier le financement', financeurTexte.length > 0)
    pushChecklist('formation', 'Vérifier la disponibilité', disponibiliteRenseignee)
    pushChecklist('formation', 'Vérifier les prérequis', prerequisRenseignes)
  }

  if (signalCreationEntreprise) {
    ;(basePartenaires.creation || []).forEach((item) => missionPushUnique(partenaires, item.nom))
    missionPushUnique(prestations, "Activ'Créa")
    missionPushUnique(vigilances, 'Creation: verifier maturite du projet et besoins de financement.')
    questions.push(...(questionsConseiller.entreprise || []))
    portefeuille = 'portefeuille creation entreprise'

    pushChecklist(
      'creationEntreprise',
      'Vérifier la maturité du projet',
      projetDefini || missionIncludesAny(textContext, ['maturite', 'business plan', 'etude de faisabilite']),
    )
    pushChecklist(
      'creationEntreprise',
      'Vérifier le financement',
      financeurTexte.length > 0 || missionIncludesAny(textContext, ['financement', 'microcredit']),
    )
    pushChecklist('creationEntreprise', 'Vérifier le statut', statutCreationRenseigne)
    pushChecklist('creationEntreprise', "Vérifier l'accompagnement BGE", partenaires.includes('BGE Corse'))
  }

  if (signalIAE) {
    missionPushUnique(prestations, 'PASS IAE')
    ;(basePartenaires.iae || []).forEach((item) => missionPushUnique(partenaires, item.nom))
    missionPushUnique(vigilances, 'IAE: valider disponibilite et pre-requis d orientation SIAE.')
    if (portefeuille === 'portefeuille mutualise') {
      portefeuille = 'portefeuille IAE'
    }

    const structureIAEProposee = (basePartenaires.iae || []).some((item) => partenaires.includes(item.nom))
    pushChecklist('iae', 'Critères IAE vérifiés', criteresIAERenseignes)
    pushChecklist('iae', 'PASS IAE', prestations.includes('PASS IAE'))
    pushChecklist('iae', 'Structure adaptée', structureIAEProposee)
  }

  if (signalJeune || (typeof age === 'number' && age >= 16 && age <= 25)) {
    missionPushUnique(situationAdministrative, 'Jeune 16-25 ans')
    missionPushUnique(partenaires, basePartenaires.jeunes?.[0]?.nom || "Mission Locale d'Ajaccio")
    missionPushUnique(prestations, 'CEJ')
    if (portefeuille === 'portefeuille mutualise') {
      portefeuille = 'portefeuille jeunes'
    }

    pushChecklist('jeune', 'CEJ étudié', prestations.includes('CEJ') || missionIncludesAny(textContext, ['cej']))
    pushChecklist('jeune', 'Mission Locale', partenaires.includes("Mission Locale d'Ajaccio"))
    pushChecklist('jeune', 'Projet validé', projetDefini)
  }

  if (signalRSA) {
    const freinsIdentifies = signalMobilite || signalLogement || signalSante || signalNumerique
    const orientationAdaptee =
      portefeuille !== 'portefeuille mutualise' || partenaires.includes('Collectivité de Corse - Service insertion')
    pushChecklist('rsa', "Contrat d'engagement signé", contratEngagementSigne)
    pushChecklist('rsa', 'Orientation adaptée', orientationAdaptee)
    pushChecklist('rsa', 'Freins identifiés', freinsIdentifies)
  }

  if (signalRQTH) {
    pushChecklist('rqth', 'Notification RQTH', signalRQTH)
    pushChecklist('rqth', 'Restrictions médicales', signalRestrictionMedicale)
    pushChecklist('rqth', 'Besoin Cap Emploi', partenaires.includes('Cap Emploi A Murza'))
  }

  if (signalMobilite) {
    missionPushUnique(vigilances, 'Mobilite: freins de deplacement a traiter prioritairement.')
    missionPushUnique(prestations, 'Aides à la mobilité')
    questions.push(...(questionsConseiller.mobilite || []))
  }

  if (signalLogement) {
    missionPushUnique(vigilances, 'Logement: risque de rupture de parcours a anticiper.')
    questions.push(...(questionsConseiller.logement || []))
  }

  if (signalSante) {
    missionPushUnique(vigilances, 'Sante: verifier compatibilite du parcours avec les contraintes medicales.')
    missionPushUnique(prestations, 'Parcours Emploi Santé')
  }

  if (signalNumerique) {
    missionPushUnique(ateliers, 'Atelier compétences numériques')
    missionPushUnique(vigilances, 'Numerique: prevoir un appui aux demarches en ligne.')
  }

  if (signalRechercheEmploi) {
    missionPushUnique(ateliers, 'Atelier CV')
    missionPushUnique(ateliers, 'Atelier Entretien')
    missionPushUnique(ateliers, "Techniques de recherche d'emploi")
  }

  missionPushUnique(partenaires, basePartenaires.orientation?.[0]?.nom || 'Corsica Orientazione')

  if (signalFormation && !projetDefini) {
    missionPushAlerte(
      alertesMetier,
      'vigilance',
      'Formation demandée mais aucun projet professionnel défini.',
      'Clarifier le projet et formaliser un objectif professionnel avant prescription formation.',
    )
  }

  if (partenaires.includes('AFPA Ajaccio') && !signalFormation) {
    missionPushAlerte(
      alertesMetier,
      'vigilance',
      'Prescription AFPA sans besoin de formation identifié.',
      'Valider le besoin de formation et les prérequis avant orientation AFPA.',
    )
  }

  if (prestations.includes('PASS IAE') && !signalIAE) {
    missionPushAlerte(
      alertesMetier,
      'bloquant',
      'PASS IAE proposé sans critères IAE.',
      'Vérifier les critères IAE (freins, parcours insertion, éligibilité) avant proposition.',
    )
  }

  if (partenaires.includes('Cap Emploi A Murza') && !signalRQTH && !signalRestrictionMedicale) {
    missionPushAlerte(
      alertesMetier,
      'bloquant',
      'Cap Emploi proposé sans RQTH ni restriction médicale.',
      'Confirmer la RQTH ou un justificatif de restriction médicale avant orientation.',
    )
  }

  if (partenaires.includes("Mission Locale d'Ajaccio") && typeof age === 'number' && age > 25) {
    missionPushAlerte(
      alertesMetier,
      'vigilance',
      'Mission Locale proposée avec un âge supérieur à 25 ans.',
      'Vérifier l éligibilité d âge et envisager un partenaire alternatif.',
    )
  }

  if (signalCreationEntreprise && !projetDefini) {
    missionPushAlerte(
      alertesMetier,
      'vigilance',
      "Création d'entreprise sans projet décrit.",
      'Demander une description du projet, du marché visé et des besoins de financement.',
    )
  }

  if (signalDemandeAffectation && !justificationTexte) {
    missionPushAlerte(
      alertesMetier,
      'bloquant',
      "Demande d'affectation sans justification.",
      'Renseigner un motif documenté et la justification avant validation de la demande.',
    )
  }

  if (signalFormation && !financeurTexte) {
    missionPushAlerte(
      alertesMetier,
      'vigilance',
      'Formation sans financeur identifié.',
      'Identifier le financeur principal et les alternatives avant prescription.',
    )
  }

  if (signalMobilite && !solutionMobiliteTexte) {
    missionPushAlerte(
      alertesMetier,
      'information',
      'Mobilité cochée sans solution proposée.',
      'Proposer une solution mobilité concrète (aide, transport, permis, accompagnement).',
    )
  }

  const orientationSanteAdaptee =
    orientationSanteTexte.length > 0 ||
    prestations.includes('Parcours Emploi Santé') ||
    partenaires.includes('Cap Emploi A Murza')

  if (signalSante && !orientationSanteAdaptee) {
    missionPushAlerte(
      alertesMetier,
      'vigilance',
      'Santé cochée sans orientation adaptée.',
      'Ajouter une orientation santé ou un partenaire adapté au besoin de santé.',
    )
  }

  if (alertesMetier.length > 0) {
    alertesMetier.forEach((alerte) => {
      missionPushUnique(vigilances, `[${alerte.niveau}] ${alerte.message}`)
    })
  }

  if (questions.length === 0) {
    missionPushUnique(questions, 'Quelles informations manquent pour confirmer la recommandation ?')
  }

  const checklistDone = checklistItems.filter((item) => item.checked).length
  const checklistTotal = checklistItems.length
  const checklistCompletionPercent = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0
  const checklistConseiller = {
    completionPercent: checklistCompletionPercent,
    done: checklistDone,
    total: checklistTotal,
    items: checklistItems,
    blocs: {
      formation: checklistItems.filter((item) => item.bloc === 'formation'),
      creationEntreprise: checklistItems.filter((item) => item.bloc === 'creationEntreprise'),
      rsa: checklistItems.filter((item) => item.bloc === 'rsa'),
      rqth: checklistItems.filter((item) => item.bloc === 'rqth'),
      iae: checklistItems.filter((item) => item.bloc === 'iae'),
      jeune: checklistItems.filter((item) => item.bloc === 'jeune'),
    },
  }

  missionPushUnique(actions, `Orienter vers ${portefeuille}.`)
  if (prestations.length > 0) {
    missionPushUnique(actions, `Prescriptions priorisees: ${prestations.join(' | ')}.`)
  }
  if (partenaires.length > 0) {
    missionPushUnique(actions, `Partenaires a mobiliser: ${partenaires.join(' | ')}.`)
  }
  if (ateliers.length > 0) {
    missionPushUnique(actions, `Ateliers recommandes: ${ateliers.join(' | ')}.`)
  }
  if (checklistTotal > 0) {
    missionPushUnique(actions, `Complétude dossier : ${checklistCompletionPercent} % (${checklistDone}/${checklistTotal}).`)
  }

  const syntheseMAP = [
    `Orientation portefeuille: ${portefeuille}.`,
    `Prestations conseillees: ${prestations.join(' | ') || 'Aucune'}.`,
    `Ateliers conseilles: ${ateliers.join(' | ') || 'Aucun'}.`,
    `Partenaires conseilles: ${partenaires.join(' | ') || 'Aucun'}.`,
    `Vigilances: ${vigilances.join(' | ') || 'Aucune'}.`,
    `Questions a poser: ${questions.join(' | ') || 'Aucune'}.`,
    `Checklist conseiller: ${checklistTotal > 0 ? `${checklistDone}/${checklistTotal} (${checklistCompletionPercent} %)` : 'Aucune'}.`,
    `Alertes metier: ${
      alertesMetier.length > 0
        ? alertesMetier.map((item) => `${item.niveau} - ${item.message}`).join(' | ')
        : 'Aucune'
    }.`,
  ].join(' ')

  return {
    situationAdministrative,
    prestations,
    ateliers,
    partenaires,
    vigilances,
    questions,
    portefeuille,
    portefeuilleOrientation: portefeuille,
    actions,
    planAction: actions,
    checklistConseiller,
    alertesMetier,
    synthese: syntheseMAP,
    syntheseMAP,
  }
}

const resolveFromConfig = (collection, expectedValue, fallbackIndex = 0) => {
  const found = collection.find((item) => item === expectedValue)
  if (found) return found
  return collection[fallbackIndex] || null
}

const isOui = (value) => value === true || value === 'Oui' || value === 'oui'
const isNon = (value) => value === false || value === 'Non' || value === 'non'

const pushUniqueRecommandation = (collection, nom, pourquoi) => {
  if (!nom) return
  if (!collection.some((item) => item.nom === nom)) {
    collection.push({ nom, pourquoi })
  }
}

const pushUniqueTexte = (collection, texte) => {
  if (!collection.includes(texte)) {
    collection.push(texte)
  }
}

const analyserSituationDossier = (situation) => {
  const freins = Array.isArray(situation.freins) ? situation.freins : []
  const freinsPriorises = calculerPrioriteFreins(freins)
const freinBloquant = freinBloquantFormation(freins)
const ordreFreins = freinsPriorises.map((f) => f.nom)
  let score = 0
  let priorite = 'Normale'

  const alertes = []
  const verifications = []
  const questions = []
  const creu = []
  const actions = []
  const ateliers = []
  const prestations = []
  const partenaires = []

  const portefeuilleTH = resolveFromConfig(portefeuillesCorse, 'TH', 0)
  const portefeuilleGLO = resolveFromConfig(portefeuillesCorse, 'GLO', 0)
  const portefeuilleCEJ = resolveFromConfig(portefeuillesCorse, 'CEJ', 0)
  const portefeuilleDefaut = portefeuillesCorse[0] || ''

  const atelierCreationCV = resolveFromConfig(ateliersCorse, 'Création CV', 0)
  const atelierBonnesPratiquesCV = resolveFromConfig(ateliersCorse, 'Les bonnes pratiques CV', 0)
  const atelierFocusCompetences = resolveFromConfig(ateliersCorse, 'Focus Compétences', 0)
  const atelier360Seniors = resolveFromConfig(ateliersCorse, 'Atelier 360 Seniors', 0)
  const atelierPIX = resolveFromConfig(ateliersCorse, 'PIX Emploi', 0)
  const atelierLundis = resolveFromConfig(ateliersCorse, "Les Lundis de l'entrepreneuriat", 0)

  const prestationActivProjet = resolveFromConfig(prestationsCorse, "Activ'Projet", 0)
  const prestationActivCrea = resolveFromConfig(prestationsCorse, "Activ'Créa", 0)
  const prestationCEJ = resolveFromConfig(prestationsCorse, 'CEJ', 0)

  const partenaireADIE = resolveFromConfig(partenairesCorse, 'ADIE', 0)
  const partenaireCiteLab = resolveFromConfig(partenairesCorse, 'CitéLab', 1)

  const projetTexte = String(situation.projetProfessionnel || situation.projet || '').trim()
  const projetMin = projetTexte.toLowerCase()
  const difficulteNumerique =
    isOui(situation.difficulteNumerique) ||
    isOui(situation.difficulte_numérique) ||
    freins.includes('Numérique')

  const recherche = String(situation.rechercheEmploi || situation.recherche_emploi || '').toLowerCase()

  let portefeuilleConseille = portefeuilleDefaut

  if (!isOui(situation.dpaRealisee)) {
    score += 30
    priorite = 'Haute'
    pushUniqueRecommandation(actions, 'Réaliser une DPA', 'La DPA est nécessaire pour structurer le parcours et prioriser les actions.')
  }

  if (isOui(situation.rsa) && (isNon(situation.premierEntretienRealise) || !isOui(situation.premierEntretienRealise))) {
    score += 25
    pushUniqueTexte(alertes, 'Situation RSA sans premier entretien réalisé.')
  }

  if (!isOui(situation.cvVisible)) {
    pushUniqueRecommandation(
      ateliers,
      atelierCreationCV,
      'Le CV n\'est pas visible : cet atelier aide a produire rapidement un CV exploitable.'
    )
    pushUniqueRecommandation(
      ateliers,
      atelierBonnesPratiquesCV,
      'Le CV n\'est pas visible : cet atelier améliore la qualité et l\'efficacité du CV.'
    )
  }

  if (recherche === 'faible' || recherche === 'absente') {
    pushUniqueTexte(verifications, 'Contrôle de la recherche d\'emploi')
    pushUniqueTexte(verifications, 'Vérifier les démarches réalisées')
    pushUniqueTexte(verifications, 'Vérifier les candidatures')
    pushUniqueTexte(verifications, 'Vérifier les actions du contrat d\'engagement')
    pushUniqueTexte(verifications, 'Vérifier un éventuel manquement')
    pushUniqueTexte(creu, 'Vérifier les démarches réalisées')
    pushUniqueTexte(creu, 'Vérifier les candidatures')
    pushUniqueTexte(creu, 'Vérifier les actions du contrat d\'engagement')
    pushUniqueTexte(creu, 'Vérifier un éventuel manquement')
  }

  if (!projetTexte) {
    pushUniqueRecommandation(
      ateliers,
      atelierFocusCompetences,
      'Le projet professionnel est vide : cet atelier aide a clarifier les compétences et les pistes métier.'
    )
    pushUniqueRecommandation(
      prestations,
      prestationActivProjet,
      'Le projet professionnel est vide : cette prestation accompagne la construction d\'un projet réaliste.'
    )
  }

  if (isOui(situation.reconnaissanceTH) || isOui(situation.rqth)) {
    portefeuilleConseille = portefeuilleTH || portefeuilleConseille
    pushUniqueRecommandation(
      actions,
      `Orienter vers le portefeuille ${portefeuilleConseille}`,
      'La reconnaissance TH justifie un accompagnement spécialisé.'
    )
  }

  if (Number(situation.nombreFreins || 0) >= 2) {
    portefeuilleConseille = portefeuilleGLO || portefeuilleConseille
    pushUniqueRecommandation(
      actions,
      `Étudier le portefeuille ${portefeuilleConseille}`,
      'Un cumul de freins justifie un accompagnement global renforcé.'
    )
  }

  if (Number(situation.age) < 26) {
    portefeuilleConseille = portefeuilleCEJ || portefeuilleConseille
    pushUniqueRecommandation(
      prestations,
      prestationCEJ,
      'L\'âge inférieur a 26 ans rend pertinente une orientation vers le CEJ.'
    )
  }

  if (Number(situation.age) >= 50) {
    pushUniqueRecommandation(
      ateliers,
      atelier360Seniors,
      'L\'âge supérieur ou égal a 50 ans justifie un appui spécifique de repositionnement.'
    )
  }

  if (difficulteNumerique) {
    pushUniqueRecommandation(
      ateliers,
      atelierPIX,
      'Une difficulté numérique est identifiée : cet atelier renforce l\'autonomie pour les démarches en ligne.'
    )
  }

  if (
    projetMin.includes('création entreprise') ||
    projetMin.includes('creation entreprise') ||
    projetMin.includes('entrepreneuriat')
  ) {
    pushUniqueRecommandation(
      prestations,
      prestationActivCrea,
      'Le projet vise la création d\'entreprise : cette prestation cadre les étapes de faisabilité.'
    )
    pushUniqueRecommandation(
      ateliers,
      atelierLundis,
      'Le projet vise la création d\'entreprise : cet atelier aide a structurer la démarche entrepreneuriale.'
    )
    pushUniqueRecommandation(
      partenaires,
      partenaireADIE,
      'Partenaire recommandé pour l\'accompagnement et le financement de projet entrepreneurial.'
    )
    pushUniqueRecommandation(
      partenaires,
      partenaireCiteLab,
      'Partenaire recommandé pour le passage de l\'idée au projet et l\'ancrage local.'
    )
  }

  if (priorite !== 'Haute') {
    priorite = score >= 25 ? 'Moyenne' : 'Normale'
  }

  pushUniqueTexte(questions, 'Quels sont les objectifs prioritaires pour les 4 prochaines semaines ?')
  pushUniqueTexte(questions, 'Quels freins bloquent actuellement les démarches prévues ?')

  const resumeRecommandations = [
    ...actions.map((item) => `Action: ${item.nom} (${item.pourquoi})`),
    ...ateliers.map((item) => `Atelier: ${item.nom} (${item.pourquoi})`),
    ...prestations.map((item) => `Prestation: ${item.nom} (${item.pourquoi})`),
    ...partenaires.map((item) => `Partenaire: ${item.nom} (${item.pourquoi})`),
  ]

  const pourquoi =
    resumeRecommandations.length > 0
      ? resumeRecommandations.join(' | ')
      : 'Aucun élément prioritaire ne justifie une action immédiate.'

  const synthese = [
    `Analyse métier: score ${score}, priorité ${priorite}.`,
    `Portefeuille conseillé: ${portefeuilleConseille || 'non déterminé'}.`,
    resumeRecommandations.length > 0
      ? `Recommandations motivées: ${resumeRecommandations.join(' | ')}`
      : 'Aucune recommandation prioritaire identifiée a ce stade.',
    'Le conseiller reste le seul décideur final.',
  ].join(' ')

if (freinBloquant) {
  alertes.push(
    `Frein prioritaire identifié : ${freinBloquant.nom}. Stabiliser cette situation avant une entrée en formation.`
  )

  verifications.push(
    `Traiter en priorité le frein "${freinBloquant.nom}" avant toute prescription de formation.`
  )
}
if (ordreFreins.length > 0) {
  actions.unshift({
    nom: "Traiter les freins prioritaires",
    pourquoi: `Ordre recommandé : ${ordreFreins.join(" → ")}.`
  })
}
return {
  score,
  priorite,
  pourquoi,
  freinsPriorises,
  alertes,
  verifications,
  questions,
  creu,
  actions,
  ateliers,
  prestations,
  partenaires,
  portefeuilleConseille,
  synthese,
}
}
export function analyserSituation(situation) {
  if (isMissionPayload(situation)) {
    return analyserSituationMission(situation)
  }

  return analyserSituationDossier(situation)
}

export function analyserDemandeur(demandeur) {
  return analyserSituationDossier(demandeur)
}
