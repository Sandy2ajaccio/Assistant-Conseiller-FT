import { REFERENTIEL_METIER } from '../data/referentielMetier'

const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')

const asArray = (value) => (Array.isArray(value) ? value : [])

const getSectionByName = (nomSection) => REFERENTIEL_METIER[String(nomSection || '')] || []

const findById = (sectionName, id) => getSectionByName(sectionName).find((item) => item.id === id) || null

const searchInItem = (item, texteNormalise) => {
  if (!item) {
    return false
  }

  return Object.values(item).some((value) => {
    if (Array.isArray(value)) {
      return value.some((entry) => normalize(entry).includes(texteNormalise))
    }

    if (value && typeof value === 'object') {
      return searchInItem(value, texteNormalise)
    }

    return normalize(value).includes(texteNormalise)
  })
}

export const getReferentielSection = (nomSection) => getSectionByName(nomSection)

export const getProjet = (id) => findById('projetsProfessionnels', id)
export const getFrein = (id) => findById('freins', id)
export const getSavoirEtre = (id) => findById('savoirEtre', id)
export const getCategorieDE = (id) => findById('categoriesDE', id)
export const getParcours = (id) => findById('parcours', id)
export const getPortefeuille = (id) => findById('portefeuilles', id)
export const getOrientation = (id) => findById('orientations', id)
export const getPrestation = (id) => findById('prestations', id)
export const getAtelier = (id) => findById('ateliers', id)
export const getFormation = (id) => findById('formations', id)
export const getPartenaire = (id) => findById('partenaires', id)
export const getPMSMP = (id) => findById('pmsmp', id)
export const getIAE = (id) => findById('iae', id)
export const getRemuneration = (id) => findById('remunerationFormation', id)

export const searchReferentiel = (texte) => {
  const recherche = normalize(texte)

  if (!recherche) {
    return Object.fromEntries(
      Object.keys(REFERENTIEL_METIER).map((section) => [section, []]),
    )
  }

  return Object.fromEntries(
    Object.entries(REFERENTIEL_METIER).map(([section, items]) => [
      section,
      asArray(items).filter((item) => searchInItem(item, recherche)),
    ]),
  )
}
