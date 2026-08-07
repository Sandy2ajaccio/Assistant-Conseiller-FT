// Registre des barèmes régionaux de sanctions (procédure M6).
//
// Objectif : permettre de choisir la région applicable sans jamais calculer
// automatiquement un taux ou une durée de sanction. Chaque entrée pointe vers
// un référentiel visuel conservé dans docs/referentiels/ à consulter par le
// conseiller ; l'ajout d'une région se fait uniquement en complétant ce
// registre, sans modifier la logique des alertes.

export const REGION_NON_DEFINIE = 'a-definir'

export const REGISTRE_BAREMES_REGIONAUX = [
  {
    value: REGION_NON_DEFINIE,
    label: 'Région à définir',
    disponible: false,
    referentiel: null,
  },
  {
    value: 'corse',
    label: 'Corse',
    disponible: true,
    referentiel: {
      label: 'Barème de sanction Corse — applicable au 1er juin 2025 (hors RSA et RSA)',
      chemin: 'docs/referentiels/Bareme_sanctions_Corse_2025-06-01.jpg',
      dateApplication: '2025-06-01',
    },
  },
  // Ajouter ici les prochaines régions au fur et à mesure de la réception
  // des barèmes correspondants, par exemple :
  // {
  //   value: 'paca',
  //   label: 'Provence-Alpes-Côte d’Azur',
  //   disponible: true,
  //   referentiel: { label: '…', chemin: 'docs/referentiels/…', dateApplication: '…' },
  // },
]

const REGION_STORAGE_KEY = 'cap-decision:region-bareme'

export const getRegionBareme = (value) => (
  REGISTRE_BAREMES_REGIONAUX.find((item) => item.value === value)
    || REGISTRE_BAREMES_REGIONAUX.find((item) => item.value === REGION_NON_DEFINIE)
)

export const regionBaremeExiste = (value) => (
  REGISTRE_BAREMES_REGIONAUX.some((item) => item.value === value)
)

export const listerRegionsDisponibles = () => (
  REGISTRE_BAREMES_REGIONAUX.filter((item) => item.disponible)
)

// Préférence globale : lue depuis localStorage, valable pour tous les
// dossiers du poste (pas de donnée personnelle du demandeur). Conservée
// volontairement en dehors de clearSensitiveLocalData — c'est un réglage
// d'application, pas une donnée de dossier.
export const lireRegionBaremePreferee = () => {
  if (typeof localStorage === 'undefined') return REGION_NON_DEFINIE
  const stored = localStorage.getItem(REGION_STORAGE_KEY)
  return regionBaremeExiste(stored) ? stored : REGION_NON_DEFINIE
}

export const ecrireRegionBaremePreferee = (value) => {
  if (typeof localStorage === 'undefined') return
  if (regionBaremeExiste(value)) {
    localStorage.setItem(REGION_STORAGE_KEY, value)
  } else {
    localStorage.removeItem(REGION_STORAGE_KEY)
  }
}
