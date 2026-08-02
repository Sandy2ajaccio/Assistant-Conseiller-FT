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