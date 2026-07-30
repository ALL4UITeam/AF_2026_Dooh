import $ from 'jquery'
import moment from 'moment'
import 'moment/locale/ko'
import 'daterangepicker/daterangepicker.css'

import { initAppSidebar } from './components/app-sidebar.js'
import { initScheduleMediaPicker } from './components/schedule-media-picker.js'
import { initSchedulePageTabs } from './components/schedule-tabs.js'

moment.locale('ko')

// daterangepicker(UMD)가 window.jQuery / window.moment를 참조할 수 있게 등록
window.jQuery = window.$ = $
window.moment = moment

await import('daterangepicker')

initAppSidebar()

/** @typedef {{ used: number, total: number }} SlotInfo */

/** 슬롯 데모 데이터 (yyyy-MM-dd → used/total) */
const SLOT_DATA = /** @type {Record<string, SlotInfo>} */ ({
  '2026-05-31': { used: 4, total: 20 },
  '2026-06-01': { used: 8, total: 20 },
  '2026-06-02': { used: 12, total: 20 },
  '2026-06-03': { used: 9, total: 20 },
  '2026-06-04': { used: 20, total: 20 },
  '2026-06-05': { used: 5, total: 20 },
  '2026-06-06': { used: 4, total: 20 },
  '2026-06-07': { used: 8, total: 20 },
  '2026-06-08': { used: 14, total: 20 },
  '2026-06-09': { used: 11, total: 20 },
  '2026-06-10': { used: 9, total: 20 },
  '2026-06-11': { used: 20, total: 20 },
  '2026-06-12': { used: 6, total: 20 },
  '2026-06-13': { used: 4, total: 20 },
  '2026-06-14': { used: 8, total: 20 },
  '2026-06-15': { used: 12, total: 20 },
  '2026-06-16': { used: 16, total: 20 },
  '2026-06-17': { used: 9, total: 20 },
  '2026-06-18': { used: 20, total: 20 },
  '2026-06-19': { used: 5, total: 20 },
  '2026-06-20': { used: 4, total: 20 },
  '2026-06-21': { used: 8, total: 20 },
  '2026-06-22': { used: 13, total: 20 },
  '2026-06-23': { used: 11, total: 20 },
  '2026-06-24': { used: 9, total: 20 },
  '2026-06-25': { used: 20, total: 20 },
  '2026-06-26': { used: 6, total: 20 },
  '2026-06-27': { used: 4, total: 20 },
  '2026-06-28': { used: 8, total: 20 },
  '2026-06-29': { used: 4, total: 20 },
  '2026-06-30': { used: 12, total: 20 },
  '2026-07-01': { used: 9, total: 20 },
  '2026-07-02': { used: 20, total: 20 },
  '2026-07-03': { used: 5, total: 20 },
  '2026-07-04': { used: 4, total: 20 },
})

/** @type {Record<string, { count: number, commercial: number, public: number, internal: number }>} */
const DAY_SUMMARY = {
  '2026-06-29': { count: 6, commercial: 33, public: 50, internal: 17 },
}

/** @type {Record<string, { key: string, label: string }>} */
const SLOT_LEVELS = {
  empty: { key: 'empty', label: '' },
  ok: { key: 'ok', label: '여유' },
  busy: { key: 'busy', label: '혼잡' },
  hot: { key: 'hot', label: '포화' },
  full: { key: 'full', label: '마감' },
}

/**
 * @param {number} used
 * @param {number} total
 */
function slotLevel(used, total) {
  if (total <= 0 || used <= 0) return SLOT_LEVELS.empty
  const ratio = used / total
  if (ratio >= 1) return SLOT_LEVELS.full
  if (ratio >= 0.8) return SLOT_LEVELS.hot
  if (ratio >= 0.55) return SLOT_LEVELS.busy
  return SLOT_LEVELS.ok
}

/**
 * @param {moment.Moment} date
 * @param {boolean} [isSelected]
 */
function buildDayHtml(date, isSelected = false) {
  const key = date.format('YYYY-MM-DD')
  const slot = SLOT_DATA[key]
  const used = slot?.used ?? 0
  const total = slot?.total ?? 20
  const level = slot ? slotLevel(used, total) : SLOT_LEVELS.empty
  const percent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0
  const selectedClass = isSelected ? ' is-selected' : ''
  const badge =
    level.key !== 'empty'
      ? `<span class="schedule-day__badge schedule-day__badge--${level.key}">${level.label}</span>`
      : ''

  return `
    <div class="schedule-day schedule-day--${level.key}${selectedClass}">
      <div class="schedule-day__head">
        <span class="schedule-day__num">${date.date()}</span>
        ${badge}
      </div>
      <div class="schedule-day__slot">
        <span>슬롯</span>
        <span>${used}/${total}</span>
      </div>
      <div class="schedule-day__bar"><span style="width:${percent}%"></span></div>
    </div>
  `
}

