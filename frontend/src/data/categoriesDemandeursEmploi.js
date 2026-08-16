export const CATEGORIES_DEMANDEURS_EMPLOI = [
  {
    id: 'categorie_1',
    numero: 1,
    libelle: 'Sans emploi – CDI à temps plein',
    description:
      'Personne sans emploi, immédiatement disponible, tenue d’accomplir des actes positifs de recherche d’emploi et recherchant un CDI à temps plein.',
    emploiActuel: false,
    disponibiliteImmediate: true,
    actesRechercheObligatoires: true,
    typeEmploiRecherche: 'CDI',
    tempsTravailRecherche: 'Temps plein',
    accompagnementPrincipal: 'Professionnel',
    vigilance: [
      'Vérifier les démarches de recherche d’emploi',
      'Vérifier le projet professionnel et la disponibilité',
      'Contrôler la cohérence entre métier recherché, mobilité et marché du travail',
    ],
    questionsEntretien: [
      'Quel CDI à temps plein recherchez-vous ?',
      'Quelles démarches avez-vous réalisées récemment ?',
      'Êtes-vous disponible immédiatement pour travailler ?',
      'Votre mobilité est-elle compatible avec votre recherche ?',
    ],
  },
  {
    id: 'categorie_2',
    numero: 2,
    libelle: 'Sans emploi – CDI à temps partiel',
    description:
      'Personne sans emploi, immédiatement disponible, tenue d’accomplir des actes positifs de recherche d’emploi et recherchant un CDI à temps partiel.',
    emploiActuel: false,
    disponibiliteImmediate: true,
    actesRechercheObligatoires: true,
    typeEmploiRecherche: 'CDI',
    tempsTravailRecherche: 'Temps partiel',
    accompagnementPrincipal: 'Professionnel',
    vigilance: [
      'Identifier la raison du temps partiel',
      'Vérifier les contraintes personnelles ou de santé',
      'Vérifier que le volume horaire recherché est réaliste',
    ],
    questionsEntretien: [
      'Pourquoi recherchez-vous un temps partiel ?',
      'Quel volume horaire pouvez-vous accepter ?',
      'Quels jours et horaires êtes-vous disponible ?',
      'Existe-t-il une contrainte de santé, de garde ou de mobilité ?',
    ],
  },
  {
    id: 'categorie_3',
    numero: 3,
    libelle: 'Sans emploi – CDD, intérim ou saisonnier',
    description:
      'Personne sans emploi, immédiatement disponible, tenue d’accomplir des actes positifs de recherche d’emploi et recherchant un CDD, un emploi temporaire ou saisonnier, y compris de très courte durée.',
    emploiActuel: false,
    disponibiliteImmediate: true,
    actesRechercheObligatoires: true,
    typeEmploiRecherche: 'CDD / Intérim / Saisonnier',
    tempsTravailRecherche: 'Variable',
    accompagnementPrincipal: 'Professionnel',
    vigilance: [
      'Vérifier la disponibilité immédiate',
      'Identifier les périodes et secteurs saisonniers',
      'Évaluer la mobilité et la capacité à enchaîner les contrats',
    ],
    questionsEntretien: [
      'Quels contrats courts recherchez-vous ?',
      'Êtes-vous disponible immédiatement ?',
      'Acceptez-vous l’intérim ou le travail saisonnier ?',
      'Sur quel territoire pouvez-vous travailler ?',
    ],
  },
  {
    id: 'categorie_4',
    numero: 4,
    libelle: 'Sans emploi – non immédiatement disponible',
    description:
      'Personne sans emploi, non immédiatement disponible, à la recherche d’un emploi.',
    emploiActuel: false,
    disponibiliteImmediate: false,
    actesRechercheObligatoires: false,
    typeEmploiRecherche: 'À préciser',
    tempsTravailRecherche: 'À préciser',
    accompagnementPrincipal: 'Adapté à l’indisponibilité',
    vigilance: [
      'Identifier précisément la cause de l’indisponibilité',
      'Vérifier la date prévisionnelle de retour à la disponibilité',
      'Adapter les actions sans imposer une recherche immédiatement incompatible',
    ],
    questionsEntretien: [
      'Pourquoi n’êtes-vous pas disponible immédiatement ?',
      'À quelle date pensez-vous redevenir disponible ?',
      'Quelles démarches restent possibles pendant cette période ?',
      'Un accompagnement social, santé ou formation est-il nécessaire ?',
    ],
  },
  {
    id: 'categorie_5',
    numero: 5,
    libelle: 'En emploi – recherche d’un autre emploi',
    description:
      'Personne pourvue d’un emploi et recherchant un autre emploi.',
    emploiActuel: true,
    disponibiliteImmediate: false,
    actesRechercheObligatoires: false,
    typeEmploiRecherche: 'Autre emploi',
    tempsTravailRecherche: 'À préciser',
    accompagnementPrincipal: 'Évolution ou mobilité professionnelle',
    vigilance: [
      'Identifier la nature et la durée du contrat actuel',
      'Vérifier le motif du changement recherché',
      'Évaluer les disponibilités pour les démarches et entretiens',
    ],
    questionsEntretien: [
      'Quel est votre emploi actuel ?',
      'Pourquoi souhaitez-vous changer d’emploi ?',
      'Quel type de contrat recherchez-vous ?',
      'Quand pourriez-vous commencer un nouvel emploi ?',
    ],
  },
  {
    id: 'categorie_6',
    numero: 6,
    libelle: 'Non immédiatement disponible – autre CDI à temps plein',
    description:
      'Personne non immédiatement disponible, recherchant un autre CDI à temps plein et tenue d’accomplir des actes positifs de recherche d’emploi.',
    emploiActuel: true,
    disponibiliteImmediate: false,
    actesRechercheObligatoires: true,
    typeEmploiRecherche: 'CDI',
    tempsTravailRecherche: 'Temps plein',
    accompagnementPrincipal: 'Mobilité professionnelle',
    vigilance: [
      'Vérifier la situation professionnelle actuelle',
      'Identifier le délai de disponibilité',
      'Contrôler les démarches de recherche malgré l’indisponibilité immédiate',
    ],
    questionsEntretien: [
      'Quelle est votre situation actuelle ?',
      'À quelle date pourriez-vous changer d’emploi ?',
      'Quelles démarches réalisez-vous actuellement ?',
      'Quel CDI à temps plein recherchez-vous ?',
    ],
  },
  {
    id: 'categorie_7',
    numero: 7,
    libelle: 'Non immédiatement disponible – autre CDI à temps partiel',
    description:
      'Personne non immédiatement disponible, recherchant un autre CDI à temps partiel et tenue d’accomplir des actes positifs de recherche d’emploi.',
    emploiActuel: true,
    disponibiliteImmediate: false,
    actesRechercheObligatoires: true,
    typeEmploiRecherche: 'CDI',
    tempsTravailRecherche: 'Temps partiel',
    accompagnementPrincipal: 'Mobilité professionnelle adaptée',
    vigilance: [
      'Identifier la raison du temps partiel',
      'Vérifier les disponibilités réelles',
      'Contrôler les démarches de recherche compatibles avec la situation',
    ],
    questionsEntretien: [
      'Quel temps partiel recherchez-vous ?',
      'Quelles sont vos contraintes horaires ?',
      'Quand pourriez-vous débuter un nouvel emploi ?',
      'Quelles démarches avez-vous engagées ?',
    ],
  },
  {
    id: 'categorie_8',
    numero: 8,
    libelle: 'Non immédiatement disponible – CDD, intérim ou saisonnier',
    description:
      'Personne non immédiatement disponible, recherchant un autre CDD, emploi temporaire ou saisonnier, y compris de très courte durée, et tenue d’accomplir des actes positifs de recherche d’emploi.',
    emploiActuel: true,
    disponibiliteImmediate: false,
    actesRechercheObligatoires: true,
    typeEmploiRecherche: 'CDD / Intérim / Saisonnier',
    tempsTravailRecherche: 'Variable',
    accompagnementPrincipal: 'Mobilité professionnelle vers contrat court',
    vigilance: [
      'Identifier la date de disponibilité',
      'Vérifier les périodes de recherche',
      'Contrôler la compatibilité entre contrat actuel et projet',
    ],
    questionsEntretien: [
      'Quel type de contrat court recherchez-vous ?',
      'À partir de quand êtes-vous disponible ?',
      'Quels secteurs ou saisons vous intéressent ?',
      'Quelles démarches avez-vous réalisées ?',
    ],
  },
  {
    id: 'categorie_9',
    numero: 9,
    libelle: 'Accompagnement à vocation d’insertion sociale',
    description:
      'Personne rencontrant des difficultés faisant temporairement obstacle à son engagement dans une démarche de recherche d’emploi et bénéficiant d’un accompagnement à vocation d’insertion sociale.',
    emploiActuel: false,
    disponibiliteImmediate: false,
    actesRechercheObligatoires: false,
    typeEmploiRecherche: 'Non prioritaire temporairement',
    tempsTravailRecherche: 'À réévaluer',
    accompagnementPrincipal: 'Social ou socioprofessionnel',
    vigilance: [
      'Identifier les freins faisant obstacle à la recherche d’emploi',
      'Ne pas conclure à une absence de mobilisation sans analyser la situation',
      'Coordonner l’accompagnement avec les partenaires sociaux',
      'Prévoir une réévaluation de la capacité d’engagement',
    ],
    questionsEntretien: [
      'Quelles difficultés empêchent actuellement la recherche d’emploi ?',
      'Quels partenaires vous accompagnent déjà ?',
      'Quelle action réaliste peut être engagée maintenant ?',
      'À quelle échéance la situation devra-t-elle être réévaluée ?',
    ],
  },
  {
    id: 'categorie_10',
    numero: 10,
    libelle: 'Demande ou bénéfice du RSA – attente du contrat d’engagement',
    description:
      'Personne ayant déposé une demande de RSA en cours d’instruction ou rejetée, bénéficiaire du RSA, conjoint, concubin ou partenaire de Pacs concerné, non déjà inscrit au 31 décembre 2024 et en attente de signature du contrat d’engagement.',
    emploiActuel: null,
    disponibiliteImmediate: null,
    actesRechercheObligatoires: null,
    typeEmploiRecherche: 'À déterminer après diagnostic',
    tempsTravailRecherche: 'À déterminer',
    accompagnementPrincipal: 'Diagnostic et orientation',
    vigilance: [
      'Vérifier la situation exacte au regard du RSA',
      'Vérifier si le contrat d’engagement est signé',
      'Réaliser le diagnostic global avant toute orientation',
      'Identifier l’organisme référent',
      'Ne pas déduire automatiquement la capacité immédiate à travailler',
    ],
    questionsEntretien: [
      'La demande de RSA est-elle acceptée, en cours ou rejetée ?',
      'Le contrat d’engagement est-il signé ?',
      'Quel organisme assure ou doit assurer l’accompagnement ?',
      'Quels sont les freins sociaux et professionnels ?',
      'La personne est-elle immédiatement disponible pour travailler ?',
    ],
  },
]

