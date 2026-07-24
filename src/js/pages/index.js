const searchInput = document.querySelector('#searchInput')
const searchButton = document.querySelector('#searchButton')
const tableBody = document.querySelector('#tableBody')
const noResults = document.querySelector('#noResults')

if (searchInput && searchButton && tableBody && noResults) {
  const rows = [...tableBody.querySelectorAll('tr')]

  const performSearch = () => {
    const searchTerm = searchInput.value.trim().toLowerCase()
    let resultsFound = false

    rows.forEach((row) => {
      const isMatch = row.textContent.toLowerCase().includes(searchTerm)
      row.hidden = !isMatch
      if (isMatch) resultsFound = true
    })

    noResults.hidden = resultsFound
  }

  searchButton.addEventListener('click', performSearch)
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') performSearch()
  })
}
