export const dpa = {
	objectifs: [
		'Accueillir le demandeur',
		'Realiser le diagnostic',
		'Identifier les besoins',
		"Construire le plan d'action",
		"Formaliser le contrat d'engagement",
	],
	informationsObligatoires: [
		'Situation administrative',
		'Situation professionnelle',
		'Projet professionnel',
		"Recherche d'emploi",
		'Mobilite',
		'Disponibilite',
		'Ressources',
		'Freins',
	],
	freins: ['Mobilite', 'Sante', 'Logement', 'Numerique', 'Budget', "Garde d'enfant", 'Justice', 'Langue'],
	ressources: ['Diplomes', 'Experience', 'Permis', 'Vehicule', 'Reseau', 'Competences', 'Motivation'],
	pointsVigilance: [
		'DPA non realisee',
		'Projet peu defini',
		"Recherche d'emploi insuffisante",
		'CV absent',
		'Freins multiples',
		"Contrat d'engagement non signe",
	],
	actionsPossibles: [
		'Realiser la DPA',
		'Programmer un entretien',
		'Proposer un atelier',
		'Prescrire une prestation',
		'Orienter vers un partenaire',
		"Definir un plan d'action",
	],
};

export const premierEntretien = {
	contexte: 'Cadre de reference du premier entretien France Travail Corse.',
	objectifs: [
		'Installer la relation de service et expliciter les engagements reciproques.',
		"Qualifier la situation socio-professionnelle et les freins a l'emploi.",
		"Definir un plan d'action immediat avec priorites partagees.",
	],
	piecesACollecter: [
		'CV a jour ou trame de CV en cours.',
		'Pieces justificatives utiles a la situation administrative.',
		"Elements de preuve de recherche d'emploi deja realisee.",
	],
	pointsDeVigilance: [
		'Verifier la disponibilite reelle du demandeur et les contraintes mobilite.',
		'Identifier rapidement les besoins sante, logement, garde ou numerique.',
		"Tracer clairement les actions attendues avant le prochain entretien.",
	],
	actionsImmediates: [
		'Positionner sur un atelier de remobilisation ou de techniques de recherche.',
		'Orienter vers une prestation adaptee au projet professionnel.',
		'Planifier un point de suivi sous 4 a 6 semaines selon le portefeuille.',
	],
	indicateurs: {
		delaiPremierRendezVous: 'Inferieur a 15 jours apres inscription.',
		tracabilitePlanAction: "Plan d'action formalise dans le dossier.",
		convocationSuivi: "Date de suivi fixee avant cloture de l'entretien.",
	},
};

export const creu = {
	intitule: "Controle de la Recherche d'Emploi et des Usages",
	objectif: "Verifier la realite des demarches et soutenir la dynamique de retour a l'emploi.",
	publicPrioritaire: [
		'Demandeurs sans demarche recente visible.',
		'Demandeurs avec ecarts repetes entre engagements et actions realisees.',
		'Situations signalees a risque de rupture de parcours.',
	],
	verifications: [
		'Demarches de candidature coherentes avec le projet cible.',
		"Presence d'actions de recherche sur la periode observee.",
		"Participation aux actions prevues dans le plan d'action.",
		"Mise a jour du profil et disponibilite a l'emploi.",
	],
	justificatifsAdmis: [
		'Copies de candidatures et reponses employeurs.',
		'Attestations de participation ateliers, forums ou recrutements.',
		'Preuves de demarches numeriques et prises de contact.',
	],
	suiteAReserver: [
		'Rappel des obligations et formalisation des attendus.',
		'Orientation vers accompagnement renforce si freins identifies.',
		'Signalement pour examen contradictoire en cas de manquement persistant.',
	],
};

export const reglesMetier = [
	{
		id: "RM-01",
		titre: "Premier entretien prioritaire RSA",
		description: "Tout allocataire RSA nouvellement accompagne doit avoir un premier entretien trace.",
		vigilance: "Planifier rapidement le rendez-vous et formaliser le plan d'action initial.",
	},
	{
		id: "RM-02",
		titre: "Controle des engagements CREU",
		description: "Les engagements du dossier doivent etre appuyes par des preuves de demarches recentes.",
		vigilance: "Verifier candidatures, actions prevues et coherence du suivi.",
	},
	{
		id: "RM-03",
		titre: "Orientation TH coordonnee",
		description: "Les situations handicap relevent d'une coordination France Travail et Cap Emploi.",
		vigilance: "S'assurer de l'adaptation du parcours et des relais specialises.",
	},
	{
		id: "RM-04",
		titre: "Jeunes CEJ en rythme soutenu",
		description: "Le parcours CEJ impose un volume regulier d'activites et de suivi.",
		vigilance: "Tracer les activites, justificatifs et ajustements de parcours.",
	},
	{
		id: "RM-05",
		titre: "Accompagnement global synchronise",
		description: "Le portefeuille global exige une coordination continue emploi et social.",
		vigilance: "Partager les plans d'action entre partenaires sans perte d'information.",
	},
	{
		id: "RM-06",
		titre: "entrepriseEtFormation",
		description:
			"La presence d'une entreprise ou d'une activite independante ne doit jamais provoquer un refus automatique d'aide a la formation.",
		vigilance:
			"Verifier l'inscription comme demandeur d'emploi ; le caractere principal ou secondaire de l'activite ; la coherence de la formation avec le projet ; le chiffre d'affaires ou l'activite reelle si l'information est disponible ; le financeur competent (CPF, AIF, Region, fonds de formation des independants ou autofinancement) ; la validation du conseiller et les regles locales applicables. Entreprise en activite detectee : verifier l'eligibilite et le financeur competent avant toute prescription de formation. La presence d'une entreprise ne constitue pas, a elle seule, un motif automatique de refus.",
	},
];
