import { apiGet } from './apiClient'
import { API_ROUTES } from './apiRoutes'

export async function fetchPortefeuilles() {
  return apiGet(API_ROUTES.portefeuille)
}

export async function fetchDemandes() {
  return apiGet(API_ROUTES.dossiersDemandeurs)
}
