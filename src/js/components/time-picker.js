/** Custom time picker — replaces native input[type=time] chrome */

const HOURS_12 = Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i))
const MINUTES = Array.from({ length: 60 }, (_, i) => i)

const pad = (n) => String(n).padStart(2, '0')

const parseTimeValue = (value) => {
  if (!value) return null
  const [h, m] = value.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return { hours24: h, minutes: m }
}

const toValue = (hours24, minutes) => `${pad(hours24)}:${pad(minutes)}`

const toDisplay = (hours24, minutes) => {
  const period = hours24 < 12 ? '오전' : '오후'
  let h12 = hours24 % 12
  if (h12 === 0) h12 = 12
  return `${period} ${pad(h12)} : ${pad(minutes)}`
}

const toHours24 = (period, hour12) => {
  const h = hour12 === 12 ? 0 : hour12
  return period === 'pm' ? h + 12 : h
}

const fromHours24 = (hours24) => ({
  period: hours24 < 12 ? 'am' : 'pm',
  hour12: (() => {
    const h = hours24 % 12
    return h === 0 ? 12 : h
  })(),
})

const buildOption = (label, value, selected) => {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = `time-picker__option${selected ? ' is-selected' : ''}`
  btn.dataset.value = String(value)
  btn.setAttribute('role', 'option')
  btn.setAttribute('aria-selected', selected ? 'true' : 'false')
  btn.textContent = label
  return btn
}

const scrollSelectedIntoView = (col) => {
  const selected = col.querySelector('.time-picker__option.is-selected')
  if (!(selected instanceof HTMLElement)) return
  const top = selected.offsetTop - col.clientHeight / 2 + selected.clientHeight / 2
  col.scrollTop = Math.max(0, top)
}

/**
 * @param {ParentNode} [root=document]
 */
