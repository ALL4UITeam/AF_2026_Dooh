/**
 * 편성표 기간 네비 (년/월 표시)
 *
 * @param {object} [options]
 * @param {'day' | 'month'} [options.unit='day']
 * @param {Date} [options.initial]
 */
export function initSchedulePeriodNav(options = {}) {
  const unit = options.unit ?? 'day'
  /** @type {Date} */
  let current = options.initial ?? new Date(2026, 5, unit === 'month' ? 1 : 29)

  const yearEl = document.querySelector('[data-calendar-year]')
  const monthEl = document.querySelector('[data-calendar-month]')

  const refresh = () => {
    if (yearEl) yearEl.textContent = `${current.getFullYear()}년`
    if (monthEl) monthEl.textContent = `${current.getMonth() + 1}월`
  }

  document.querySelector('[data-day-prev]')?.addEventListener('click', () => {
    if (unit === 'month') current.setMonth(current.getMonth() - 1)
    else current.setDate(current.getDate() - 1)
    refresh()
  })

  document.querySelector('[data-day-next]')?.addEventListener('click', () => {
    if (unit === 'month') current.setMonth(current.getMonth() + 1)
    else current.setDate(current.getDate() + 1)
    refresh()
  })

  refresh()
}
