import { portefeuillesCorse } from './configurationCorse'

const DESCRIPTIONS = {
  'Mutualisé': 'Portefeuille principal d’attente regroupant notamment les nouveaux inscrits, les demandeurs sans référent attribué et les contrats d’engagement restant à formaliser.',
  EM: 'Portefeuille EM orienté retour rapide à l’emploi.',
  Intensif: 'Portefeuille Intensif avec accompagnement rapproché.',
  SP: 'Portefeuille SP (Socio-Professionnel) pour situations nécessitant un suivi individualisé.',
  GLO: 'Portefeuille Global pour coordonner les freins sociaux et professionnels.',
  TH: 'Portefeuille TH pour l’accompagnement des travailleurs handicapés.',
  PP: 'Portefeuille PP pour les parcours en pré-orientation ou transition ciblée.',
  CEJ: 'Portefeuille CEJ pour l’accompagnement intensif des jeunes.',
}

export const portefeuilles = portefeuillesCorse.map((nom, index) => ({
  id: index + 1,
  nom,
  description: DESCRIPTIONS[nom] || `Portefeuille ${nom} - référentiel Corse.`,
  actif: true,
}))
