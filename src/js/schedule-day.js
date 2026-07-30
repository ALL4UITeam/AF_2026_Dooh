import { initAppSidebar } from './components/app-sidebar.js'
import { initScheduleMediaPicker } from './components/schedule-media-picker.js'
import { initSchedulePeriodNav } from './components/schedule-period-nav.js'
import { initPointerSortList } from './components/schedule-pointer-sort.js'
import { initScheduleDataTabs, initSchedulePageTabs } from './components/schedule-tabs.js'

initAppSidebar()

/**
 * @param {HTMLElement} list
 */
function refreshOrderNumbers(list) {
  list.querySelectorAll('.schedule-order__item').forEach((item, index) => {
    const num = item.querySelector('.schedule-order__num')
    if (num) num.textContent = String(index + 1).padStart(2, '0')
  })
}

function initOrderPanel() {
  const panels = [...document.querySelectorAll('[data-order-panel]')]
  const descEl = document.querySelector('[data-order-desc]')
  const resetBtn = document.querySelector('[data-order-reset]')
  if (!panels.length) return

  /** @type {Record<string, string>} */
  const descriptions = {
    repeat: '반복형 4개 · 운영시간 내 반복 재생',
    fixed: '고정형 4개 · 지정 시간대 고정 재생',
    condition: '조건형 2개 · 조건 충족 시 재생',
    ai: 'AI 자동 3개 · 피크 타임 자동 편성',
  }

  /** @type {Map<HTMLElement, string>} */
  const initialMarkup = new Map()

  panels.forEach((panel) => {
    if (!(panel instanceof HTMLElement)) return
    initialMarkup.set(panel, panel.innerHTML)
    initPointerSortList({
      list: panel,
      itemSelector: '.schedule-order__item',
      handleSelector: '.schedule-order__handle',
      onReorder: () => refreshOrderNumbers(panel),
    })
  })

  initScheduleDataTabs({
    tabSelector: '[data-order-tab]',
    panelSelector: '[data-order-panel]',
    tabDataKey: 'orderTab',
    panelDataKey: 'orderPanel',
    onChange: (tabId) => {
      if (descEl) descEl.textContent = descriptions[tabId] ?? ''
    },
  })

  resetBtn?.addEventListener('click', () => {
    panels.forEach((panel) => {
      if (!(panel instanceof HTMLElement)) return
      const html = initialMarkup.get(panel)
      if (html == null) return
      panel.innerHTML = html
      refreshOrderNumbers(panel)
    })
  })
}

initSchedulePageTabs()
initScheduleMediaPicker()
initSchedulePeriodNav({ unit: 'day' })
initOrderPanel()
