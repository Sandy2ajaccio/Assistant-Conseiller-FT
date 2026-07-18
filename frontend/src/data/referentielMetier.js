export const REFERENTIEL_METIER = {
  projetsProfessionnels: [
    {
      id: 'projet-flou',
      libelle: 'Projet flou',
      description: 'Projet professionnel à clarifier avant toute orientation plus engageante.',
    },
    {
      id: 'projet-valide',
      libelle: 'Projet valide',
      description: 'Projet cohérent avec le profil et prêt à être mis en action.',
    },
    {
      id: 'besoin-formation',
      libelle: 'Besoin de formation',
      description: 'Projet identifié mais nécessitant une montée en compétences.',
    },
    {
      id: 'creation-entreprise',
      libelle: 'Création entreprise',
      description: 'Projet entrepreneurial ou de reprise d activité.',
    },
    {
      id: 'rsa',
      libelle: 'RSA',
      description: 'Situation nécessitant un accompagnement social et professionnel coordonné.',
    },
    {
      id: 'cej',
      libelle: 'CEJ',
      description: 'Parcours jeune avec besoin de rythme et d accompagnement renforcé.',
    },
    {
      id: 'senior',
      libelle: 'Senior',
      description: 'Repositionnement professionnel avec valorisation de l expérience.',
    },
    {
      id: 'handicap',
      libelle: 'Handicap',
      description: 'Parcours à sécuriser au regard des restrictions et compensations nécessaires.',
    },
    {
      id: 'mobilite',
      libelle: 'Mobilité',
      description: 'Frein de déplacement impactant l accès à l emploi, à la formation ou aux démarches.',
    },
    {
      id: 'logement',
      libelle: 'Logement',
      description: 'Situation résidentielle instable ou fragile à traiter avant la reprise du parcours.',
    },
    {
      id: 'sante',
      libelle: 'Santé',
      description: 'Capacités d engagement à ajuster au regard de la situation de santé.',
    },
    {
      id: 'difficultes-numeriques',
      libelle: 'Difficultés numériques',
      description: 'Autonomie digitale insuffisante pour sécuriser les démarches.',
    },
    {
      id: 'absence-cv',
      libelle: 'Absence CV',
      description: 'Candidature freinée par l absence ou la faiblesse du CV.',
    },
    {
      id: 'recherche-emploi',
      libelle: 'Recherche emploi',
      description: 'Recherche active d emploi nécessitant méthode, ciblage et relances.',
    },
    {
      id: 'pmsmp',
      libelle: 'PMSMP',
      description: 'Projet à valider ou à confirmer par une immersion en milieu professionnel.',
    },
    {
      id: 'iae',
      libelle: 'IAE',
      description: 'Parcours d insertion par l activité économique.',
    },
    {
      id: 'reconversion',
      libelle: 'Reconversion',
      description: 'Transition professionnelle nécessitant une clarification du nouveau cap.',
    },
    {
      id: 'cadre',
      libelle: 'Cadre',
      description: 'Public cadre avec besoin de repositionnement qualifié.',
    },
    {
      id: 'francais-insuffisant',
      libelle: 'Français insuffisant',
      description: 'Maîtrise de la langue insuffisante pour sécuriser les démarches et l accès à l emploi.',
    },
  ],

  freins: [
    {
      id: 'frein-projet-professionnel',
      libelle: 'Projet professionnel',
      description: 'Projet non défini ou insuffisamment formalisé.',
    },
    {
      id: 'frein-competences',
      libelle: 'Compétences',
      description: 'Compétences insuffisantes au regard du projet visé.',
    },
    {
      id: 'frein-finances',
      libelle: 'Finances',
      description: 'Difficultés financières impactant le parcours.',
    },
    {
      id: 'frein-administratif',
      libelle: 'Administratif',
      description: 'Démarches administratives à sécuriser.',
    },
    {
      id: 'frein-mobilite',
      libelle: 'Mobilité',
      description: 'Déplacements insuffisamment sécurisés.',
    },
    {
      id: 'frein-logement',
      libelle: 'Logement',
      description: 'Stabilité résidentielle insuffisante.',
    },
    {
      id: 'frein-sante',
      libelle: 'Santé',
      description: 'Contraintes de santé à prendre en compte dans le parcours.',
    },
    {
      id: 'frein-handicap',
      libelle: 'Handicap',
      description: 'Situation de handicap ou restriction médicale à sécuriser.',
    },
    {
      id: 'frein-numerique',
      libelle: 'Compétences numériques',
      description: 'Autonomie numérique insuffisante.',
    },
    {
      id: 'frein-absence-cv',
      libelle: 'Absence de CV',
      description: 'Outil de candidature absent ou non exploitable.',
    },
    {
      id: 'frein-confiance',
      libelle: 'Confiance en soi',
      description: 'Manque d assurance dans la mobilisation du parcours.',
    },
    {
      id: 'frein-sociaux',
      libelle: 'Freins sociaux',
      description: 'Freins sociaux cumulés à traiter avec les bons relais.',
    },
    {
      id: 'frein-francais',
      libelle: 'Maitrise du français',
      description: 'Niveau de français insuffisant pour l autonomie dans les démarches.',
    },
    {
      id: 'frein-entreprise',
      libelle: 'Création entreprise',
      description: 'Frein lié à la structuration ou au financement du projet entrepreneurial.',
    },
    {
      id: 'frein-justice',
      libelle: 'Justice',
      description: 'Contraintes judiciaires pouvant affecter le parcours.',
    },
    {
      id: 'frein-addictions',
      libelle: 'Addictions',
      description: 'Situation d addiction à traiter avec relais spécialisés si nécessaire.',
    },
    {
      id: 'frein-longue-duree',
      libelle: 'Chômage de longue durée',
      description: 'Rupture prolongée nécessitant remobilisation et progressivité.',
    },
  ],

  savoirEtre: [],

  categoriesDE: [
    {
      id: 'cat-demandeur-emploi',
      libelle: 'Demandeur d emploi',
      description: 'Public inscrit ou accompagné dans le cadre de la recherche d emploi.',
    },
    {
      id: 'cat-rsa',
      libelle: 'Bénéficiaire RSA',
      description: 'Public bénéficiaire du RSA nécessitant souvent un accompagnement coordonné.',
    },
    {
      id: 'cat-jeune',
      libelle: 'Jeune 16-25 ans',
      description: 'Jeune relevant souvent d un accompagnement Mission Locale ou CEJ.',
    },
    {
      id: 'cat-cej',
      libelle: 'CEJ',
      description: 'Jeune engagé dans un contrat d engagement jeune.',
    },
    {
      id: 'cat-rqth',
      libelle: 'Travailleur handicapé',
      description: 'Public RQTH ou en demande de reconnaissance.',
    },
    {
      id: 'cat-senior',
      libelle: 'Senior',
      description: 'Public senior à repositionner sur le marché du travail.',
    },
    {
      id: 'cat-cadre',
      libelle: 'Cadre',
      description: 'Public cadre nécessitant un accompagnement qualifié.',
    },
    {
      id: 'cat-createur',
      libelle: 'Créateur',
      description: 'Public engagé dans un projet de création d activité.',
    },
    {
      id: 'cat-repreneur',
      libelle: 'Repreneur',
      description: 'Public engagé dans un projet de reprise d activité.',
    },
    {
      id: 'cat-salarie',
      libelle: 'Salarié',
      description: 'Public salarié concerné par une évolution ou une reconversion.',
    },
    {
      id: 'cat-artisan',
      libelle: 'Artisan',
      description: 'Public relevant de l artisanat ou d une activité artisanale.',
    },
    {
      id: 'cat-iae',
      libelle: 'IAE',
      description: 'Public orienté vers l insertion par l activité économique.',
    },
    {
      id: 'cat-rsa-social',
      libelle: 'RSA avec freins sociaux',
      description: 'Public RSA avec freins sociaux nécessitant un accompagnement global.',
    },
  ],

  parcours: [
    {
      id: 'parcours-dpa',
      libelle: 'DPA',
      description: 'Diagnostic et premier cadrage du parcours du demandeur.',
    },
    {
      id: 'parcours-premier-entretien',
      libelle: 'Premier entretien',
      description: 'Premier échange pour poser le diagnostic et les priorités.',
    },
    {
      id: 'parcours-suivi',
      libelle: 'Suivi d accompagnement',
      description: 'Parcours de suivi et de mobilisation des actions.',
    },
    {
      id: 'parcours-cej',
      libelle: 'CEJ',
      description: 'Parcours intensif dédié aux jeunes avec objectifs rapprochés.',
    },
    {
      id: 'parcours-formation',
      libelle: 'Formation',
      description: 'Parcours orienté vers l entrée en formation ou la montée en compétences.',
    },
    {
      id: 'parcours-pmsmp',
      libelle: 'PMSMP',
      description: 'Parcours de validation de projet par immersion en situation réelle.',
    },
    {
      id: 'parcours-iae',
      libelle: 'IAE',
      description: 'Parcours d insertion par l activité économique.',
    },
    {
      id: 'parcours-creation',
      libelle: 'Création d entreprise',
      description: 'Parcours d accompagnement à la création ou à la reprise d activité.',
    },
    {
      id: 'parcours-retour-emploi',
      libelle: 'Retour à l emploi',
      description: 'Parcours orienté vers le retour rapide ou sécurisé à l emploi.',
    },
    {
      id: 'parcours-global',
      libelle: 'Accompagnement global',
      description: 'Parcours coordonné entre freins sociaux et professionnels.',
    },
  ],

  portefeuilles: [
    {
      id: 'portefeuille-mutualise',
      libelle: 'Mutualisé',
      description: 'Portefeuille d attente regroupant les situations à ventiler ou à formaliser.',
    },
    {
      id: 'portefeuille-em',
      libelle: 'EM',
      description: 'Portefeuille orienté retour rapide à l emploi.',
    },
    {
      id: 'portefeuille-intensif',
      libelle: 'Intensif',
      description: 'Portefeuille avec accompagnement rapproché.',
    },
    {
      id: 'portefeuille-sp',
      libelle: 'SP',
      description: 'Portefeuille socio-professionnel pour situations nécessitant un suivi individualisé.',
    },
    {
      id: 'portefeuille-glo',
      libelle: 'GLO',
      description: 'Portefeuille global pour coordonner les freins sociaux et professionnels.',
    },
    {
      id: 'portefeuille-th',
      libelle: 'TH',
      description: 'Portefeuille dédié aux travailleurs handicapés.',
    },
    {
      id: 'portefeuille-pp',
      libelle: 'PP',
      description: 'Portefeuille de pré-orientation ou de transition ciblée.',
    },
    {
      id: 'portefeuille-cej',
      libelle: 'CEJ',
      description: 'Portefeuille pour l accompagnement intensif des jeunes.',
    },
  ],

  orientations: [
    {
      id: 'orientation-em',
      libelle: 'EM',
      description: 'Orientation vers l emploi direct et la recherche active.',
    },
    {
      id: 'orientation-pp',
      libelle: 'PP',
      description: 'Orientation en pré-orientation ou transition ciblée.',
    },
    {
      id: 'orientation-sp',
      libelle: 'SP',
      description: 'Orientation socio-professionnelle pour un suivi individualisé.',
    },
    {
      id: 'orientation-glo',
      libelle: 'GLO',
      description: 'Orientation globale lorsque les freins sociaux sont prégnants.',
    },
    {
      id: 'orientation-th',
      libelle: 'TH',
      description: 'Orientation spécifique handicap.',
    },
    {
      id: 'orientation-cej',
      libelle: 'CEJ',
      description: 'Orientation vers le contrat d engagement jeune.',
    },
    {
      id: 'orientation-iae',
      libelle: 'IAE',
      description: 'Orientation vers une structure d insertion par l activité économique.',
    },
  ],

  prestations: [
    {
      id: 'prestation-activ-projet',
      libelle: "Activ'Projet",
      description: 'Accompagnement à la clarification du projet professionnel.',
    },
    {
      id: 'prestation-activ-crea',
      libelle: "Activ'Créa",
      description: 'Accompagnement à la création ou reprise d activité.',
    },
    {
      id: 'prestation-aif',
      libelle: 'AIF',
      description: 'Aide individuelle au financement de la formation.',
    },
    {
      id: 'prestation-afc',
      libelle: 'AFC',
      description: 'Formation commandée ou prescrite dans le cadre de l emploi.',
    },
    {
      id: 'prestation-poei',
      libelle: 'POEI',
      description: 'Préparation opérationnelle à l emploi individuelle.',
    },
    {
      id: 'prestation-pmsmp',
      libelle: 'PMSMP',
      description: 'Période de mise en situation en milieu professionnel.',
    },
    {
      id: 'prestation-vae',
      libelle: 'VAE',
      description: 'Validation des acquis de l expérience.',
    },
    {
      id: 'prestation-mobilite',
      libelle: 'Aide à la mobilité',
      description: 'Appui pour lever un frein de déplacement.',
    },
    {
      id: 'prestation-pix-emploi',
      libelle: 'Pix Emploi',
      description: 'Appui aux usages numériques liés à l emploi.',
    },
    {
      id: 'prestation-cej',
      libelle: 'CEJ',
      description: 'Contrat d engagement jeune avec accompagnement renforcé.',
    },
    {
      id: 'prestation-accompagnement-global',
      libelle: 'Accompagnement Global',
      description: 'Accompagnement coordonné des freins sociaux et professionnels.',
    },
    {
      id: 'prestation-parcours-emploi-sante',
      libelle: 'Parcours Emploi Santé',
      description: 'Accompagnement pour les situations de santé freinant le retour à l emploi.',
    },
    {
      id: 'prestation-bilan-competences',
      libelle: 'Bilan de compétences',
      description: 'Clarification du projet et des compétences transférables.',
    },
    {
      id: 'prestation-prepa-competences',
      libelle: 'Prépa Compétences',
      description: 'Parcours de préparation à l entrée en formation.',
    },
    {
      id: 'prestation-preparation-formation',
      libelle: 'Préparation à la formation',
      description: 'Sécurisation des prérequis avant l entrée en formation.',
    },
    {
      id: 'prestation-immersion-pmsmp',
      libelle: 'Immersion professionnelle PMSMP',
      description: 'Découverte métier via une immersion en entreprise.',
    },
  ],

  ateliers: [
    {
      id: 'atelier-creation-cv',
      libelle: 'Création CV',
      description: 'Atelier d élaboration ou de remise à niveau du CV.',
    },
    {
      id: 'atelier-bonnes-pratiques-cv',
      libelle: 'Les bonnes pratiques CV',
      description: 'Atelier de sécurisation et de valorisation du CV.',
    },
    {
      id: 'atelier-marche-travail',
      libelle: 'Mon Marché du Travail',
      description: 'Atelier d exploration du marché et des métiers.',
    },
    {
      id: 'atelier-nouvellement-inscrit',
      libelle: 'Nouvellement inscrit : Droits et engagements',
      description: 'Atelier d accueil des nouveaux inscrits et de cadrage des engagements.',
    },
    {
      id: 'atelier-gestion-demarches',
      libelle: 'Gestion des démarches',
      description: 'Atelier d organisation des démarches et des suivis.',
    },
    {
      id: 'atelier-pix-emploi',
      libelle: 'PIX Emploi',
      description: 'Atelier d appui aux usages numériques pour l emploi.',
    },
    {
      id: 'atelier-focus-competences',
      libelle: 'Focus Compétences',
      description: 'Atelier de mise en valeur et de clarification des compétences.',
    },
    {
      id: 'atelier-immersion-facilitee',
      libelle: "Découvrez l'immersion facilitée",
      description: 'Atelier d information sur la PMSMP et l immersion.',
    },
    {
      id: 'atelier-presentation-activ-projet',
      libelle: "Présentation Activ'Projet",
      description: 'Atelier d information sur l accompagnement projet.',
    },
    {
      id: 'atelier-lundis-entrepreneuriat',
      libelle: "Les Lundis de l'entrepreneuriat",
      description: 'Atelier d appui à la création ou reprise d activité.',
    },
    {
      id: 'atelier-360',
      libelle: 'Atelier 360',
      description: 'Atelier de vision globale du parcours et des freins.',
    },
    {
      id: 'atelier-360-seniors',
      libelle: 'Atelier 360 Seniors',
      description: 'Atelier adapté au repositionnement des publics seniors.',
    },
  ],

  formations: [
    {
      id: 'formation-afpr',
      libelle: 'AFPR',
      description: 'Action de formation préalable au recrutement.',
    },
    {
      id: 'formation-poei',
      libelle: 'POEI',
      description: 'Préparation opérationnelle à l emploi individuelle.',
    },
    {
      id: 'formation-pmsmp',
      libelle: 'PMSMP',
      description: 'Période de mise en situation en milieu professionnel.',
    },
    {
      id: 'formation-activ-projet',
      libelle: "Activ'Projet",
      description: 'Accompagnement à la clarification du projet professionnel.',
    },
    {
      id: 'formation-activ-crea',
      libelle: "Activ'Créa",
      description: 'Accompagnement à la création ou reprise d activité.',
    },
    {
      id: 'formation-prepa-competences',
      libelle: 'Prépa Compétences',
      description: 'Parcours de remobilisation et construction de compétences.',
    },
    {
      id: 'formation-bilan-competences',
      libelle: 'Bilan de compétences',
      description: 'Clarification du projet et des compétences transférables.',
    },
    {
      id: 'formation-aif',
      libelle: 'AIF',
      description: 'Aide individuelle au financement de la formation.',
    },
    {
      id: 'formation-vae',
      libelle: 'VAE',
      description: 'Validation des acquis de l expérience.',
    },
    {
      id: 'formation-cej',
      libelle: 'CEJ',
      description: 'Contrat d engagement jeune avec accompagnement renforcé.',
    },
    {
      id: 'formation-mrs',
      libelle: 'MRS',
      description: 'Méthode de recrutement par simulation.',
    },
    {
      id: 'formation-immersion',
      libelle: 'Immersion',
      description: 'Découverte métier via immersion en entreprise.',
    },
    {
      id: 'formation-qualifiante',
      libelle: 'Formation qualifiante',
      description: 'Formation conduisant à une qualification ou à un titre.',
    },
    {
      id: 'formation-remise-a-niveau',
      libelle: 'Remise à niveau',
      description: 'Parcours de remise à niveau des savoirs ou compétences de base.',
    },
    {
      id: 'formation-remise-a-niveau-numerique',
      libelle: 'Remise à niveau numérique',
      description: 'Renforcement des compétences numériques de base.',
    },
    {
      id: 'formation-fle',
      libelle: 'FLE',
      description: 'Français langue étrangère pour les publics concernés.',
    },
    {
      id: 'formation-remise-a-niveau-linguistique',
      libelle: 'Remise à niveau linguistique',
      description: 'Renforcement des compétences en français.',
    },
    {
      id: 'formation-techniques-prospection',
      libelle: 'Techniques de prospection',
      description: 'Méthodes de recherche d emploi et de candidatures.',
    },
    {
      id: 'formation-positionnement-cadre',
      libelle: 'Positionnement marché cadre',
      description: 'Repositionnement stratégique pour les publics cadres.',
    },
    {
      id: 'formation-parcours-reconversion',
      libelle: 'Parcours de reconversion',
      description: 'Accompagnement des transitions professionnelles.',
    },
    {
      id: 'formation-remobilisation-qualification',
      libelle: 'Remobilisation vers qualification',
      description: 'Parcours de retour progressif vers la qualification.',
    },
    {
      id: 'formation-actualisation-competences',
      libelle: 'Actualisation compétences',
      description: 'Mise à jour des compétences au regard du marché local.',
    },
    {
      id: 'formation-adaptee',
      libelle: 'Formation adaptée',
      description: 'Formation adaptée à la situation de santé ou de handicap.',
    },
    {
      id: 'formation-mobilite-territoriale',
      libelle: 'Mobilité territoriale',
      description: 'Parcours de mobilité lié aux contraintes géographiques.',
    },
    {
      id: 'formation-stabilisation-parcours',
      libelle: 'Stabilisation de parcours',
      description: 'Sécurisation d un parcours avant une nouvelle étape.',
    },
    {
      id: 'formation-reprise-progressive',
      libelle: 'Reprise progressive',
      description: 'Reprise d activité ou de formation à rythme adapté.',
    },
    {
      id: 'formation-techniques-candidature',
      libelle: 'Techniques de candidature',
      description: 'Méthodes de candidature et de réponse aux offres.',
    },
    {
      id: 'formation-decouverte-metiers',
      libelle: 'Découverte métiers',
      description: 'Exploration de métiers et de secteurs d activité.',
    },
    {
      id: 'formation-initiation-gestion-entreprise',
      libelle: 'Initiation gestion entreprise',
      description: 'Premiers repères pour la création ou reprise d activité.',
    },
  ],

  partenaires: [
    {
      id: 'france-travail-ajaccio',
      libelle: 'France Travail Ajaccio',
      description: 'Accompagnement emploi, prescriptions, orientation et suivi de parcours sur Ajaccio.',
    },
    {
      id: 'cap-emploi-corse',
      libelle: 'Cap Emploi Corse',
      description: 'Appui spécialisé pour les personnes en situation de handicap en Corse-du-Sud.',
    },
    {
      id: 'mission-locale-ajaccio',
      libelle: 'Mission Locale Ajaccio',
      description: 'Accompagnement des jeunes de 16 à 25 ans sur le bassin d Ajaccio.',
    },
    {
      id: 'afpa-corse',
      libelle: 'AFPA Corse',
      description: 'Formation, qualification et préparation à la formation en Corse-du-Sud.',
    },
    {
      id: 'bge-corse',
      libelle: 'BGE Corse',
      description: 'Accompagnement à la création et à la structuration de projet entrepreneurial.',
    },
    {
      id: 'cibc-corse',
      libelle: 'CIBC Corse',
      description: 'Bilan de compétences et clarification des projets professionnels.',
    },
    {
      id: 'cidff-corse-du-sud',
      libelle: 'CIDFF Corse-du-Sud',
      description: 'Accès aux droits et accompagnement social en Corse-du-Sud.',
    },
    {
      id: 'carsat-corse',
      libelle: 'CARSAT Corse',
      description: 'Prévention, retraite et maintien de capacité.',
    },
    {
      id: 'caf-corse-du-sud',
      libelle: 'CAF Corse-du-Sud',
      description: 'Prestations familiales et accompagnement social des allocataires.',
    },
    {
      id: 'cpam-corse-du-sud',
      libelle: 'CPAM Corse-du-Sud',
      description: 'Droits maladie et parcours de soin.',
    },
    {
      id: 'mdph-corse',
      libelle: 'MDPH Corse',
      description: 'Reconnaissance du handicap, orientation et compensation.',
    },
    {
      id: 'collectivite-de-corse',
      libelle: 'Collectivité de Corse',
      description: 'Aides territoriales et coordination des politiques publiques.',
    },
    {
      id: 'cci-corse',
      libelle: "Chambre de Commerce et d'Industrie de Corse",
      description: 'Appui à la création, à la reprise et au développement économique.',
    },
    {
      id: 'cma-corse',
      libelle: "Chambre de Métiers et de l'Artisanat de Corse",
      description: 'Appui aux projets artisanaux, à la création et à la reprise.',
    },
    {
      id: 'structures-iae-corse-du-sud',
      libelle: 'Structures IAE Corse-du-Sud',
      description: 'Structures d insertion par l activité économique sur le territoire.',
    },
  ],

  pmsmp: [
    {
      id: 'pmsmp-immersion',
      libelle: 'Immersion professionnelle PMSMP',
      description: 'Découverte ou validation d un métier en situation réelle.',
    },
    {
      id: 'pmsmp-validation-projet',
      libelle: 'Validation de projet',
      description: 'Immersion mobilisée pour confirmer un projet professionnel.',
    },
    {
      id: 'pmsmp-decouverte-metier',
      libelle: 'Découverte métier',
      description: 'Immersion utilisée pour explorer un métier ou un secteur.',
    },
  ],

  iae: [
    {
      id: 'iae-pass-iae',
      libelle: 'PASS IAE',
      description: 'Orientation et accès à l insertion par l activité économique.',
    },
    {
      id: 'iae-orientation-siae',
      libelle: 'Orientation SIAE',
      description: 'Orientation vers une structure d insertion adaptée au public.',
    },
    {
      id: 'iae-structures-corse-du-sud',
      libelle: 'Structures IAE Corse-du-Sud',
      description: 'Structures locales mobilisables sur le territoire de Corse-du-Sud.',
    },
  ],

  remunerationFormation: [],

  map: [
    {
      id: 'map-clarifier-pistes-metier',
      libelle: 'Clarifier les pistes métier',
      description: 'Action de MAP issue du besoin de clarification du projet.',
    },
    {
      id: 'map-planifier-exploration-sectorielle',
      libelle: 'Planifier une exploration sectorielle',
      description: 'Action de MAP pour organiser les premières explorations métiers.',
    },
    {
      id: 'map-cibler-offres',
      libelle: 'Cibler les offres',
      description: 'Action de MAP pour concentrer la recherche sur des offres pertinentes.',
    },
    {
      id: 'map-planifier-candidatures-relances',
      libelle: 'Planifier des candidatures et relances',
      description: 'Action de MAP pour structurer la recherche active.',
    },
    {
      id: 'map-verifier-prerequis',
      libelle: 'Vérifier les prérequis',
      description: 'Action de MAP avant l entrée en formation ou en dispositif.',
    },
    {
      id: 'map-sequencer-entree-formation',
      libelle: 'Séquencer entrée en formation puis recherche',
      description: 'Action de MAP pour organiser la succession des étapes du parcours.',
    },
    {
      id: 'map-structurer-business-model',
      libelle: 'Structurer le business model',
      description: 'Action de MAP pour les projets de création ou de reprise.',
    },
    {
      id: 'map-verifier-viabilite-financement',
      libelle: 'Vérifier viabilité et financement',
      description: 'Action de MAP pour sécuriser les projets entrepreneuriaux.',
    },
    {
      id: 'map-coordonner-emploi-social',
      libelle: 'Coordonner emploi et social',
      description: 'Action de MAP pour les situations à freins multiples.',
    },
    {
      id: 'map-prioriser-levee-freins',
      libelle: 'Prioriser la levée des freins',
      description: 'Action de MAP pour traiter d abord les freins bloquants.',
    },
    {
      id: 'map-fixer-rythme-actions',
      libelle: 'Fixer un rythme d actions hebdomadaire',
      description: 'Action de MAP pour les parcours nécessitant un suivi intensif.',
    },
    {
      id: 'map-suivre-execution',
      libelle: 'Suivre l exécution des démarches',
      description: 'Action de MAP pour contrôler la mise en œuvre des actions prévues.',
    },
    {
      id: 'map-valoriser-experience',
      libelle: 'Valoriser l expérience',
      description: 'Action de MAP utile pour les publics seniors ou expérimentés.',
    },
    {
      id: 'map-adapter-strategie-candidature',
      libelle: 'Adapter la stratégie de candidature',
      description: 'Action de MAP pour renforcer l adéquation entre profil et marché.',
    },
    {
      id: 'map-evaluer-compensations',
      libelle: 'Évaluer les compensations nécessaires',
      description: 'Action de MAP pour les situations de handicap ou de santé.',
    },
    {
      id: 'map-coordonner-insertion-specialiste',
      libelle: 'Coordonner l insertion avec le partenaire spécialisé',
      description: 'Action de MAP pour l appui d un partenaire spécialisé.',
    },
    {
      id: 'map-solutions-transport',
      libelle: 'Identifier des solutions de transport',
      description: 'Action de MAP pour lever un frein de mobilité.',
    },
    {
      id: 'map-stabiliser-logement',
      libelle: 'Stabiliser la situation résidentielle',
      description: 'Action de MAP pour les situations de logement fragile.',
    },
    {
      id: 'map-coordonner-soin-insertion',
      libelle: 'Coordonner soin et insertion',
      description: 'Action de MAP pour les situations de santé nécessitant un rythme adapté.',
    },
    {
      id: 'map-renforcer-autonomie-numerique',
      libelle: 'Renforcer l autonomie numérique',
      description: 'Action de MAP pour sécuriser les démarches dématérialisées.',
    },
    {
      id: 'map-produire-cv-cible',
      libelle: 'Produire un CV cible',
      description: 'Action de MAP pour la mise à disposition d un CV exploitable.',
    },
    {
      id: 'map-organiser-prospection',
      libelle: 'Organiser la prospection',
      description: 'Action de MAP pour structurer les candidatures et les relances.',
    },
    {
      id: 'map-identifier-structure-accueil',
      libelle: 'Identifier une structure d accueil',
      description: 'Action de MAP pour une immersion ou une mise en situation.',
    },
    {
      id: 'map-verifier-eligibilite-iae',
      libelle: 'Vérifier l éligibilité IAE',
      description: 'Action de MAP pour orienter vers l insertion par l activité économique.',
    },
    {
      id: 'map-construire-progression-emploi',
      libelle: 'Construire une progression vers l emploi durable',
      description: 'Action de MAP pour structurer un passage vers l emploi durable.',
    },
  ],

  actionsConseillees: [
    {
      id: 'action-clarification-projet',
      libelle: 'Clarifier le projet professionnel',
      description: 'Action prioritaire lorsque le projet est flou ou hésitant.',
    },
    {
      id: 'action-mettre-a-jour-cv',
      libelle: 'Mettre à jour le CV',
      description: 'Action utile en cas d absence de CV ou de candidature faible.',
    },
    {
      id: 'action-preparer-entretien',
      libelle: 'Préparer l entretien',
      description: 'Action de préparation à l échange avec un employeur ou un partenaire.',
    },
    {
      id: 'action-lancer-recherche-active',
      libelle: 'Lancer une recherche active',
      description: 'Action pour les projets valides et les démarches de retour à l emploi.',
    },
    {
      id: 'action-verifier-prerequis',
      libelle: 'Vérifier les prérequis',
      description: 'Action utile avant l entrée en formation ou en dispositif.',
    },
    {
      id: 'action-securiser-financement',
      libelle: 'Sécuriser le financement',
      description: 'Action liée aux projets de formation ou de création d activité.',
    },
    {
      id: 'action-activer-pmsmp',
      libelle: 'Activer une PMSMP',
      description: 'Action pour valider un projet par immersion en entreprise.',
    },
    {
      id: 'action-orienter-mission-locale',
      libelle: 'Orienter vers la Mission Locale',
      description: 'Action pour les jeunes et les parcours CEJ.',
    },
    {
      id: 'action-orienter-cap-emploi',
      libelle: 'Orienter vers Cap Emploi',
      description: 'Action pour les situations de handicap ou de RQTH.',
    },
    {
      id: 'action-mobiliser-accompagnement-global',
      libelle: 'Mobiliser un accompagnement global',
      description: 'Action pour les situations avec freins sociaux et professionnels.',
    },
    {
      id: 'action-securiser-iae',
      libelle: 'Sécuriser un parcours IAE',
      description: 'Action pour une orientation vers l insertion par l activité économique.',
    },
    {
      id: 'action-structurer-projet-creation',
      libelle: 'Structurer un projet de création',
      description: 'Action pour les projets entrepreneuriaux ou de reprise.',
    },
    {
      id: 'action-valoriser-experience-senior',
      libelle: 'Valoriser l expérience senior',
      description: 'Action pour repositionner un profil expérimenté sur le marché local.',
    },
    {
      id: 'action-traiter-freins-sociaux',
      libelle: 'Traiter les freins sociaux',
      description: 'Action de coordination autour du logement, de la santé ou des finances.',
    },
    {
      id: 'action-renforcer-numerique',
      libelle: 'Renforcer l autonomie numérique',
      description: 'Action utile lorsque les démarches en ligne sont bloquantes.',
    },
  ],
}