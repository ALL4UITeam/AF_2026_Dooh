import { initAppSidebar } from './components/app-sidebar.js'
import { initScheduleMediaPicker } from './components/schedule-media-picker.js'
import { initSchedulePeriodNav } from './components/schedule-period-nav.js'
import { initPointerSortList } from './components/schedule-pointer-sort.js'
import { initScheduleDataTabs } from './components/schedule-tabs.js'

initAppSidebar()

/**
 * @param {HTMLElement} list
 */
function refreshDaylistNumbers(list) {
  const items = [...list.querySelectorAll('.schedule-daylist__item')]
  items.forEach((item, index) => {
    const num = item.querySelector('.schedule-daylist__num')
    if (num) num.textContent = String(index + 1).padStart(2, '0')

    const up = item.querySelector('[data-move-up]')
    const down = item.querySelector('[data-move-down]')
    if (up instanceof HTMLButtonElement) up.disabled = index === 0
    if (down instanceof HTMLButtonElement) down.disabled = index === items.length - 1
  })

  const panel = list.closest('[data-daylist-panel]')
  const countEl = panel?.querySelector('[data-daylist-count]')
  if (countEl) countEl.textContent = String(items.length)
}

/**
 * @param {HTMLElement} list
 */
function initDaylistMoves(list) {
  list.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return

    const upBtn = target.closest('[data-move-up]')
    const downBtn = target.closest('[data-move-down]')
    const btn = upBtn || downBtn
    if (!(btn instanceof HTMLButtonElement) || !list.contains(btn) || btn.disabled) return

    const item = btn.closest('.schedule-daylist__item')
    if (!(item instanceof HTMLElement)) return

    if (upBtn) {
      const prev = item.previousElementSibling
      if (prev) list.insertBefore(item, prev)
    } else {
      const next = item.nextElementSibling
      if (next) list.insertBefore(next, item)
    }

    refreshDaylistNumbers(list)
  })
}

function initDaylist() {
  const root = document.querySelector('.schedule-daylist')
  if (!(root instanceof HTMLElement)) return

  const panels = [...root.querySelectorAll('[data-daylist-panel]')]
  if (!panels.length) return

  /** @type {Map<HTMLElement, string>} */
  const initialMarkup = new Map()

  panels.forEach((panel) => {
    if (!(panel instanceof HTMLElement)) return
    const list = panel.querySelector('[data-daylist-list]')
    if (!(list instanceof HTMLElement)) return

    initialMarkup.set(list, list.innerHTML)
    initPointerSortList({
      list,
      itemSelector: '.schedule-daylist__item',
      handleSelector: '.schedule-daylist__handle',
      onReorder: () => refreshDaylistNumbers(list),
    })
    initDaylistMoves(list)
    refreshDaylistNumbers(list)

    panel.querySelector('[data-daylist-reset]')?.addEventListener('click', () => {
      const html = initialMarkup.get(list)
      if (html == null) return
      list.innerHTML = html
      refreshDaylistNumbers(list)
    })
  })

  initScheduleDataTabs({
    root,
    tabSelector: '[data-daylist-tab]',
    panelSelector: '[data-daylist-panel]',
    tabDataKey: 'daylistTab',
    panelDataKey: 'daylistPanel',
  })
}

initScheduleMediaPicker()
initSchedulePeriodNav({ unit: 'month' })
initDaylist()