export const SOURCE_OFFICIELLE_CATEGORIES = {
  titre: "Arrêté du 30 décembre 2024 définissant les catégories de demandeurs d'emploi",
  entreeEnVigueur: '2 janvier 2025',
  url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000050934968/',
}

const normaliserTexteCategorie = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')

const ajouterCandidat = (candidats, numero, raison, aVerifier = []) => {
  if (!candidats.has(numero)) {
    candidats.set(numero, { numero, raisons: [], aVerifier: [] })
  }
  const candidat = candidats.get(numero)
  if (raison && !candidat.raisons.includes(raison)) candidat.raisons.push(raison)
  aVerifier.forEach((item) => {
    if (item && !candidat.aVerifier.includes(item)) candidat.aVerifier.push(item)
  })
}

/**
 * Produit des catégories possibles à contrôler avec la personne. Cette fonction n'effectue
 * aucun transfert de catégorie : elle rend visibles les critères manquants et la décision
 * reste soumise au dossier réel et à la procédure interne France Travail.
 */
export const analyserCoherenceCategorie = ({
  categorieActuelle = '',
  situationAdministrative = '',
  situationPersonnelle = '',
  parcoursProfessionnel = '',
  projet = '',
  demande = '',
  besoin = '',
  freins = [],
} = {}) => {
  const reference = getCategorieDemandeurEmploi(categorieActuelle)
  const texte = normaliserTexteCategorie([
    situationAdministrative,
    situationPersonnelle,
    parcoursProfessionnel,
    projet,
    demande,
    besoin,
    ...freins,
  ].join(' '))
  const candidats = new Map()

  const emploiActuel = /en (?:emploi|poste|cdi|cdd|activite)|activite reduite|auto-entrepreneur|micro-entreprise|emploi actuel/.test(texte)
  const sansEmploi = /sans emploi|aucun emploi|demandeur d.emploi|recherche active|premiere recherche/.test(texte) && !emploiActuel
  const disponible = /disponible immediatement|disponibilite immediate/.test(texte)
  const indisponible = /non disponible|indisponib|arret maladie|formation en cours/.test(texte)
  const tempsPartiel = /temps partiel/.test(texte)
  const contratCourt = /\bcdd\b|interim|temporaire|saisonnier|contrat court/.test(texte)
  const tempsPlein = /temps plein|\bcdi\b/.test(texte) && !tempsPartiel
  const rsa = /beneficiaire du rsa|demande de rsa|\bbrsa\b|\brsa\b/.test(texte)
  const contratASigner = /contrat d.engagement a signer|en attente de (?:la )?signature/.test(texte)
  const primoInscrit = /primo-inscrit|nouvellement inscrit|non inscrit.*31 decembre 2024/.test(texte)
  const accompagnementSocial = /accompagnement (?:a vocation d.)?insertion sociale|parcours social|suivi social/.test(texte)
  const freinsTemporaires = freins.length >= 2 || /obstacle temporaire|freins? sociaux|difficultes? sociales/.test(texte)

  if (emploiActuel) {
    if (indisponible && tempsPartiel) {
      ajouterCandidat(candidats, 7, 'Emploi ou activité en cours, indisponibilité immédiate et recherche à temps partiel.', ['Confirmer les actes positifs de recherche d’emploi.'])
    } else if (indisponible && contratCourt) {
      ajouterCandidat(candidats, 8, 'Emploi ou activité en cours, indisponibilité immédiate et recherche de contrat court.', ['Confirmer les actes positifs de recherche d’emploi.'])
    } else if (indisponible && tempsPlein) {
      ajouterCandidat(candidats, 6, 'Emploi ou activité en cours, indisponibilité immédiate et recherche d’un CDI à temps plein.', ['Confirmer les actes positifs de recherche d’emploi.'])
    } else {
      ajouterCandidat(candidats, 5, 'La situation mentionne un emploi ou une activité et la recherche d’un autre emploi.', ['Préciser la disponibilité et le type de contrat recherché.'])
      if (indisponible) {
        ;[6, 7, 8].forEach((numero) => ajouterCandidat(candidats, numero, 'Une indisponibilité immédiate est signalée.', ['Préciser le type et le temps de travail recherchés.', 'Confirmer les actes positifs de recherche d’emploi.']))
      }
    }
  } else if (indisponible) {
    ajouterCandidat(candidats, 4, 'La personne est décrite sans emploi et non immédiatement disponible.', ['Confirmer la cause et la durée prévisible de l’indisponibilité.'])
  } else if (disponible || sansEmploi) {
    if (tempsPartiel) {
      ajouterCandidat(candidats, 2, 'La personne est sans emploi, disponible et recherche un CDI à temps partiel.', ['Confirmer la disponibilité immédiate et les actes de recherche.'])
    } else if (contratCourt) {
      ajouterCandidat(candidats, 3, 'La personne est sans emploi, disponible et recherche un CDD, de l’intérim ou un emploi saisonnier.', ['Confirmer la disponibilité immédiate et les actes de recherche.'])
    } else if (tempsPlein) {
      ajouterCandidat(candidats, 1, 'La personne est sans emploi, disponible et recherche un CDI à temps plein.', ['Confirmer les actes positifs de recherche d’emploi.'])
    } else {
      ;[1, 2, 3].forEach((numero) => ajouterCandidat(candidats, numero, 'La personne semble sans emploi et disponible immédiatement.', ['Préciser CDI plein temps, CDI temps partiel ou contrat court.', 'Confirmer les actes positifs de recherche d’emploi.']))
    }
  }

  if (freinsTemporaires && accompagnementSocial) {
    ajouterCandidat(candidats, 9, 'Des difficultés temporaires font obstacle à la recherche et un accompagnement social est mentionné.', ['Confirmer que la personne bénéficie bien d’un accompagnement à vocation d’insertion sociale.'])
  } else if (freinsTemporaires) {
    ajouterCandidat(candidats, 9, 'Plusieurs difficultés temporaires sont décrites.', ['La catégorie 9 exige aussi un accompagnement à vocation d’insertion sociale : le confirmer avant tout changement.'])
  }

  if (rsa && contratASigner) {
    ajouterCandidat(candidats, 10, 'Une situation RSA et une attente de signature du contrat d’engagement sont mentionnées.', [primoInscrit ? '' : 'Confirmer que la personne n’était pas déjà inscrite au 31 décembre 2024.'])
  } else if (rsa) {
    ajouterCandidat(candidats, 10, 'Une situation RSA est mentionnée.', ['Confirmer l’attente de signature du contrat d’engagement.', 'Confirmer la situation d’inscription au 31 décembre 2024.'])
  }

  const resultat = Array.from(candidats.values()).map((item) => ({
    ...item,
    reference: getCategorieDemandeurEmploi(item.numero),
  }))
  const numeroActuel = reference?.numero || null
  const categorieActuelleCompatible = numeroActuel
    ? resultat.some((item) => item.numero === numeroActuel)
    : null
  const contexteSuffisant = Boolean(
    resultat.length > 0 && (emploiActuel || sansEmploi || disponible || indisponible || accompagnementSocial || rsa),
  )

  return {
    reference,
    candidats: resultat,
    contexteSuffisant,
    categorieActuelleCompatible,
    changementAEnvisager: Boolean(reference && contexteSuffisant && !categorieActuelleCompatible),
    message: !reference
      ? 'Renseignez la catégorie actuellement déclarée pour activer l’alerte de cohérence.'
      : !contexteSuffisant
        ? 'La situation ne contient pas encore assez de critères pour contrôler la catégorie.'
        : categorieActuelleCompatible
          ? `La catégorie ${reference.numero} fait partie des catégories compatibles à vérifier au vu des éléments saisis.`
          : `La catégorie ${reference.numero} ne correspond pas aux catégories suggérées par les éléments saisis. Vérifiez un changement avec la personne et la procédure interne France Travail.`,
  }
}

export const getCategorieDemandeurEmploi = (categorie) => {
  const numero = Number(
    String(categorie || '').replace(/[^0-9]/g, ''),
  )

  return (
    CATEGORIES_DEMANDEURS_EMPLOI.find(
      (item) => item.numero === numero,
    ) || null
  )
}

export const analyserCategorieDemandeurEmploi = (categorie) => {
  const reference = getCategorieDemandeurEmploi(categorie)

  if (!reference) {
    return {
      trouvee: false,
      niveauVigilance: 'À vérifier',
      alertes: ['Catégorie France Travail non renseignée ou non reconnue.'],
      questions: [
        'Quelle est la catégorie actuelle du demandeur d’emploi ?',
      ],
    }
  }

  return {
    trouvee: true,
    categorie: reference.numero,
    libelle: reference.libelle,
    disponibiliteImmediate: reference.disponibiliteImmediate,
    actesRechercheObligatoires: reference.actesRechercheObligatoires,
    accompagnementPrincipal: reference.accompagnementPrincipal,
    niveauVigilance:
      reference.numero === 9 || reference.numero === 10
        ? 'Élevé'
        : 'Standard',
    alertes: reference.vigilance,
    questions: reference.questionsEntretien,
  }
}
