export const partenaires = {
	jeunes: [
		{
			nom: "Mission Locale d'Ajaccio",
			public: ['16-25 ans', 'CEJ'],
			declencheurs: ['jeune', 'cej', 'premier emploi', 'décrochage scolaire'],
			documents: ['CV', "Pièce d'identité"],
			motifs: [
				'Jeune 16-25 ans',
				'CEJ',
				'Premier emploi',
				'Décrochage scolaire',
				'Formation',
				'Alternance',
				'Santé',
				'Logement',
				'Mobilité',
			],
		},
	],

	handicap: [
		{
			nom: 'Cap Emploi A Murza',
			public: ['RQTH', 'Handicap'],
			declencheurs: ['rqth', 'demande rqth', 'restriction médicale', 'maintien emploi'],
			documents: ['Notification RQTH', 'Avis médical si disponible', 'CV'],
			motifs: ['RQTH', 'Demande RQTH', 'Restriction médicale', "Maintien dans l'emploi", 'Emploi accompagné', 'Aménagement de poste'],
		},
	],

	rsa: [
		{
			nom: 'Collectivité de Corse - Service insertion',
			public: ['RSA'],
			declencheurs: ['rsa', 'insertion sociale'],
			documents: ['Attestation RSA', "Contrat d'engagement"],
			motifs: ['RSA', 'Accompagnement social', "Contrat d'engagement", 'Aides départementales'],
		},
	],

	formation: [
		{
			nom: 'AFPA Ajaccio',
			public: ['Formation', 'Reconversion'],
			declencheurs: ['formation', 'reconversion', 'remise à niveau'],
			documents: ['CV', 'Projet professionnel', 'Prescription France Travail'],
			motifs: ['Préqualification', 'Formation qualifiante', 'Remise à niveau', 'Reconversion', 'Métiers en tension'],
		},
	],

	creation: [
		{
			nom: 'BGE Corse',
			public: ["Création entreprise"],
			declencheurs: ['création entreprise', 'business plan'],
			documents: ['CV', 'Description du projet'],
			motifs: ['Étude de faisabilité', 'Business plan', "Création d'entreprise", 'Financement'],
		},
		{
			nom: 'ADIE',
			public: ["Création entreprise", 'Création activité'],
			declencheurs: ['microcrédit', 'financement'],
			documents: ['Projet', 'Plan de financement'],
			motifs: ['Microcrédit', "Création d'activité", 'Travailleur indépendant'],
		},
		{
			nom: 'CCI Corse-du-Sud',
			public: ["Création entreprise", 'Commerce', 'Industrie'],
			declencheurs: ['commerce', 'industrie', 'services'],
			documents: ['Projet', 'Business plan'],
			motifs: ['Commerce', 'Industrie', 'Services', 'Formalités'],
		},
		{
			nom: 'Chambre de Métiers',
			public: ["Création entreprise", 'Artisanat'],
			declencheurs: ['artisanat', 'apprentissage'],
			documents: ['Projet', 'Business plan'],
			motifs: ['Artisanat', 'Création', 'Transmission', 'Apprentissage'],
		},
		{
			nom: 'A Prova',
			public: ["Création entreprise", 'CAE'],
			declencheurs: ['test activité', 'cae'],
			documents: ["Description de l'activité"],
			motifs: ['CAE', 'Tester une activité', 'Portage entrepreneurial'],
		},
	],

	iae: [
		{
			nom: 'Iniziativa',
			public: ['IAE', 'RSA'],
			declencheurs: ['iae', 'insertion', 'remobilisation'],
			documents: ['CV', 'Projet professionnel'],
			motifs: ['ACI', 'Insertion', 'Remobilisation'],
		},
		{
			nom: 'Recyclerie du Grand Ajaccio - CREATIVU',
			public: ['IAE', 'Insertion'],
			declencheurs: ['iae', 'aci', 'insertion'],
			documents: ['CV', 'Projet professionnel'],
			motifs: ['ACI', 'Insertion'],
		},
		{
			nom: 'Sud Corse Insertion',
			public: ['IAE', 'Insertion'],
			declencheurs: ['iae', 'insertion'],
			documents: ['CV', 'Projet professionnel'],
			motifs: ['Insertion'],
		},
	],

	orientation: [
		{
			nom: 'Corsica Orientazione',
			public: ['Orientation', 'Formation'],
			declencheurs: ['orientation', 'découverte métiers'],
			documents: ['Aucun document obligatoire'],
			motifs: ['Découverte métiers', 'Recherche formation', 'Débouchés', 'Orientation'],
		},
	],
}

// Exports de compatibilité pour les écrans existants.
const flatPartenaires = Object.entries(partenaires).flatMap(([domaine, items]) =>
	items.map((item, index) => ({
		id: `PA-${domaine.toUpperCase()}-${index + 1}`,
		nom: item.nom,
		role: `Partenaire du domaine ${domaine}.`,
		public: domaine,
		vigilance: item.motifs[0] || 'Aucune vigilance',
		description: item.motifs.join(' | '),
	})),
)

export const connaissancesPartenaires = flatPartenaires.map((item) => ({
	id: item.id,
	nom: item.nom,
	description: item.description,
}))

export const partenairesCorse = flatPartenaires
