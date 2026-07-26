import { ateliersOffreServiceCorse } from '../data/offreServiceCorse'

export const connaissancesAteliers = ateliersOffreServiceCorse.map((item) => ({
  id: item.id,
  nom: item.nom,
  description: item.objectif,
  objectif: item.objectif,
  public: item.public,
  duree: item.duree,
  intervenants: item.intervenants,
  prescription: item.prescription,
  conditions: [item.conditions],
  contreIndications: [],
  portefeuilles: [],
  prestationsAssociees: [],
  partenaires: [item.partenaire],
  questionsAvantPrescription: [
    'Le besoin correspond-il à l’objectif de cet atelier ?',
    'La personne est-elle disponible pour la durée annoncée ?',
    'Le chemin de prescription indiqué est-il accessible dans le dossier ?',
  ],
  documents: [],
  benefices: [item.objectif],
  commentaires: `Référentiel local Corse - ${item.localisation}.`,
}))

export const ateliersCorse = ateliersOffreServiceCorse.map((item) => ({
  id: item.id,
  nom: item.nom,
  objectif: item.objectif,
  public: item.public,
  duree: item.duree,
  intervenants: item.intervenants,
  prescription: item.prescription,
  vigilance: item.conditions,
}))
