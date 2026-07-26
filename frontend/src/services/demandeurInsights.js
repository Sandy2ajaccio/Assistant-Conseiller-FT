import { normalizeDemandeurModel } from '../types/dossierContract'

const normalizeToken = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const buildObjectId = (prefix, value, index) => {
  const token = normalizeToken(value)
  return `${prefix}-${token || `item-${index + 1}`}-${index + 1}`
}

export const normalizePrestation = (item, index, source = 'generic') => {
  if (item && typeof item === 'object') {
    const libelle = item.libelle || item.nom || item.message || `Prestation ${index + 1}`
    return {
      id: item.id || buildObjectId(`prestation-${source}`, libelle, index),
      libelle,
      categorie: item.categorie || item.type || 'Non renseignée',
      justification: item.justification || item.pourquoi || item.raison || '',
    }
  }

  const libelle = String(item || '').trim() || `Prestation ${index + 1}`
  return {
    id: buildObjectId(`prestation-${source}`, libelle, index),
    libelle,
    categorie: 'Non renseignée',
    justification: '',
  }
}

export const normalizePartenaire = (item, index, source = 'generic') => {
  if (item && typeof item === 'object') {
    const nom = item.nom || item.libelle || item.message || `Partenaire ${index + 1}`
    return {
      id: item.id || buildObjectId(`partenaire-${source}`, nom, index),
      nom,
      type: item.type || item.categorie || 'Non renseigné',
      justification: item.justification || item.pourquoi || item.raison || '',
    }
  }

  const nom = String(item || '').trim() || `Partenaire ${index + 1}`
  return {
    id: buildObjectId(`partenaire-${source}`, nom, index),
    nom,
    type: 'Non renseigné',
    justification: '',
  }
}

export const normalizeAction = (item, index, source = 'generic') => {
  if (item && typeof item === 'object') {
    const libelle = item.libelle || item.nom || item.message || `Action ${index + 1}`
    return {
      id: item.id || buildObjectId(`action-${source}`, libelle, index),
      libelle,
      responsable: item.responsable || 'Conseiller',
      echeance: item.echeance || '',
      statut: item.statut || 'À planifier',
    }
  }

  const libelle = String(item || '').trim() || `Action ${index + 1}`
  return {
    id: buildObjectId(`action-${source}`, libelle, index),
    libelle,
    responsable: 'Conseiller',
    echeance: '',
    statut: 'À planifier',
  }
}

const makeRecommandation = (recommandation, justification, appuiDossier, confiance) => ({
  recommandation,
  justification,
  appuiDossier,
  confiance,
})

