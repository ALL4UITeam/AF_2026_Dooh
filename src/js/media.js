import '../styles/main.scss'
import '../styles/pages/media-list.scss'

const filterForm = document.querySelector('#media-filters')
const keywordInput = document.querySelector('#media-keyword')
const statusSelect = document.querySelector('#status-filter')
const summaryButtons = document.querySelectorAll('.summary-item')
const rows = [...document.querySelectorAll('#media-table-body tr')]

/**
 * 현재 검색어와 상태 필터를 목록에 반영합니다.
 * API 연동 전에도 화면 동작을 확인할 수 있도록 정적 행을 필터링합니다.
 */
function applyFilters() {
  const keyword = keywordInput.value.trim().toLowerCase()
  const status = statusSelect.value

  rows.forEach((row) => {
    const matchesKeyword = row.textContent.toLowerCase().includes(keyword)
    const matchesStatus = status === 'all' || row.dataset.status === status
    row.hidden = !(matchesKeyword && matchesStatus)
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
