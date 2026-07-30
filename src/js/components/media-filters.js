/**
 * 미디어 목록 검색·상태 필터 (리스트/카드 공통)
 */
export function initMediaFilters({ itemSelector }) {
  const filterForm = document.querySelector('#media-filters')
  const keywordInput = document.querySelector('#media-keyword')
  const statusSelect = document.querySelector('#status-filter')
  const summaryButtons = document.querySelectorAll('.summary-item')
  const items = [...document.querySelectorAll(itemSelector)]

  if (!filterForm || !keywordInput || !statusSelect || items.length === 0) return

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
      summaryButtons.forEach((button) => {
        button.classList.toggle('is-selected', button.dataset.status === 'all')
      })
      applyFilters()
    })
  })

  summaryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      statusSelect.value = button.dataset.status
      summaryButtons.forEach((item) => item.classList.toggle('is-selected', item === button))
      applyFilters()
    })
  })
}
