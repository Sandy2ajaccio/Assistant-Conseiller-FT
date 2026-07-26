import { useMemo, useState } from 'react'

const ITEMS = [
  "DPA réalisée",
  "Contrat d'engagement renseigné",
  'Projet professionnel clarifié',
  'CV visible',
  "Recherche d'emploi abordée",
  'Prestations étudiées',
  'Ateliers étudiés',
  'Portefeuille vérifié',
  'Prochaine action définie',
  'Date du prochain suivi définie',
]

function VerificationAvantCloture() {
  const [checks, setChecks] = useState(() => Object.fromEntries(ITEMS.map((item) => [item, false])))

  const toutCoche = useMemo(() => ITEMS.every((item) => checks[item]), [checks])

  const onToggle = (item) => {
    setChecks((prev) => ({
      ...prev,
      [item]: !prev[item],
    }))
  }

  return (
    <section className="dashboard-card section-card">
      <div className="card-header">
        <h3>Vérification avant clôture</h3>
      </div>

      <div className="profile-list">
        {ITEMS.map((item) => (
          <div key={item}>
            <label>
              <input type="checkbox" checked={checks[item]} onChange={() => onToggle(item)} /> {item}
            </label>
          </div>
        ))}
      </div>

      <p
        style={{
          color: toutCoche ? '#166534' : '#92400e',
          background: toutCoche ? '#ecfdf5' : '#fffbeb',
          border: toutCoche ? '1px solid #bbf7d0' : '1px solid #fde68a',
          borderRadius: '0.85rem',
          padding: '0.75rem 0.9rem',
          fontWeight: 600,
          marginTop: '1rem',
        }}
      >
        {toutCoche
          ? 'Entretien prêt à être clôturé.'
          : 'Des éléments restent à vérifier avant la clôture.'}
      </p>

      <div className="action-buttons">
        <button type="button">Retour à l'entretien</button>
        <button type="button">Clôturer</button>
      </div>
    </section>
  )
}

export default VerificationAvantCloture
