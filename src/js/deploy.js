import { initAppSidebar } from './components/app-sidebar.js'

initAppSidebar()

const filterForm = document.querySelector('#deploy-filters')
const keywordInput = document.querySelector('#deploy-keyword')
const statusSelect = document.querySelector('#status-filter')
const summaryButtons = document.querySelectorAll('.summary-item')
const items = [...document.querySelectorAll('#deploy-table-body tr')]

if (filterForm && keywordInput && statusSelect && items.length > 0) {
  const applyFilters = () => {
    const keyword = keywordInput.value.trim().toLowerCase()
    const status = statusSelect.value

    items.forEach((item) => {
      const matchesKeyword = item.textContent.toLowerCase().includes(keyword)
      const matchesStatus = status === 'all' || item.dataset.status === status
      item.hidden = !(matchesKeyword && matchesStatus)
    })
  }

  filterForm.addEventListener('submit', (event) => {
    event.preventDefault()
    applyFilters()
  })

  filterForm.addEventListener('reset', () => {
    requestAnimationFrame(() => {
      statusSelect.value = 'all'
      summaryButtons.forEach((button) => {
        button.classList.toggle('is-selected', button.dataset.status === 'all')
      })
      applyFilters()
    })
  })

  summaryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      statusSelect.value = button.dataset.status ?? 'all'
      summaryButtons.forEach((item) => item.classList.toggle('is-selected', item === button))
      applyFilters()
    })
  })
}
