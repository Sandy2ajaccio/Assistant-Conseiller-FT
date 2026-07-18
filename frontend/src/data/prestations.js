import { prestationsCorse } from './configurationCorse'

export const prestations = prestationsCorse.map((nom, index) => ({
  id: index + 1,
  nom,
  description: `Prestation ${nom} - référentiel Corse.`,
}))
