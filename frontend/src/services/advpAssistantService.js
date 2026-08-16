const PHASES = ['Explorer', 'Cristalliser', 'Specifier', 'Realiser']

const normaliser = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')

const unique = (items) => Array.from(new Set(items.filter(Boolean)))

const contient = (texte, expression) => expression.test(texte)

const PHASE_CONTENT = {
  Explorer: {
    objectif: 'Faire émerger des envies, des compétences et plusieurs directions possibles.',
    questions: [
      'Quelles activités ou missions donnent le plus envie à la personne ?',
      'Quelles compétences, expériences ou réussites aimerait-elle réutiliser ?',
      'Quelles contraintes sont non négociables pour le futur projet ?',
    ],
    pistes: [
      'Faire émerger deux ou trois familles de métiers, sans chercher à décider trop vite.',
      'Relier les expériences passées aux compétences transférables et aux centres d’intérêt.',
      'Confronter les premières idées aux réalités du marché du travail local.',
    ],
    services: [
      ["Activ'Projet", 'Structurer une exploration quand le projet reste imprécis.'],
      ['Détection de Potentiel', 'Découvrir des secteurs et des aptitudes autrement que par le seul CV.'],
      ['Focus Compétences', 'Faire ressortir les compétences utiles pour ouvrir des pistes.'],
      ['Mon Marché du Travail', 'Découvrir les secteurs et entreprises qui recrutent localement.'],
    ],
  },
  Cristalliser: {
    objectif: 'Comparer les pistes et faire apparaître une préférence argumentée.',
    questions: [
      'Parmi les pistes évoquées, lesquelles attirent le plus et pourquoi ?',
      'Quels critères permettront de comparer ces pistes : tâches, horaires, salaire, mobilité ou formation ?',
      'Quelles informations manquent encore pour écarter ou retenir chaque piste ?',
    ],
    pistes: [
      'Comparer au maximum trois pistes à partir de critères concrets.',
      'Identifier une piste principale et une solution de repli réaliste.',
      'Rechercher une preuve terrain avant de conclure : rencontre, enquête métier ou immersion.',
    ],
    services: [
      ['Faire le point sur mes compétences', 'Comparer les pistes avec les acquis réels de la personne.'],
      ['Mon Marché du Travail', 'Vérifier les débouchés et les conditions d’exercice.'],
      ['Immersion professionnelle', 'Observer un métier en situation réelle avant de le retenir.'],
      ['Initier sa transition professionnelle', 'Sécuriser une piste de reconversion ou de transition.'],
    ],
  },
  Specifier: {
    objectif: 'Valider la faisabilité du projet choisi et préciser le chemin pour y parvenir.',
    questions: [
      'Quel métier ou objectif précis la personne vise-t-elle maintenant ?',
      'Quels prérequis, compétences ou conditions d’accès restent à vérifier ?',
      'Quelle expérience terrain permettrait de confirmer définitivement le choix ?',
    ],
    pistes: [
      'Vérifier l’écart entre les compétences actuelles et les prérequis du projet.',
      'Tester la faisabilité : santé, mobilité, horaires, garde, financement et disponibilité.',
      'Décider d’une étape de validation courte avant une formation ou un engagement long.',
    ],
    services: [
      ['Immersion professionnelle', 'Confirmer le métier et ses conditions réelles d’exercice.'],
      ['Prépa Compétences', 'Préparer un parcours de formation et vérifier les prérequis.'],
      ['Formation et financements', 'Sécuriser les modalités et le financement d’une formation.'],
      ['Regards croisés', 'Approfondir une situation professionnelle complexe avec un psychologue du travail.'],
    ],
  },
  Realiser: {
    objectif: 'Passer à l’action avec des étapes datées, réalistes et vérifiables.',
    questions: [
      'Quelle est la toute prochaine action concrète et à quelle date sera-t-elle faite ?',
      'Les outils de candidature sont-ils adaptés au métier et aux offres visées ?',
      'Quel suivi permettra de vérifier les résultats et d’ajuster la stratégie ?',
    ],
    pistes: [
      'Définir une première action réalisable dans les sept prochains jours.',
      'Adapter le CV, les candidatures et la préparation d’entretien à la cible retenue.',
      'Fixer un indicateur de suivi : candidatures, contacts, entretiens ou démarches réalisées.',
    ],
    services: [
      ['Organiser et optimiser ma recherche d’emploi', 'Planifier et suivre une recherche d’emploi ciblée.'],
      ['Faire le point sur mes compétences professionnelles et concevoir un CV percutant', 'Adapter le CV aux compétences et au métier visé.'],
      ['Valoriser son image professionnelle', 'Préparer la présentation et les échanges avec les recruteurs.'],
      ['Un emploi stable', 'Renforcer une démarche active de retour durable à l’emploi.'],
    ],
  },
}

