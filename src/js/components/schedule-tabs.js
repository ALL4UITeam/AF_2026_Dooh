/**
 * 미디어/상품 등 페이지 상단 탭 (`.tab-menu-page`)
 */
export function initSchedulePageTabs() {
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
}

/**
 * data-* 기반 탭/패널 전환
 *
 * @param {object} options
 * @param {ParentNode} [options.root=document]
 * @param {string} options.tabSelector
 * @param {string} options.panelSelector
 * @param {string} options.tabDataKey dataset 키 (예: 'orderTab')
 * @param {string} options.panelDataKey dataset 키 (예: 'orderPanel')
 * @param {(tabId: string) => void} [options.onChange]
 */
export function initScheduleDataTabs({
  root = document,
  tabSelector,
  panelSelector,
  tabDataKey,
  panelDataKey,
  onChange,
}) {
  const tabs = [...root.querySelectorAll(tabSelector)]
  const panels = [...root.querySelectorAll(panelSelector)]
  if (!tabs.length || !panels.length) return

  const setTab = (tabId) => {
    tabs.forEach((tab) => {
      if (!(tab instanceof HTMLElement)) return
      const active = tab.dataset[tabDataKey] === tabId
      tab.classList.toggle('is-active', active)
      tab.setAttribute('aria-selected', String(active))
    })

    panels.forEach((panel) => {
      if (!(panel instanceof HTMLElement)) return
      panel.hidden = panel.dataset[panelDataKey] !== tabId
    })

    onChange?.(tabId)
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      if (!(tab instanceof HTMLElement)) return
      const tabId = tab.dataset[tabDataKey]
      if (tabId) setTab(tabId)
    })
  })
}
