import { useState } from 'react'
import { MenuItem, TextField, Typography } from '@mui/material'
import DecisionNotice from '../components/DecisionNotice'
import {
  REGISTRE_BAREMES_REGIONAUX,
  ecrireRegionBaremePreferee,
  getRegionBareme,
  lireRegionBaremePreferee,
} from '../data/regionsBareme'

function ParametresPage() {
  const [regionValue, setRegionValue] = useState(() => lireRegionBaremePreferee())
  const region = getRegionBareme(regionValue)

  const changerRegion = (event) => {
    const nextRegion = event.target.value
    setRegionValue(nextRegion)
    ecrireRegionBaremePreferee(nextRegion)
  }

  return (
    <section className="demandeur-page">
      <section className="page-card">
        <div className="page-title">
          <div>
            <h2>Paramètres</h2>
            <p>Configuration de Cap Décision FT côté frontend.</p>
            <span className="rgpd-badge">Analyse anonymisée – aide à la décision uniquement</span>
          </div>
        </div>
      </section>

      <DecisionNotice />

      <section className="dashboard-card section-card">
        <div className="card-header">
          <h3>Région du barème de sanctions</h3>
          <p>Réglage global : détermine le référentiel affiché dans le suivi des obligations M6 pour tous les dossiers de ce poste.</p>
        </div>

        <TextField
          select
          fullWidth
          size="small"
          label="Région applicable"
          value={regionValue}
          onChange={changerRegion}
          sx={{ maxWidth: 420 }}
        >
          {REGISTRE_BAREMES_REGIONAUX.map((item) => (
            <MenuItem key={item.value} value={item.value} disabled={!item.disponible && item.value !== regionValue}>
              {item.label}{!item.disponible ? ' (barème non disponible)' : ''}
            </MenuItem>
          ))}
        </TextField>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          {region.disponible
            ? `Référentiel actif : ${region.referentiel.label} (${region.referentiel.chemin}).`
            : 'Aucun barème régional sélectionné pour le moment. Les alertes M6 restent limitées aux repères juridiques nationaux tant qu’une région n’est pas choisie.'}
        </Typography>

        <ul className="list-card">
          <li>Ce réglage ne calcule jamais un taux ou une durée de sanction.</li>
          <li>D’autres régions seront ajoutées au fur et à mesure de la réception des barèmes correspondants.</li>
        </ul>
      </section>

      <section className="dashboard-card section-card">
        <div className="card-header">
          <h3>Authentification Google</h3>
          <p>Connexion sécurisée via Firebase Authentication, réservée au compte propriétaire du logiciel.</p>
        </div>

        <ul className="list-card">
          <li>Connexion directe par justificatif Google transmis à Firebase (sans fenêtre ni redirection intermédiaire).</li>
          <li>Accès limité à l’adresse propriétaire configurée dans l’application.</li>
        </ul>
      </section>

      <section className="dashboard-card section-card">
        <div className="card-header">
          <h3>Règles RGPD</h3>
          <p>Le module n’accepte que les données anonymisées utiles à l’analyse métier.</p>
        </div>
      </section>
    </section>
  )
}

export default ParametresPage
