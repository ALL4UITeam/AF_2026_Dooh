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

document.querySelectorAll('.segment-switch').forEach((group) => {
  group.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    const item = target.closest('.segment-switch__item')
    if (!(item instanceof HTMLButtonElement) || !group.contains(item)) return

    group.querySelectorAll('.segment-switch__item').forEach((btn) => {
      btn.classList.toggle('is-active', btn === item)
    })
  })
})

document.querySelectorAll('.range-slider').forEach((slider) => {
  const input = slider.querySelector('.range-slider__input')
  const output = slider.querySelector('.range-slider__value')
  if (!(input instanceof HTMLInputElement) || !(output instanceof HTMLOutputElement)) return

  const sync = () => {
    const value = Number(input.value)
    const min = Number(input.min) || 0
    const max = Number(input.max) || 100
    const percent = ((value - min) / (max - min)) * 100
    input.style.setProperty('--range-progress', `${percent}%`)
    output.value = String(value)
    output.textContent = String(value)
  }

  input.addEventListener('input', sync)
  sync()
})

document.querySelectorAll('.device-remote__select').forEach((select) => {
  const trigger = select.querySelector('.device-remote__group')
  const panel = select.querySelector('.remote-group-select')
  const label = trigger?.querySelector('.device-remote__group-label')
  const info = trigger?.querySelector('.device-remote__group-info')
  const iconOff = trigger?.querySelector('.device-remote__group-icon-img--off')
  const iconOn = trigger?.querySelector('.device-remote__group-icon-img--on')
  if (!(trigger instanceof HTMLButtonElement) || !(panel instanceof HTMLElement)) return

  const syncTriggerIcon = (src) => {
    if (!(iconOff instanceof HTMLImageElement) || !src) return

    iconOff.src = src

    if (!(iconOn instanceof HTMLImageElement)) return

    // LED만 전용 on 아이콘이 있음
    if (/\/led\.svg$/i.test(src)) {
      iconOn.src = src.replace(/\/led\.svg$/i, '/led-on.svg')
      return
    }

    iconOn.src = src
  }

  const syncPanel = (isOpen) => {
    trigger.classList.toggle('is-open', isOpen)
    trigger.setAttribute('aria-expanded', String(isOpen))
    panel.hidden = !isOpen
  }

  const closePanel = () => syncPanel(false)

  syncPanel(false)

  trigger.addEventListener('click', (event) => {
    event.stopPropagation()
    syncPanel(panel.hidden)
  })

  panel.addEventListener('click', (event) => {
    event.stopPropagation()
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    const option = target.closest('.remote-group-option')
    if (!(option instanceof HTMLButtonElement) || !panel.contains(option)) return

    panel.querySelectorAll('.remote-group-option').forEach((item) => {
      const isSelected = item === option
      item.classList.toggle('is-selected', isSelected)
      item.setAttribute('aria-selected', String(isSelected))
    })

    const optionLabel = option.querySelector('.remote-group-option__label')
    const optionInfo = option.querySelector('.remote-group-option__info')
    const optionIcon = option.querySelector('.remote-group-option__icon img')
    if (label instanceof HTMLElement && optionLabel) {
      label.textContent = optionLabel.textContent?.trim() ?? ''
    }
    if (info instanceof HTMLElement && optionInfo) {
      info.textContent = optionInfo.textContent?.trim() ?? ''
    }
    if (optionIcon instanceof HTMLImageElement) {
      syncTriggerIcon(optionIcon.getAttribute('src') ?? optionIcon.src)
    }

    closePanel()
  })

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Node) || select.contains(event.target)) return
    closePanel()
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePanel()
  })
})
