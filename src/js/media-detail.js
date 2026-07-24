import { initAppSidebar } from './components/app-sidebar.js'

initAppSidebar()

document.querySelectorAll('.tab-menu-page').forEach((tabList) => {
  tabList.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return

    const item = target.closest('.tab-menu-page__item')
    if (!(item instanceof HTMLButtonElement) || !tabList.contains(item)) return

    const tabId = item.dataset.tab
    if (!tabId) return

    tabList.querySelectorAll('.tab-menu-page__item').forEach((tab) => {
      const isActive = tab === item
      tab.classList.toggle('is-active', isActive)
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false')
    })

    document.querySelectorAll('[data-tab-panel]').forEach((panel) => {
      if (!(panel instanceof HTMLElement)) return
      panel.hidden = panel.dataset.tabPanel !== tabId
    })
  })
})
