/**
 * 편성표 미디어 선택 팝오버
 */
export function initScheduleMediaPicker() {
  const root = document.querySelector('[data-media-picker-root]')
  const picker = document.querySelector('#schedule-media-picker')
  const triggers = [...document.querySelectorAll('[data-open-media-picker]')]
  if (!(root instanceof HTMLElement) || !(picker instanceof HTMLElement) || !triggers.length) return

  const searchInput = picker.querySelector('[data-media-picker-search]')
  const resetBtn = picker.querySelector('[data-media-picker-reset]')
  const items = [...picker.querySelectorAll('.schedule-media-picker__item')]
  const nameLabel = document.querySelector('[data-media-name-label]')
  const addressLabel = document.querySelector('[data-media-address-label]')
  const typeLabel = document.querySelector('[data-media-type-label]')
  const mainTrigger = root.querySelector('.schedule-media__trigger')

  const setOpen = (isOpen) => {
    picker.hidden = !isOpen
    root.classList.toggle('is-open', isOpen)
    if (mainTrigger instanceof HTMLButtonElement) {
      mainTrigger.setAttribute('aria-expanded', String(isOpen))
      mainTrigger.classList.toggle('is-open', isOpen)
    }
    if (isOpen && searchInput instanceof HTMLInputElement) {
      window.requestAnimationFrame(() => searchInput.focus())
    }
  }

  const filterItems = (query) => {
    const q = query.trim().toLowerCase()
    items.forEach((item) => {
      const li = item.closest('li')
      if (!(li instanceof HTMLElement)) return
      const name = item.dataset.mediaName?.toLowerCase() ?? ''
      const address = item.dataset.mediaAddress?.toLowerCase() ?? ''
      const type = item.dataset.mediaType?.toLowerCase() ?? ''
      const matched = !q || name.includes(q) || address.includes(q) || type.includes(q)
      li.hidden = !matched
    })
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.stopPropagation()
      setOpen(picker.hidden)
    })
  })

  picker.addEventListener('click', (event) => {
    event.stopPropagation()
  })

  document.addEventListener('click', () => {
    if (!picker.hidden) setOpen(false)
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !picker.hidden) setOpen(false)
  })

  if (searchInput instanceof HTMLInputElement) {
    searchInput.addEventListener('input', () => filterItems(searchInput.value))
  }

  resetBtn?.addEventListener('click', () => {
    if (searchInput instanceof HTMLInputElement) {
      searchInput.value = ''
      filterItems('')
      searchInput.focus()
    }
  })

  items.forEach((item) => {
    item.addEventListener('click', () => {
      items.forEach((other) => {
        const selected = other === item
        other.classList.toggle('is-selected', selected)
        other.setAttribute('aria-selected', String(selected))
      })

      if (nameLabel) nameLabel.textContent = item.dataset.mediaName ?? ''
      if (addressLabel) addressLabel.textContent = item.dataset.mediaAddress ?? ''
      if (typeLabel) typeLabel.textContent = item.dataset.mediaType ?? ''

      setOpen(false)
    })
  })
}