export const initTimePickers = (root = document) => {
  root.querySelectorAll('.field-time').forEach((field) => {
    if (!(field instanceof HTMLElement)) return
    if (field.dataset.timePickerReady === 'true') return

    const input = field.querySelector('input[type="time"]')
    if (!(input instanceof HTMLInputElement)) return

    field.dataset.timePickerReady = 'true'
    field.classList.add('field-time--custom')

    const labelText =
      input.getAttribute('aria-label') ||
      field.getAttribute('aria-label') ||
      '시간'

    const initial = parseTimeValue(input.value) || { hours24: 0, minutes: 0 }
    let state = {
      ...fromHours24(initial.hours24),
      minutes: initial.minutes,
      open: false,
    }

    // Hide native input but keep it for forms / calc
    input.classList.add('field-time__native')
    input.tabIndex = -1
    input.setAttribute('aria-hidden', 'true')

    const trigger = document.createElement('button')
    trigger.type = 'button'
    trigger.className = 'field-time__trigger'
    trigger.setAttribute('aria-haspopup', 'dialog')
    trigger.setAttribute('aria-expanded', 'false')
    trigger.setAttribute('aria-label', labelText)

    const valueEl = document.createElement('span')
    valueEl.className = 'field-time__value'
    valueEl.textContent = input.value
      ? toDisplay(initial.hours24, initial.minutes)
      : '-- : --'
    if (!input.value) valueEl.classList.add('is-empty')

    const icon = field.querySelector('.field-time__icon')
    trigger.append(valueEl)
    if (icon instanceof HTMLElement) {
      trigger.append(icon)
    } else {
      const iconEl = document.createElement('span')
      iconEl.className = 'field-time__icon'
      iconEl.setAttribute('aria-hidden', 'true')
      trigger.append(iconEl)
    }

    const panel = document.createElement('div')
    panel.className = 'time-picker'
    panel.hidden = true
    panel.setAttribute('role', 'dialog')
    panel.setAttribute('aria-label', `${labelText} 선택`)

    const cols = document.createElement('div')
    cols.className = 'time-picker__cols'

    const periodCol = document.createElement('div')
    periodCol.className = 'time-picker__col time-picker__col--period'
    periodCol.setAttribute('role', 'listbox')
    periodCol.setAttribute('aria-label', '오전 오후')

    const hourCol = document.createElement('div')
    hourCol.className = 'time-picker__col time-picker__col--hour'
    hourCol.setAttribute('role', 'listbox')
    hourCol.setAttribute('aria-label', '시')

    const minuteCol = document.createElement('div')
    minuteCol.className = 'time-picker__col time-picker__col--minute'
    minuteCol.setAttribute('role', 'listbox')
    minuteCol.setAttribute('aria-label', '분')

    cols.append(periodCol, hourCol, minuteCol)
    panel.append(cols)

    // Move input after trigger for layout
    field.replaceChildren(input, trigger, panel)

    const syncOptions = () => {
      periodCol.replaceChildren(
        buildOption('오전', 'am', state.period === 'am'),
        buildOption('오후', 'pm', state.period === 'pm'),
      )

      hourCol.replaceChildren(
        ...HOURS_12.map((h) => buildOption(pad(h), String(h), state.hour12 === h)),
      )

      minuteCol.replaceChildren(
        ...MINUTES.map((m) => buildOption(pad(m), String(m), state.minutes === m)),
      )
    }

    const commit = () => {
      const hours24 = toHours24(state.period, state.hour12)
      const next = toValue(hours24, state.minutes)
      const display = toDisplay(hours24, state.minutes)

      valueEl.textContent = display
      valueEl.classList.remove('is-empty')

      if (input.value !== next) {
        input.value = next
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }

    const setOpen = (open) => {
      state.open = open
      panel.hidden = !open
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false')
      field.classList.toggle('is-open', open)

      if (open) {
        syncOptions()
        requestAnimationFrame(() => {
          scrollSelectedIntoView(hourCol)
          scrollSelectedIntoView(minuteCol)
        })
      }
    }

    field.__timePickerSetOpen = setOpen

    trigger.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      if (state.open) {
        setOpen(false)
        return
      }
      document.querySelectorAll('.field-time.is-open').forEach((other) => {
        if (other === field) return
        if (typeof other.__timePickerSetOpen === 'function') {
          other.__timePickerSetOpen(false)
        }
      })
      setOpen(true)
    })

    panel.addEventListener('click', (event) => {
      const target = event.target
      if (!(target instanceof HTMLElement)) return
      const option = target.closest('.time-picker__option')
      if (!(option instanceof HTMLButtonElement) || !panel.contains(option)) return

      const col = option.closest('.time-picker__col')
      if (!(col instanceof HTMLElement)) return

      if (col === periodCol) {
        state.period = option.dataset.value === 'pm' ? 'pm' : 'am'
      } else if (col === hourCol) {
        state.hour12 = Number(option.dataset.value)
      } else if (col === minuteCol) {
        state.minutes = Number(option.dataset.value)
      }

      syncOptions()
      commit()

      if (col === minuteCol) {
        setOpen(false)
        trigger.focus()
      } else {
        requestAnimationFrame(() => {
          scrollSelectedIntoView(hourCol)
          scrollSelectedIntoView(minuteCol)
        })
      }
    })

    const onDocPointer = (event) => {
      if (!state.open) return
      const target = event.target
      if (!(target instanceof Node)) return
      if (field.contains(target)) return
      setOpen(false)
    }

    const onKeyDown = (event) => {
      if (!state.open) return
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        trigger.focus()
      }
    }

    document.addEventListener('pointerdown', onDocPointer)
    document.addEventListener('keydown', onKeyDown)

    // Keep display in sync if value set externally
    input.addEventListener('change', () => {
      const parsed = parseTimeValue(input.value)
      if (!parsed) {
        valueEl.textContent = '-- : --'
        valueEl.classList.add('is-empty')
        return
      }
      state = { ...state, ...fromHours24(parsed.hours24), minutes: parsed.minutes }
      valueEl.textContent = toDisplay(parsed.hours24, parsed.minutes)
      valueEl.classList.remove('is-empty')
      if (state.open) syncOptions()
    })

    syncOptions()
  })
}
