import { initAppSidebar } from './components/app-sidebar.js'
import { initTimePickers } from './components/time-picker.js'

initAppSidebar()
initTimePickers()

document.querySelectorAll('.tab-menu02').forEach((tabList) => {
  tabList.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return

    const item = target.closest('.tab-menu02__item')
    if (!(item instanceof HTMLButtonElement) || !tabList.contains(item)) return

    tabList.querySelectorAll('.tab-menu02__item').forEach((tab) => {
      const isActive = tab === item
      tab.classList.toggle('is-active', isActive)
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false')
    })
  })
})

const TIME_SLOT_TEMPLATE = `
  <div class="field-time">
    <input type="time" name="exposure-start[]" value="00:00" aria-label="노출 시작 시간" required />
    <span class="field-time__icon" aria-hidden="true"></span>
  </div>
  <span class="time-slot-row__sep" aria-hidden="true">~</span>
  <div class="field-time">
    <input type="time" name="exposure-end[]" aria-label="노출 종료 시간" required />
    <span class="field-time__icon" aria-hidden="true"></span>
  </div>
  <button class="btn btn--tertiary btn--form btn--form-delete" type="button" data-time-slot-remove>삭제</button>
`

document.querySelectorAll('[data-time-slot-list]').forEach((list) => {
  list.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return

    const addBtn = target.closest('[data-time-slot-add]')
    if (addBtn instanceof HTMLButtonElement && list.contains(addBtn)) {
      const row = document.createElement('div')
      row.className = 'time-slot-row'
      row.innerHTML = TIME_SLOT_TEMPLATE
      list.append(row)
      initTimePickers(row)
      return
    }

    const removeBtn = target.closest('[data-time-slot-remove]')
    if (removeBtn instanceof HTMLButtonElement && list.contains(removeBtn)) {
      const row = removeBtn.closest('.time-slot-row')
      if (row instanceof HTMLElement) row.remove()
    }
  })
})

const initMediaSelectModal = () => {
  const modals = [...document.querySelectorAll('.media-select-modal')].filter(
    (el) => el instanceof HTMLElement,
  )
  if (!modals.length) return

  const setOpen = (modal, isOpen) => {
    modal.classList.toggle('is-open', isOpen)
    modal.setAttribute('aria-hidden', String(!isOpen))
    document.body.classList.toggle('modal-open', isOpen)
  }

  modals.forEach((modal) => {
    modal.querySelectorAll('[data-close-modal]').forEach((button) => {
      button.addEventListener('click', () => setOpen(modal, false))
    })
  })

  document.querySelectorAll('[data-open-media-select]').forEach((button) => {
    button.addEventListener('click', () => {
      const modal = document.querySelector('#media-select-modal')
      if (modal instanceof HTMLElement) setOpen(modal, true)
    })
  })

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    modals.forEach((modal) => {
      if (modal.classList.contains('is-open')) setOpen(modal, false)
    })
  })

  const openModalId = document.body.dataset.openModal
  if (!openModalId) return

  const target = document.getElementById(openModalId)
  if (target instanceof HTMLElement && target.classList.contains('media-select-modal')) {
    setOpen(target, true)
  }
}

initMediaSelectModal()
