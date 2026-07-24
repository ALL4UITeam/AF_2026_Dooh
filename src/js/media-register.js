import { initAppSidebar } from './components/app-sidebar.js'
import { initTimePickers } from './components/time-picker.js'

initAppSidebar()
initTimePickers()

document.querySelectorAll('.radio-card-group').forEach((group) => {
  group.addEventListener('change', (event) => {
    const target = event.target
    if (!(target instanceof HTMLInputElement) || target.type !== 'radio') return

    group.querySelectorAll('.radio-card').forEach((card) => {
      card.classList.toggle('is-active', card.contains(target))
    })
  })
})

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
