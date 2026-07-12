import { useParams } from 'react-router-dom'

function FicheDemandeur() {
  const { id } = useParams()

  return (
    <section className="page-card">
      <div className="page-title">
        <div>
          <h2>Fiche demandeur</h2>
          <p>Détails de la fiche métier pour l'identifiant {id}.</p>
        </div>
      </div>

      <div className="detail-card">
        <div>
          <h3>Informations générales</h3>
          <p>Nom : Demandeur {id}</p>
          <p>Statut : En suivi</p>
        </div>
        <div>
          <h3>Portefeuille</h3>
          <p>Portefeuille exemple</p>
          <p>Actif : Oui</p>
        </div>
      </div>
    </section>
  )
}

export default FicheDemandeur
