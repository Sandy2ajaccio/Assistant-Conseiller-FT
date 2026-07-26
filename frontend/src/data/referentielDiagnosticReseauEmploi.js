export const referentielDiagnosticReseauEmploi = {
  source: 'Référentiel de diagnostic du Réseau pour l’emploi',
  principe: 'Identifier les aspirations professionnelles, leur degré de précision et leur cohérence avec la situation de la personne et le marché du travail.',
  projetProfessionnel: [
    {
      id: 'choisir-metier',
      label: 'Choisir un métier',
      criteres: ['Identifier ses points forts et ses compétences', 'Connaître les opportunités d’emploi', 'Découvrir un métier ou un secteur', 'Confirmer son choix de métier'],
      motifs: [/projet non defini|sans projet|ne sait pas|hesite|choisir.*metier|decouvrir.*metier|secteur|competence|point fort/],
      question: 'Quel métier ou secteur souhaitez-vous explorer, et quelles compétences pensez-vous pouvoir y transférer ?',
    },
    {
      id: 'se-former',
      label: 'Se former',
      criteres: ['Trouver sa formation', 'Monter son dossier de formation', 'Utiliser le numérique'],
      motifs: [/formation|se former|reconversion|dossier.*formation/],
      question: 'Le métier visé et les conditions d’accès à la formation sont-ils déjà confirmés ?',
    },
    {
      id: 'preparer-candidature',
      label: 'Préparer sa candidature',
      criteres: ['Valoriser ses compétences', 'Réaliser un CV ou une lettre de motivation', 'Développer son réseau', 'Organiser ses démarches'],
      motifs: [/cv|lettre.*motivation|candidature|valoriser|reseau|demarche.*emploi/],
      question: 'Quels outils de candidature sont déjà prêts et quelles expériences doivent être valorisées ?',
    },
    {
      id: 'trouver-emploi',
      label: 'Trouver un emploi',
      criteres: ['Répondre à des offres', 'Faire des candidatures spontanées', 'Suivre et relancer', 'Convaincre en entretien'],
      motifs: [/recherche.*emploi|trouver.*emploi|offre.*emploi|candidature spontanee|entretien.*recrut|relance/],
      question: 'Quelles démarches de recherche sont réalisées, suivies et relancées chaque semaine ?',
    },
    {
      id: 'creer-entreprise',
      label: 'Créer une entreprise',
      criteres: ['Définir son projet de création', 'Structurer son projet', 'Développer son entreprise'],
      motifs: [/creation.*entreprise|creer.*entreprise|entreprene|reprendre.*entreprise/],
      question: 'L’idée de création est-elle définie, réaliste et compatible avec la situation actuelle ?',
    },
    {
      id: 'international',
      label: 'S’ouvrir à l’international',
      criteres: ['Connaître les opportunités à l’étranger', 'S’informer sur les aides', 'Organiser son retour en France'],
      motifs: [/international|etranger|expatri|retour.*france|mobilite internationale/],
      question: 'Quel pays est visé et quelles conditions d’emploi, aides ou démarches restent à vérifier ?',
    },
  ],
  contraintesPersonnelles: [
    { id: 'numerique', label: 'Accéder au numérique et en maîtriser les fondamentaux', motifs: [/numerique|informatique|ordinateur|internet|pas d.?aisance/], question: 'La personne peut-elle accéder à son espace personnel, utiliser sa messagerie et déposer un document ?' },
    { id: 'mobilite', label: 'Développer sa mobilité', motifs: [/mobilite|transport|vehicule|permis|deplacement/], question: 'Quels lieux, horaires et moyens de transport sont réellement accessibles ?' },
    { id: 'famille', label: 'Surmonter ses contraintes familiales', motifs: [/enfant|garde|creche|aidant|famil/], question: 'Quelle solution familiale ou de garde permettrait de suivre une action aux horaires prévus ?' },
    { id: 'sante', label: 'Prendre en compte son état de santé', motifs: [/sante|rqth|handicap|restriction|amenagement/], question: 'Quelles restrictions ou adaptations doivent être prises en compte avec l’accord de la personne ?' },
    { id: 'savoirs-base', label: 'Développer ses capacités en lecture, écriture et calcul', motifs: [/lecture|ecriture|calcul|illettr|savoirs?.*base|francais/], question: 'La lecture, l’écriture ou le calcul limitent-ils certaines démarches ou certains métiers ?' },
    { id: 'logement', label: 'Faire face à des difficultés de logement', motifs: [/logement|heberg|sans domicile|expulsion/], question: 'La situation de logement est-elle suffisamment stable pour engager les démarches prévues ?' },
    { id: 'finances', label: 'Faire face à des difficultés financières', motifs: [/financ|dette|budget|rsa|ressource/], question: 'Quelles difficultés financières ont un effet immédiat sur la disponibilité ou les démarches ?' },
    { id: 'administratif', label: 'Faire face à des difficultés administratives ou juridiques', motifs: [/administr|jurid|papier|titre de sejour|droit|contentieux/], question: 'Quelle démarche administrative ou juridique doit être sécurisée en priorité ?' },
  ],
}

export function analyserAvecReferentielReseauEmploi(texteSource = '') {
  const texte = `${texteSource}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  const objectifs = referentielDiagnosticReseauEmploi.projetProfessionnel
    .filter((item) => item.motifs.some((motif) => motif.test(texte)))
  const contraintes = referentielDiagnosticReseauEmploi.contraintesPersonnelles
    .filter((item) => item.motifs.some((motif) => motif.test(texte)))

  return {
    objectifs,
    contraintes,
    questions: [...objectifs, ...contraintes].map((item) => item.question),
  }
}