export const generateDemandeurInsights = ({ demandeur, analyse }) => {
  const dossier = normalizeDemandeurModel(demandeur)

  if (!dossier.id && !dossier.identifiantFt) {
    return {
      freins: [],
      atouts: [],
      prestationsDossier: [],
      prestationsAnalyse: [],
      partenairesAnalyse: [],
      actionsAnalyse: [],
      partenairesDecision: [],
      partenairesMobilises: [],
      analyse360Cards: [],
      syntheseAnalyse360: [],
      syntheseComplete: '',
      compteRenduAuto: {},
      assistantExpertAnalyse: {},
    }
  }

  const freins = [
    dossier?.mobilite?.toLowerCase() === 'limitée' ? 'Mobilité limitée' : null,
    Number(dossier?.nombreFreins || 0) > 0 ? `${dossier.nombreFreins} frein(s) de situation signalé(s)` : null,
    dossier && !dossier.cvVisible ? 'CV non visible' : null,
    dossier && dossier.rechercheEmploi?.toLowerCase() === 'faible' ? 'Dynamique de recherche à renforcer' : null,
    dossier && !dossier.projetProfessionnel ? 'Projet professionnel à clarifier' : null,
  ].filter(Boolean)

  const atouts = [
    dossier?.contratEngagement === 'Oui' ? "Contrat d'engagement actif" : null,
    dossier?.dpaRealisee ? 'DPA réalisée' : null,
    dossier?.premierEntretienRealise ? 'Premier entretien réalisé' : null,
    dossier?.cvVisible ? 'CV visible' : null,
    dossier?.rechercheEmploi?.toLowerCase() === 'active' ? "Recherche d'emploi active" : null,
    dossier?.reconnaissanceTH ? 'Reconnaissance TH identifiée' : null,
  ].filter(Boolean)

  const prestationsDossier = (dossier?.prestations || []).map((item, index) =>
    normalizePrestation(item, index, 'dossier')
  )

  const prestationsAnalyse = (analyse?.prestations || []).map((item, index) =>
    normalizePrestation(item, index, 'analyse')
  )

  const partenairesAnalyse = (analyse?.partenaires || []).map((item, index) =>
    normalizePartenaire(item, index, 'analyse')
  )

  const actionsAnalyse = (analyse?.actions || []).map((item, index) =>
    normalizeAction(item, index, 'analyse')
  )

  const partenairesDecision = (dossier?.simulateurDecision?.partenaires || []).map((item, index) =>
    normalizePartenaire(item, index, 'decision')
  )

  const partenairesMobilises = partenairesAnalyse.map((partenaire) =>
    partenaire.justification ? `${partenaire.nom} : ${partenaire.justification}` : partenaire.nom
  )

  const analyse360Cards = [
    {
      titre: 'Situation administrative',
      contenu: [
        `RSA : ${dossier?.rsa ? 'Oui' : 'Non'}`,
        `ARE : ${dossier?.are ? 'Oui' : 'Non'}`,
        `Fin de droits ARE : ${dossier?.dateFinAre || 'Non renseignée'}`,
        `Contrat d'engagement : ${dossier?.contratEngagement || 'Non renseigné'}`,
        `DPA : ${dossier?.dpaRealisee ? 'Réalisée' : 'À planifier'}`,
      ],
    },
    {
      titre: 'Parcours professionnel',
      contenu: [
        `Ancienneté d'inscription : ${dossier?.ancienneteInscription || 'Non renseignée'}`,
        `Portefeuille actuel : ${dossier?.portefeuille || 'Non renseigné'}`,
        `Dernier entretien : ${dossier?.dernierEntretien || 'Non réalisé'}`,
        `Formations : ${dossier?.formations?.length > 0 ? dossier.formations.join(', ') : 'Aucune formation en cours'}`,
      ],
    },
    {
      titre: 'Projet professionnel',
      contenu: [dossier?.projetProfessionnel || 'Projet non défini à ce stade.'],
    },
    {
      titre: 'Mobilité',
      contenu: [`Niveau de mobilité : ${dossier?.mobilite || 'Non renseigné'}`],
    },
    {
      titre: 'Freins',
      contenu: freins.length > 0 ? freins : ['Aucun frein explicite détecté dans le dossier.'],
    },
    {
      titre: 'Atouts',
      contenu: atouts.length > 0 ? atouts : ['Aucun atout explicite détecté dans le dossier.'],
    },
    {
      titre: 'Prestations réalisées',
      contenu:
        prestationsDossier.length > 0
          ? prestationsDossier.map((prestation) => prestation.libelle)
          : ['Aucune prestation réalisée à ce jour.'],
    },
    {
      titre: 'Partenaires mobilisés',
      contenu:
        partenairesMobilises.length > 0
          ? partenairesMobilises
          : ['Aucun partenaire mobilisé identifié par le moteur expert.'],
    },
  ]

  const syntheseAnalyse360 = [
    `Priorité métier : ${analyse?.priorite || 'Non définie'}`,
    `Portefeuille conseillé : ${analyse?.portefeuilleConseille || 'Non déterminé'}`,
    `Freins recensés : ${freins.length}`,
    `Atouts recensés : ${atouts.length}`,
    `Prestations réalisées : ${prestationsDossier.length}`,
    `Partenaires mobilisés : ${partenairesMobilises.length}`,
    `Projet professionnel : ${dossier?.projetProfessionnel ? 'Défini' : 'À construire'}`,
    `Synthèse IA : ${analyse?.synthese || 'Aucune synthèse disponible.'}`,
  ]

  const decision = dossier?.simulateurDecision

  const section1 = `1. Situation actuelle\nLe demandeur d'emploi est inscrit depuis ${dossier?.ancienneteInscription || 'une durée non précisée'}, avec un portefeuille actuel ${dossier?.portefeuille || 'non renseigné'}. La situation administrative est marquée par un statut RSA ${dossier?.rsa ? 'actif' : 'non activé'} et ARE ${dossier?.are ? `active avec une fin de droits estimée au ${dossier?.dateFinAre || 'non renseignée'}` : 'non active'}, avec un contrat d'engagement ${dossier?.contratEngagement === 'Oui' ? 'en place' : 'à confirmer'}.`

  const section2 = `2. Parcours professionnel\nLe parcours de suivi comprend un premier entretien ${dossier?.premierEntretienRealise ? 'déjà réalisé' : 'encore à organiser'} et un dernier entretien ${dossier?.dernierEntretien || 'non tracé à ce stade'}. Les ateliers suivis sont ${dossier?.ateliers?.length > 0 ? dossier.ateliers.join(', ') : 'non documentés'}, tandis que les formations en cours ou prévues sont ${dossier?.formations?.length > 0 ? dossier.formations.join(', ') : 'non renseignées'}.`

  const section3 = `3. Projet professionnel\nLe projet professionnel est ${dossier?.projetProfessionnel ? `formalisé autour de : ${dossier.projetProfessionnel}` : 'encore en phase de clarification'}, ce qui oriente le niveau d'intensité d'accompagnement et les prescriptions à prioriser.`

  const section4 = `4. Freins identifiés\nLes freins principaux recensés concernent ${freins.length > 0 ? freins.join(', ') : 'aucun frein majeur explicite dans le dossier'}, avec un volume global de ${dossier?.nombreFreins || 0} frein(s) déclaré(s). La mobilité est évaluée à un niveau ${dossier?.mobilite || 'non précisé'}, élément déterminant pour l'accès à l'emploi et aux actions.`

  const section5 = `5. Atouts identifiés\nLes atouts actuels sont ${atouts.length > 0 ? atouts.join(', ') : 'à renforcer lors du prochain entretien'}, avec une dynamique de recherche d'emploi jugée ${dossier?.rechercheEmploi || 'non précisée'} et une visibilité du CV ${dossier?.cvVisible ? 'effective' : 'à consolider'}.`

  const section6 = `6. Analyse du conseiller\nL'analyse consolidée positionne la priorité métier à ${analyse?.priorite || 'non définie'} pour un score estimé à ${analyse?.score ?? 0}. Le portefeuille conseillé est ${analyse?.portefeuilleConseille || 'à arbitrer'}, avec les alertes suivantes : ${analyse?.alertes?.length > 0 ? analyse.alertes.join(', ') : 'aucune alerte bloquante majeure'}.`

  const section7 = `7. Prestations proposées\nLes prestations proposées ou maintenues sont ${prestationsDossier.length > 0 ? prestationsDossier.map((item) => item.libelle).join(', ') : 'non renseignées'}, complétées, le cas échéant, par les recommandations d'analyse ${prestationsAnalyse.length > 0 ? prestationsAnalyse.map((item) => item.libelle).join(', ') : 'sans ajout recommandé à ce stade'}.`

  const section8 = `8. Partenaires mobilisés\nLes partenaires mobilisés sont ${partenairesDecision.length > 0 ? partenairesDecision.map((item) => item.nom).join(', ') : partenairesMobilises.length > 0 ? partenairesMobilises.join(', ') : 'non précisés'}, avec une logique d'appui centrée sur la levée des freins périphériques et la sécurisation du parcours.`

  const section9 = `9. Actions du demandeur d'emploi\nLes actions attendues du demandeur portent sur la poursuite active des démarches de recherche, la participation aux convocations (${dossier?.convocations?.length > 0 ? dossier.convocations.join(', ') : 'aucune convocation planifiée'}) et l'engagement dans les actions prescrites afin de maintenir une progression régulière.`

  const section10 = `10. Actions du conseiller\nLe conseiller prévoit la mise en oeuvre des recommandations prioritaires (${actionsAnalyse.length > 0 ? actionsAnalyse.map((item) => item.libelle).join(', ') : 'aucune action complémentaire immédiate'}), l'ajustement du plan d'accompagnement et le pilotage des articulations avec prestations et partenaires.`

  const section11 = `11. MAP\nLa MAP retenue est ${decision?.map || 'à formaliser'}, avec un type d'accompagnement ${decision?.typeAccompagnement || dossier?.portefeuille || 'à confirmer'} et une fréquence de suivi ${decision?.frequenceSuivi || 'à définir'} afin de sécuriser l'atteinte des objectifs intermédiaires.`

  const section12 = `12. Date du prochain suivi\nLe prochain suivi est fixé au ${decision?.echeance || 'à programmer lors du prochain point'}, avec un engagement de réévaluation continue en fonction des résultats observés et des nouveaux éléments de situation.`

  const syntheseComplete = [
    section1,
    section2,
    section3,
    section4,
    section5,
    section6,
    section7,
    section8,
    section9,
    section10,
    section11,
    section12,
  ].join('\n\n')

  const partenairesTexte =
    partenairesDecision.length > 0
      ? `${partenairesDecision.map((item) => item.nom).join(', ')} avec un motif de levée de freins et de sécurisation du parcours.`
      : 'Aucun partenaire externe n\'est encore mobilisé avec un motif formalisé.'

  const compteRenduAuto = {
    objetEntretien:
      'Entretien de suivi visant à consolider la dynamique de retour à l\'emploi, à ajuster le plan d\'accompagnement et à valider les actions prioritaires.',
    situationDemandeur: `Le demandeur est inscrit depuis ${dossier?.ancienneteInscription || 'une durée non renseignée'} dans le portefeuille ${dossier?.portefeuille || 'non renseigné'}, avec une situation de recherche d\'emploi évaluée à ${dossier?.rechercheEmploi || 'non précisée'} et une mobilité ${dossier?.mobilite || 'non précisée'}.`,
    elementsNouveaux: `Depuis le dernier entretien ${dossier?.dernierEntretien || 'non tracé'}, les éléments nouveaux concernent ${dossier?.formations?.length > 0 ? `la formation ${dossier.formations.join(', ')}` : 'l\'absence de nouvelle formation tracée'}, ainsi que ${dossier?.convocations?.length > 0 ? `les convocations ${dossier.convocations.join(', ')}` : 'aucune nouvelle convocation enregistrée'}.`,
    diagnostic: `Le diagnostic partagé établit une priorité ${analyse?.priorite || 'non définie'} avec un score métier de ${analyse?.score ?? 0}, et un besoin d\'ajustement progressif de l\'accompagnement selon les freins observés et les capacités d\'activation du demandeur.`,
    freins:
      freins.length > 0
        ? `Les freins principaux identifiés sont ${freins.join(', ')}, ce qui nécessite un plan de levée gradué et un suivi rapproché.`
        : 'Aucun frein majeur n\'est formellement identifié à ce stade, mais une vigilance est maintenue sur les risques de désengagement.',
    atouts:
      atouts.length > 0
        ? `Les atouts mobilisables sont ${atouts.join(', ')}, constituant une base favorable pour accélérer la mise en action.`
        : 'Les atouts sont encore insuffisamment documentés et seront précisés au prochain point de suivi.',
    projetProfessionnel: dossier?.projetProfessionnel
      ? `Le projet professionnel est actuellement orienté vers ${dossier.projetProfessionnel}, avec un besoin de consolidation opérationnelle des étapes et des échéances.`
      : 'Le projet professionnel reste à formaliser, avec un travail de clarification à conduire sur les cibles métiers et les moyens de mise en oeuvre.',
    decisionsPrises: decision
      ? `La décision d\'accompagnement retenue s\'oriente vers ${decision.typeAccompagnement || 'un type à confirmer'} car ce cadre est jugé le plus adapté aux besoins identifiés, avec une fréquence ${decision.frequenceSuivi || 'à définir'}.`
      : 'Aucune décision finale n\'est encore arbitrée, les scénarios restent à comparer et à justifier.',
    prestationsPrescrites:
      prestationsDossier.length > 0
        ? `Les prestations prescrites à ce stade sont ${prestationsDossier.map((item) => item.libelle).join(', ')}, avec une mise en oeuvre coordonnée dans le calendrier de suivi.`
        : 'Aucune prestation n\'est encore prescrite, une priorisation reste à effectuer selon le diagnostic.',
    partenairesMobilises: partenairesTexte,
    actionsDemandeur:
      'Le demandeur s\'engage à poursuivre les démarches de recherche, à répondre aux convocations et à réaliser les actions prévues entre deux rendez-vous.',
    actionsConseiller:
      'Le conseiller assure le pilotage du plan d\'actions, la coordination des prescriptions et la vérification des avancées avant chaque étape clé du parcours.',
    map: decision?.map
      ? `La MAP retenue est ${decision.map}, avec un séquencement articulé autour des priorités court terme et des objectifs intermédiaires.`
      : 'La MAP n\'est pas encore formalisée dans le dossier et doit être renseignée avant validation finale.',
    dateProchainRdv: decision?.echeance
      ? `Le prochain rendez-vous est planifié au ${decision.echeance}, avec un point d\'étape structuré sur les résultats obtenus.`
      : 'La date du prochain rendez-vous n\'est pas encore renseignée et doit être fixée avant clôture du compte rendu.',
  }

  const pointsFortsData =
    atouts.length > 0
      ? atouts.map((point) =>
          makeRecommandation(
            point,
            'Cet élément favorise la mise en action et la sécurisation du parcours.',
            `Données mobilisées: ${point}.`,
            'Élevé'
          )
        )
      : [
          makeRecommandation(
            'Identifier des atouts complémentaires lors de l\'entretien.',
            'Le dossier n\'explicite pas suffisamment les leviers positifs immédiats.',
            'Données mobilisées: rubrique Atouts actuellement peu renseignée.',
            'Moyen'
          ),
        ]

  const freinsData =
    freins.length > 0
      ? freins.map((frein) =>
          makeRecommandation(
            frein,
            'Ce frein peut ralentir la progression vers l\'emploi sans action ciblée.',
            `Données mobilisées: ${frein}, nombre de freins ${dossier?.nombreFreins || 0}.`,
            'Élevé'
          )
        )
      : [
          makeRecommandation(
            'Confirmer l\'absence de freins structurants.',
            'Une validation explicite évite de sous-estimer des obstacles non formalisés.',
            'Données mobilisées: aucun frein explicite dans le dossier.',
            'Faible'
          ),
        ]

  const prestationsData =
    prestationsAnalyse.length > 0
      ? prestationsAnalyse.map((item) => {
          const nom = item.libelle
          const pourquoi = item.justification
          return makeRecommandation(
            nom,
            pourquoi || 'La prestation est cohérente avec les besoins identifiés dans le dossier.',
            `Données mobilisées: projet professionnel ${dossier?.projetProfessionnel || 'à clarifier'}, recherche d'emploi ${dossier?.rechercheEmploi || 'non précisée'}.`,
            pourquoi ? 'Élevé' : 'Moyen'
          )
        })
      : [
          makeRecommandation(
            'Aucune prestation prioritaire automatique.',
            'Le moteur n\'identifie pas de prescription immédiate à ce stade.',
            'Données mobilisées: niveau de priorité, projet et freins actuels.',
            'Moyen'
          ),
        ]

  const partenairesData =
    partenairesDecision.length > 0
      ? partenairesDecision.map((partenaire) =>
          makeRecommandation(
            partenaire.nom,
            'Le partenaire est mobilisable pour traiter les freins périphériques ou accélérer la mise en relation.',
            `Données mobilisées: scénario final, partenaire ${partenaire.nom}.`,
            'Élevé'
          )
        )
      : [
          makeRecommandation(
            'Évaluer Mission Locale, Cap Emploi ou Collectivité de Corse selon la situation.',
            'Une mobilisation partenaire peut sécuriser la levée de freins non couverts en interne.',
            `Données mobilisées: mobilité ${dossier?.mobilite || 'non précisée'}, freins ${dossier?.nombreFreins || 0}.`,
            'Moyen'
          ),
        ]

  const assistantExpertAnalyse = {
    analyseGlobale: [
      makeRecommandation(
        `Le dossier présente une priorité ${analyse?.priorite || 'non définie'} avec un score métier de ${analyse?.score ?? 0}.`,
        'La combinaison des signaux administratifs, du projet et des freins guide ce niveau de vigilance.',
        `Données mobilisées: portefeuille ${dossier?.portefeuille || 'non renseigné'}, recherche ${dossier?.rechercheEmploi || 'non précisée'}, nombreFreins ${dossier?.nombreFreins || 0}.`,
        'Élevé'
      ),
    ],
    pointsForts: pointsFortsData,
    freinsPrincipaux: freinsData,
    pointsVigilance: [
      makeRecommandation(
        analyse?.alertes?.length > 0 ? analyse.alertes.join(' ; ') : 'Aucune alerte bloquante immédiate détectée.',
        'Les points de vigilance doivent être revus à chaque entretien pour éviter les ruptures de parcours.',
        `Données mobilisées: alertes moteur (${(analyse?.alertes || []).length}), DPA ${dossier?.dpaRealisee ? 'réalisée' : 'non réalisée'}.`,
        (analyse?.alertes || []).length > 0 ? 'Élevé' : 'Moyen'
      ),
    ],
    opportunites: [
      makeRecommandation(
        dossier?.projetProfessionnel
          ? `Consolider le projet ${dossier.projetProfessionnel} via des étapes mesurables.`
          : 'Transformer la phase de clarification projet en opportunité de repositionnement métier.',
        'Une stratégie explicite permet d\'aligner prestations, partenaires et rythme de suivi.',
        `Données mobilisées: projet professionnel ${dossier?.projetProfessionnel || 'non renseigné'}, formations ${dossier?.formations?.length || 0}.`,
        'Moyen'
      ),
    ],
    prestationsEnvisageables: prestationsData,
    partenairesMobilisables: partenairesData,
    pistesAccompagnement: [
      makeRecommandation(
        `Structurer un accompagnement ${decision?.typeAccompagnement || dossier?.portefeuille || 'à préciser'} avec une fréquence ${decision?.frequenceSuivi || 'à définir'}.`,
        'Le pilotage de l\'intensité d\'accompagnement conditionne la progression sur les objectifs court terme.',
        `Données mobilisées: type d'accompagnement, fréquence de suivi, freins restants ${freins.length}.`,
        'Moyen'
      ),
    ],
    questionsApprofondir: [
      ...(analyse?.questions || []).map((question) =>
        makeRecommandation(
          question,
          'La question aide à objectiver les freins et à sécuriser la décision du conseiller.',
          `Données mobilisées: questions générées par le moteur expert, contexte ${dossier?.rechercheEmploi || 'non précisé'}.`,
          'Moyen'
        )
      ),
      makeRecommandation(
        'Quels éléments justifient la décision envisagée et quels indicateurs permettront de mesurer son effet ? ',
        'Cette vérification maintient la posture d\'aide à la décision sans automatisme.',
        'Données mobilisées: décisions prises, plan d\'actions et échéance du prochain suivi.',
        'Élevé'
      ),
    ],
    controlesAvantCloture: [
      ...(analyse?.verifications || []).map((verification) =>
        makeRecommandation(
          verification,
          'Le contrôle est requis pour garantir la conformité du dossier avant clôture.',
          `Données mobilisées: vérifications moteur expert, statut CE ${dossier?.contratEngagement || 'non renseigné'}.`,
          'Élevé'
        )
      ),
      makeRecommandation(
        'Vérifier la cohérence MAP, date de suivi, prestations et justification des orientations partenaires.',
        'Ces éléments sont critiques pour éviter une clôture incomplète.',
        'Données mobilisées: simulateur de décisions, compte rendu intelligent et synthèse.',
        'Élevé'
      ),
    ],
  }

  return {
    freins,
    atouts,
    prestationsDossier,
    prestationsAnalyse,
    partenairesAnalyse,
    actionsAnalyse,
    partenairesDecision,
    partenairesMobilises,
    analyse360Cards,
    syntheseAnalyse360,
    syntheseComplete,
    compteRenduAuto,
    assistantExpertAnalyse,
  }
}