/**
 * daterangepicker 셀에 슬롯 UI 주입
 * @param {{ container: JQuery, leftCalendar: { calendar: moment.Moment[][], month: moment.Moment }, startDate: moment.Moment }} picker
 */
function enhanceCalendarDays(picker) {
  const calendar = picker.leftCalendar.calendar
  if (!calendar) return

  const selectedKey = picker.startDate.format('YYYY-MM-DD')

  picker.container.find('.drp-calendar.left td[data-title]').each((_, td) => {
    const $td = $(td)
    const title = $td.attr('data-title')
    if (!title) return

    const match = title.match(/^r(\d+)c(\d+)$/)
    if (!match) return

    const row = Number(match[1])
    const col = Number(match[2])
    const cellDate = calendar[row]?.[col]
    if (!cellDate) return

    const isSelected = cellDate.format('YYYY-MM-DD') === selectedKey
    $td.html(buildDayHtml(cellDate, isSelected))
  })
}

/**
 * @param {moment.Moment} date
 */
function updateToolbar(date) {
  const yearEl = document.querySelector('[data-calendar-year]')
  const monthEl = document.querySelector('[data-calendar-month]')
  if (yearEl) yearEl.textContent = `${date.year()}년`
  if (monthEl) monthEl.textContent = `${date.month() + 1}월`
}

/**
 * @param {moment.Moment} date
 */
function updateDayPanel(date) {
  const titleEl = document.querySelector('[data-schedule-title]')
  const countEl = document.querySelector('[data-schedule-count]')
  const key = date.format('YYYY-MM-DD')
  const summary = DAY_SUMMARY[key] ?? { count: 0, commercial: 0, public: 0, internal: 0 }

  if (titleEl) titleEl.textContent = `${date.month() + 1}월 ${date.date()}일 스케줄`
  if (countEl) countEl.textContent = `${summary.count}개 스케줄`

  const legendValues = document.querySelectorAll('.schedule-chart__legend-value')
  const percents = [summary.commercial, summary.public, summary.internal]
  legendValues.forEach((el, index) => {
    el.innerHTML = `${percents[index] ?? 0}<span>%</span>`
  })
}

function initCalendar() {
  const $input = $('#schedule-daterange')
  const host = document.querySelector('[data-calendar-host]')
  if (!$input.length || !(host instanceof HTMLElement)) return

  if (typeof $.fn.daterangepicker !== 'function') {
    console.error('[schedule] daterangepicker가 로드되지 않았습니다.')
    return
  }

  const initial = moment('2026-06-29')

  $input.daterangepicker(
    {
      parentEl: host,
      singleDatePicker: true,
      autoApply: true,
      alwaysShowCalendars: true,
      showDropdowns: false,
      linkedCalendars: false,
      startDate: initial,
      endDate: initial,
      opens: 'center',
      drops: 'down',
      locale: {
        format: 'YYYY-MM-DD',
        applyLabel: '적용',
        cancelLabel: '취소',
        daysOfWeek: ['일', '월', '화', '수', '목', '금', '토'],
        monthNames: [
          '1월',
          '2월',
          '3월',
          '4월',
          '5월',
          '6월',
          '7월',
          '8월',
          '9월',
          '10월',
          '11월',
          '12월',
        ],
        firstDay: 0,
      },
    },
    (start) => {
      updateDayPanel(start.clone())
      const currentPicker = $input.data('daterangepicker')
      if (currentPicker) enhanceCalendarDays(currentPicker)
    },
  )

  const picker = $input.data('daterangepicker')
  if (!picker) return

  const refresh = () => {
    updateToolbar(picker.leftCalendar.month.clone())
    enhanceCalendarDays(picker)
  }

  $input.on('showCalendar.daterangepicker', refresh)
  $input.on('show.daterangepicker', refresh)

  picker.show()
  refresh()
  updateDayPanel(initial)

  // 인라인 캘린더 — hide 시 show()를 다시 부르면 startDate 월로 리셋됨
  picker.hide = () => {
    picker.container.show()
    picker.isShowing = true
  }

  const goMonth = (delta) => {
    picker.leftCalendar.month.add(delta, 'month')
    if (picker.rightCalendar?.month) {
      picker.rightCalendar.month = picker.leftCalendar.month.clone().add(1, 'month')
    }
    picker.updateCalendars()
    refresh()
  }

  document.querySelector('[data-calendar-prev]')?.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    goMonth(-1)
  })

  document.querySelector('[data-calendar-next]')?.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    goMonth(1)
  })
}

initSchedulePageTabs()
initCalendar()
initScheduleMediaPicker()
