function SearchBar() {
  return (
    <div className="search-bar">
      <input
        type="search"
        placeholder="Rechercher un dossier, un portefeuille, un atelier..."
        aria-label="Recherche"
      />
    </div>
  )
}

export default SearchBar
