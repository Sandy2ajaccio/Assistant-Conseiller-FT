import { ateliersOffreServiceCorse, prestationsOffreServiceCorse } from './offreServiceCorse'

export const portefeuillesCorse = [
  'Mutualisé',
  'EM',
  'Intensif',
  'SP',
  'GLO',
  'TH',
  'PP',
  'CEJ',
]

export const ateliersCorse = [
  'Création CV',
  'Les bonnes pratiques CV',
  'Mon Marché du Travail',
  'Nouvellement inscrit : Droits et engagements',
  'Gestion des démarches',
  'PIX Emploi',
  'Focus Compétences',
  "Découvrez l'immersion facilitée",
  "Présentation Activ'Projet",
  "Les Lundis de l'entrepreneuriat",
  'Atelier 360',
  'Atelier 360 Seniors',
  ...ateliersOffreServiceCorse.map((item) => item.nom),
]

export const prestationsCorse = [
  "Activ'Projet",
  "Activ'Créa",
  'AIF',
  'AFC',
  'POEI',
  'PMSMP',
  'VAE',
  'Aide à la mobilité',
  'Pix Emploi',
  'CEJ',
  'Accompagnement Global',
  ...prestationsOffreServiceCorse.map((item) => item.nom),
]

export const partenairesCorse = [
  'Mission Locale',
  'Cap Emploi',
  'BGE Corse',
  'ADIE',
  'CitéLab',
  'Collectivité de Corse',
  'Organismes de formation',
]
