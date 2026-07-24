/** guide.html — 목차 스크롤 하이라이트 */

import { initTimePickers } from '../components/time-picker.js'

initTimePickers()

const navLinks = [...document.querySelectorAll('.guide-nav a')]
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean)

const setActive = (id) => {
  navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`)
  })
}

if (sections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

      if (visible?.target?.id) setActive(visible.target.id)
    },
    { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5] },
  )

  sections.forEach((section) => observer.observe(section))
}

document.querySelectorAll('.toggle').forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const on = toggle.classList.toggle('is-on')
    toggle.setAttribute('aria-pressed', on ? 'true' : 'false')
  })
})
