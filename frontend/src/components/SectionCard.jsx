function SectionCard({ title, description, children }) {
  return (
    <section className="dashboard-card section-card">
      <div className="card-header">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      {children}
    </section>
  )
}

export default SectionCard
