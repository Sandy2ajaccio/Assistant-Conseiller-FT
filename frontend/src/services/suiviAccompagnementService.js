export const SUIVIS_ACCOMPAGNEMENT = [
  {
    id: 'essentiel',
    label: 'Essentiel / Guide',
    description: 'Personne autonome, projet opérationnel et freins limités.',
    couleur: '#2e7d32',
  },
  {
    id: 'renforce',
    label: 'Renforcé',
    description: 'Appui plus fréquent pour structurer le projet, les démarches ou lever des freins.',
    couleur: '#ed6c02',
  },
  {
    id: 'global',
    label: 'Global (GLO)',
    description: 'Coordination sociale et professionnelle lorsque plusieurs dimensions font obstacle.',
    couleur: '#7b1fa2',
  },
]

const normaliser = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')

export const analyserSuiviAccompagnement = ({
  demande = '',
  besoin = '',
  situationAdministrative = '',
  situationPersonnelle = '',
  parcoursProfessionnel = '',
  projet = '',
  freins = [],
  ressources = [],
  categorie = '',
  codeSituationOp2 = '',
  suiviChoisi = '',
} = {}) => {
  const texte = normaliser([
    demande,
    besoin,
    situationAdministrative,
    situationPersonnelle,
    parcoursProfessionnel,
    projet,
    ...freins,
    ...ressources,
  ].join(' '))
  const contexteSuffisant = texte.trim().length >= 12
  const autonome = /autonom|recherche active|projet professionnel defini|disponible immediatement/.test(texte)
    || ressources.some((item) => ['Autonomie', 'Motivation', 'Disponibilite'].includes(item))
  const projetFlou = /projet (?:a|à) preciser|sans projet|aucun projet|pas (?:encore )?de projet|n.a pas (?:encore )?de projet|projet flou|ne sait (?:pas|plus)|hesit|reconversion/.test(texte)
  const besoinCoordination = /accompagnement social|travailleur social|coordination|logement instable|isolement social/.test(texte)
  const freinsNombreux = freins.length >= 2
  const freinsTresStructurants = /logement|sante|handicap|financ|garde d.enfant/.test(texte)
  const categorieNumero = Number(categorie)
  const codeOp2 = String(codeSituationOp2 || '').toUpperCase()
  const codeIa = codeOp2 === 'IA'
  const codeRenforce = ['PP', 'SP', 'DS'].includes(codeOp2)
  const codeGuideConditionnel = ['EM', 'RE', 'CE', 'SA', 'RT'].includes(codeOp2)
  const besoinPsychologueExplicite = /psychologue du travail|regards? croises?|souffrance au travail|epuisement professionnel|burn.?out|blocage professionnel|echecs? repetes/.test(texte)
  const besoinApprofondissement = projetFlou && /confiance|sante|handicap|reconversion|parcours complexe|difficulte a choisir|ne sait plus/.test(texte)
  const regardCroiseConseille = besoinPsychologueExplicite || besoinApprofondissement

  let conseille = 'renforce'
  let motif = 'Un accompagnement renforcé permet de structurer les étapes avant une mise en autonomie.'
  const aVerifier = []
  const sousPistes = []
  const pistesSpecialisees = []

  if (!contexteSuffisant) {
    conseille = ''
    motif = 'Complétez la demande et le parcours pour obtenir une proposition de suivi.'
  } else if (besoinCoordination && (freinsNombreux || freinsTresStructurants || categorieNumero === 9)) {
    conseille = 'global'
    motif = 'Plusieurs dimensions sociales et professionnelles nécessitent une coordination.'
    aVerifier.push('Confirmer le besoin réel de coordination avec un professionnel du social.')
  } else if (codeRenforce) {
    conseille = 'renforce'
    motif = codeOp2 === 'PP'
      ? 'Le code OP2 PP correspond à un besoin de travail sur le projet professionnel.'
      : codeOp2 === 'SP'
        ? 'Le code OP2 SP signale des freins qui nécessitent un accompagnement renforcé.'
        : 'Le code OP2 DS correspond à un suivi délégué dont le dispositif doit être confirmé.'
  } else if ((autonome || codeGuideConditionnel) && !projetFlou && freins.length <= 1 && categorieNumero !== 9) {
    conseille = 'essentiel'
    motif = codeGuideConditionnel
      ? 'Le code OP2 et les éléments saisis sont compatibles avec un suivi Guide / Essentiel, sous réserve des vérifications internes.'
      : 'La personne paraît autonome, mobilisable et confrontée à peu de freins actifs.'
    aVerifier.push('Confirmer que l’autonomie est réelle dans les démarches et pas seulement déclarée.')
  } else {
    conseille = 'renforce'
    motif = projetFlou
      ? 'Le projet reste à clarifier ou à valider avec un suivi plus rapproché.'
      : 'Les freins ou le besoin de structuration justifient un appui plus fréquent.'
    sousPistes.push('Intensif si des contacts fréquents et des objectifs courts sont nécessaires.')
    sousPistes.push('AIJ ou CEJ uniquement après vérification de l’âge, de l’éligibilité et de la disponibilité.')
    sousPistes.push('Projet professionnel si la priorité est la reconversion, la formation ou la création.')
  }

  if (categorieNumero === 10) {
    aVerifier.push('Catégorie 10 : confirmer l’orientation après le diagnostic global, le contrat et l’organisme référent.')
  }
  if (contexteSuffisant) {
    aVerifier.push('Portefeuille mutualisé : confirmer son utilisation comme portefeuille d’attente uniquement lorsqu’aucune place n’est disponible dans le portefeuille cible.')
  }
  if (/rqth|handicap/.test(texte)) {
    aVerifier.push('La RQTH seule ne détermine pas le suivi : vérifier ses conséquences professionnelles et les besoins de compensation.')
  }
  if (codeOp2 === 'EM') {
    aVerifier.push('OP2 EM : confirmer que la personne est réellement autonome avant de retenir le suivi Guide / Essentiel.')
  }
  if (codeOp2 === 'RE') {
    aVerifier.push('OP2 RE : retenir Guide / Essentiel si la personne est autonome ; retenir Renforcé si elle doit travailler ses techniques de recherche d’emploi.')
  }
  if (codeOp2 === 'CE') {
    aVerifier.push('OP2 CE : vérifier le K-BIS et la réalité de l’activité conservée avant de confirmer le suivi Guide / Essentiel.')
  }
  if (codeOp2 === 'SA') {
    aVerifier.push('OP2 SA : confirmer la situation saisonnière ou la proximité du départ à la retraite selon la procédure interne.')
  }
  if (codeOp2 === 'RT') {
    aVerifier.push('OP2 RT : confirmer que le départ à la retraite est prévu dans un délai de 6 mois à 1 an et vérifier le code attendu dans la procédure interne.')
  }
  if (codeOp2 === 'PP') {
    aVerifier.push('OP2 PP : confirmer que la priorité porte bien sur la construction ou la clarification du projet professionnel.')
  }
  if (codeOp2 === 'SP') {
    aVerifier.push('OP2 SP : identifier les freins actifs et les relais nécessaires avant de confirmer le suivi Renforcé.')
  }
  if (codeOp2 === 'DS') {
    aVerifier.push('OP2 DS : confirmer le suivi délégué concerné — AIJ, CEJ ou intensif FSE — et son organisme référent.')
  }
  if (conseille === 'global') {
    aVerifier.push('Suivi Global : confirmer la fiche d’orientation interne vers Marie-Jeanne avant l’affectation.')
    pistesSpecialisees.push({
      id: 'glo',
      titre: 'Accompagnement Global (GLO)',
      objectif: 'Coordonner les dimensions sociales et professionnelles avec un plan d’action progressif.',
      aConfirmer: 'Confirmer le besoin de coordination, le professionnel social mobilisé et le circuit interne d’affectation.',
    })
  }
  if (regardCroiseConseille) {
    pistesSpecialisees.push({
      id: 'regards-croises',
      titre: 'Regards croisés avec un psychologue du travail',
      objectif: 'Approfondir une situation professionnelle complexe, un blocage ou une reconversion difficile à clarifier.',
      aConfirmer: 'Formaliser la demande adressée au psychologue et vérifier le circuit local de la fiche de liaison.',
    })
  }
  if (codeIa) {
    aVerifier.unshift('OP2 IA : ne jamais convoquer ; consulter l’accompagnement et vérifier les situations ASS ou AAH avant de proposer un suivi.')
  }

  const reference = SUIVIS_ACCOMPAGNEMENT.find((item) => item.id === conseille) || null
  const choisi = SUIVIS_ACCOMPAGNEMENT.find((item) => item.id === suiviChoisi) || null
  const ecart = Boolean(reference && choisi && reference.id !== choisi.id)

  return {
    contexteSuffisant,
    conseille,
    reference,
    choisi,
    ecart,
    motif,
    aVerifier,
    sousPistes,
    pistesSpecialisees,
    regardCroiseConseille,
    messageEcart: ecart
      ? `Le suivi retenu (${choisi.label}) diffère de la proposition (${reference.label}). Notez la justification de ce choix.`
      : '',
  }
}