/**
 * Copilote ADVP déterministe et explicable.
 * Les supports internes reçus servent de repères de vigilance et de catalogue ; ils ne
 * déclenchent ni orientation, ni code OP2, ni règle juridique de façon automatique.
 */
export const analyserAdvpAutomatique = (input = {}) => {
  const texteBrut = [
    input.demande,
    input.besoin,
    input.situationAdministrative,
    input.situationPersonnelle,
    input.parcoursProfessionnel,
    input.projet,
    input.formation,
    input.reponsesGuidees,
    ...(input.freins || []),
    ...(input.ressources || []),
  ].filter(Boolean).join(' ')
  const texte = normaliser(texteBrut)
  const contexteSuffisant = texte.trim().length >= 12
  const scores = { Explorer: 1, Cristalliser: 0, Specifier: 0, Realiser: 0 }
  const indices = []

  const ajouter = (phase, points, motif) => {
    scores[phase] += points
    if (motif) indices.push({ phase, motif })
  }

  if (contient(texte, /sans projet|projet (?:a|à) (?:definir|préciser)|projet flou|ne sait (?:pas|plus)|hesit|decouvrir.*metier|premiere recherche|reconversion|transition professionnelle/)) {
    ajouter('Explorer', 5, 'Le projet reste à découvrir ou à clarifier.')
  }
  if (contient(texte, /plusieurs pistes|plusieurs metiers|choisir|comparer|preference|competences transferables|idee de metier|pistes? professionnelles?/)) {
    ajouter('Cristalliser', 4, 'Plusieurs pistes ou critères de choix apparaissent.')
  }
  if (contient(texte, /projet professionnel defini|metier (?:cible|vise)|confirmer.*projet|valider.*projet|immersion|pmsmp|prerequis|faisabilite|projet de formation|formation envisagee/)) {
    ajouter('Specifier', 4, 'Une cible apparaît et doit être validée concrètement.')
  }
  if (contient(texte, /recherche active|candidature|postuler|entretien d.embauche|offres? d.emploi|cv|retour (?:a|à) l.emploi|emploi durable|emploi stable/)) {
    ajouter('Realiser', 4, 'La personne est déjà dans une logique de mise en action.')
  }
  if (contient(texte, /creation d.entreprise|creer (?:une|son) entreprise|reprendre (?:une|son) entreprise|entrepreneuriat/)) {
    ajouter('Specifier', 3, 'Le projet entrepreneurial doit être structuré et testé.')
  }
  if (normaliser(input.projet).trim().length >= 8) ajouter('Specifier', 2, 'Un projet a été formulé dans le dossier.')
  if (contient(texte, /projet professionnel (?:a|à) preciser/)) ajouter('Explorer', 5, 'Le parcours indique explicitement un projet à préciser.')

  // Une incertitude explicite prime sur les mots « emploi », « CV » ou « formation » qui
  // peuvent être présents dans le récit sans signifier que la personne est prête à agir.
  const incertitudeForte = contient(texte, /sans projet|projet (?:a|à) (?:definir|preciser)|projet flou|ne sait (?:pas|plus)|hesit/)
  const phase = incertitudeForte
    ? 'Explorer'
    : PHASES.reduce((best, candidate) => (scores[candidate] > scores[best] ? candidate : best), 'Explorer')
  const content = PHASE_CONTENT[phase]
  const meilleurScore = scores[phase]
  const confiance = !contexteSuffisant ? 'À compléter' : meilleurScore >= 6 ? 'Élevée' : meilleurScore >= 4 ? 'Moyenne' : 'Prudente'
  const raison = indices.find((item) => item.phase === phase)?.motif
    || (contexteSuffisant
      ? 'Les éléments saisis ne montrent pas encore une étape plus avancée du projet.'
      : 'Saisissez la demande et quelques éléments du parcours pour obtenir une analyse ciblée.')

  const questions = [...content.questions]
  const pistes = [...content.pistes]
  const services = content.services.map(([nom, motif]) => ({ nom, motif }))
  const vigilances = []
  const rappels = []

  if (contient(texte, /rqth|handicap|sante|restriction/)) {
    questions.unshift('Quelles restrictions, compensations ou conditions de travail doivent être prises en compte ?')
    vigilances.push('Santé / handicap : vérifier les restrictions, les aménagements utiles et l’appui de Cap emploi avant de valider la piste.')
  }
  if (contient(texte, /mobilite|sans permis|transport|sans vehicule/)) {
    questions.push('La mobilité permet-elle réellement d’accéder au métier, à la formation ou aux horaires envisagés ?')
    vigilances.push('Mobilité : vérifier le trajet, les horaires, le coût et la solution de secours.')
  }
  if (contient(texte, /garde d.enfant|enfant|creche/)) {
    questions.push('La solution de garde est-elle compatible avec les horaires et la date de démarrage ?')
    vigilances.push('Garde : sécuriser une solution concrète avant toute action contraignante.')
  }
  if (contient(texte, /formation|reconversion/)) {
    questions.push('Le métier cible est-il confirmé avant d’engager la recherche ou le financement d’une formation ?')
    rappels.push('Formation : vérifier métier cible, prérequis, financement, mobilité et calendrier avant prescription.')
  }
  if (contient(texte, /creation d.entreprise|entrepreneuriat|creer.*entreprise/)) {
    services.unshift({ nom: "M'imaginer créateur", motif: 'Faire émerger et tester l’idée entrepreneuriale.' })
    services.unshift({ nom: 'Structurer mon projet de création', motif: 'Formaliser les étapes et la faisabilité du projet.' })
  }
  if (contient(texte, /international|etranger|expatri|langue etrangere/)) {
    services.unshift({ nom: 'Activ International', motif: 'Explorer ou concrétiser une mobilité professionnelle internationale.' })
  }
  if (contient(texte, /brsa|beneficiaire du rsa|\brsa\b|orientation|contrat d.engagement/)) {
    rappels.push('LPE / orientation / actualisation : confirmer l’organisme référent, le contrat et la procédure interne en vigueur ; ne rien déduire automatiquement du support interne.')
  }

  rappels.push('Vérifier le code situation OP2 et la modalité d’accompagnement avec le conseiller ; aucune affectation n’est automatique.')
  if ((input.freins || []).length > 0 && (input.ressources || []).length === 0) {
    rappels.unshift('Des freins sont renseignés mais aucun point d’appui : rechercher au moins une ressource mobilisable.')
  }
  if (!normaliser(input.projet).trim() && phase !== 'Explorer') {
    rappels.unshift('Le projet n’est pas encore écrit dans le champ dédié : le formaliser avant la synthèse finale.')
  }

  return {
    contexteSuffisant,
    phase,
    phaseIndex: PHASES.indexOf(phase),
    confiance,
    raison,
    objectif: content.objectif,
    questions: unique(questions).slice(0, 5),
    pistes: unique(pistes).slice(0, 4),
    services: services.filter((item, index, items) => items.findIndex((candidate) => candidate.nom === item.nom) === index).slice(0, 5),
    vigilances: unique(vigilances),
    rappels: unique(rappels).slice(0, 4),
    scores,
  }
}

export { PHASES as ADVP_PHASES }
