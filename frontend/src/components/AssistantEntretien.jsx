function AssistantEntretien() {
  return (
    <aside className="dashboard-card section-card">
      <div className="card-header">
        <h3>Assistant d'entretien</h3>
      </div>

      <div className="assistant-list">
        <div>
          <strong>🎯 Objectif de l'entretien</strong>
          <textarea rows={4} placeholder="Définir l'objectif principal de l'entretien" />
        </div>

        <div>
          <strong>📋 Déroulement</strong>
          <div className="profile-list">
            <label>
              <input type="checkbox" /> Introduction
            </label>
            <label>
              <input type="checkbox" /> Exploration
            </label>
            <label>
              <input type="checkbox" /> Conclusion
            </label>
          </div>
        </div>

        <div>
          <strong>💬 Attitudes professionnelles</strong>
          <ul>
            <li>Écoute active</li>
            <li>Empathie</li>
            <li>Neutralité</li>
            <li>Bienveillance</li>
            <li>Respect du libre choix</li>
          </ul>
        </div>

        <div>
          <strong>❓ Questions suggérées</strong>
          <ul />
        </div>

        <div>
          <strong>⚠ Points de vigilance</strong>
          <ul />
        </div>

        <div>
          <strong>💡 Pistes d'actions</strong>
          <ul />
        </div>

        <div>
          <strong>📝 Synthèse en construction</strong>
          <textarea rows={8} placeholder="Rédiger la synthèse en continu" />
        </div>
      </div>

      <button type="button" className="copy-button">
        Copier la synthèse
      </button>
    </aside>
  )
}

export default AssistantEntretien
