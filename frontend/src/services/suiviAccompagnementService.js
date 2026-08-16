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
    label: 'Global',
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
  const codeIa = String(codeSituationOp2 || '').toUpperCase() === 'IA'

  let conseille = 'renforce'
  let motif = 'Un accompagnement renforcé permet de structurer les étapes avant une mise en autonomie.'
  const aVerifier = []
  const sousPistes = []

  if (!contexteSuffisant) {
    conseille = ''
    motif = 'Complétez la demande et le parcours pour obtenir une proposition de suivi.'
  } else if (besoinCoordination && (freinsNombreux || freinsTresStructurants || categorieNumero === 9)) {
    conseille = 'global'
    motif = 'Plusieurs dimensions sociales et professionnelles nécessitent une coordination.'
    aVerifier.push('Confirmer le besoin réel de coordination avec un professionnel du social.')
  } else if (autonome && !projetFlou && freins.length <= 1 && categorieNumero !== 9) {
    conseille = 'essentiel'
    motif = 'La personne paraît autonome, mobilisable et confrontée à peu de freins actifs.'
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
  if (/rqth|handicap/.test(texte)) {
    aVerifier.push('La RQTH seule ne détermine pas le suivi : vérifier ses conséquences professionnelles et les besoins de compensation.')
  }
  if (codeIa) {
    aVerifier.unshift('Code OP2 IA : ne pas convoquer ; consulter l’accompagnement avant de proposer un suivi.')
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
    messageEcart: ecart
      ? `Le suivi retenu (${choisi.label}) diffère de la proposition (${reference.label}). Notez la justification de ce choix.`
      : '',
  }
}
