export const VEILLE_DERNIERE_VERIFICATION = '26 juillet 2026'

export const sourcesOfficielles = [
  { nom: 'Légifrance', role: 'Lois, décrets et dates d’entrée en vigueur', url: 'https://www.legifrance.gouv.fr/' },
  { nom: 'Ministère du Travail', role: 'Actualités réglementaires et politiques de l’emploi', url: 'https://travail-emploi.gouv.fr/actualites-presse-et-outils/actualites-et-breves' },
  { nom: 'France Travail', role: 'Évolutions opérationnelles des dispositifs', url: 'https://www.francetravail.org/' },
  { nom: 'Service-Public.fr', role: 'Droits, obligations et démarches vérifiés', url: 'https://www.service-public.fr/particuliers/actualites' },
]

export const veilleOfficielle = [
  {
    id: 'loi-plein-emploi', niveau: 'Référence', categorie: 'Loi plein emploi',
    titre: 'Loi n° 2023-1196 du 18 décembre 2023 pour le plein emploi',
    resume: 'Le texte consolidé demeure la référence juridique centrale pour l’inscription, l’accompagnement et le contrat d’engagement.',
    impact: 'Avant de modifier une règle du logiciel, vérifier le texte consolidé et sa date d’entrée en vigueur.',
    dateSource: 'Texte consolidé consulté le 26 juillet 2026', source: 'Légifrance',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000048581935',
  },
  {
    id: 'sanctions-contrat-engagement', niveau: 'Vigilance', categorie: 'Contrat d’engagement',
    titre: 'Sanctions en cas de non-respect du contrat d’engagement',
    resume: 'Service-Public présente le régime de sanctions lié au non-respect des obligations prévues par le contrat d’engagement.',
    impact: 'Expliquer les obligations et tracer l’information donnée. Toute décision reste soumise aux procédures France Travail en vigueur.',
    dateSource: 'Information vérifiée le 26 juillet 2026', source: 'Service-Public.fr',
    url: 'https://www.service-public.fr/particuliers/actualites/A18302',
  },
  {
    id: 'effets-statistiques-2025', niveau: 'Information', categorie: 'Inscription',
    titre: 'Effets de la loi plein emploi sur les statistiques France Travail',
    resume: 'France Travail explique les changements de périmètre résultant notamment de l’inscription de nouveaux publics.',
    impact: 'Ne pas interpréter une variation du nombre d’inscrits sans tenir compte du nouveau périmètre. Cette information éclaire le pilotage, pas la décision individuelle.',
    dateSource: 'Publication France Travail 2025', source: 'France Travail',
    url: 'https://www.francetravail.org/accueil/actualites/2025/comprendre-les-effets-de-la-loi-plein-emploi-sur-les-statistiques-de-france-travail.html',
  },
  {
    id: 'handicap-2026', niveau: 'Nouveauté', categorie: 'Handicap',
    titre: 'Évolution de l’accompagnement des personnes en situation de handicap',
    resume: 'France Travail présente en 2026 la dynamique du rapprochement avec Cap emploi dans le cadre de la loi plein emploi.',
    impact: 'Pour une situation RQTH ou un besoin de compensation, vérifier les appuis mobilisables et la coordination avec Cap emploi avant de retenir une action.',
    dateSource: 'Publié le 21 mai 2026', source: 'France Travail',
    url: 'https://www.francetravail.org/accueil/communiques/2026/l-emploi-des-personnes-en-situation-de-handicap-une-dynamique-positive-en-2025-avec-une-augmentation-de-4-5-des-maintiens-dans-l.html',
  },
]
