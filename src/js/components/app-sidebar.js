/**
 * 좌측 GNB 1차 메뉴 클릭 시 2차 메뉴(gnb_extend)를 토글합니다.
 */
export function initAppSidebar() {
  const sidebar = document.querySelector('.app-sidebar')
  if (!sidebar) return

  const activeMenu = document.body.dataset.activeMenu
  const activeSubmenuItem = document.body.dataset.activeSubmenuItem

  if (activeMenu) {
    sidebar.querySelector('.sidebar-menu.is-active')?.classList.remove('is-active')
    sidebar
      .querySelector(`[aria-controls="sidebar-submenu-${activeMenu}"]`)
      ?.classList.add('is-active')
  }

  if (activeSubmenuItem) {
    sidebar.querySelectorAll('.sidebar-submenu__item.is-active').forEach((item) => {
      item.classList.remove('is-active')
    })
    sidebar
      .querySelector(`[data-submenu-item="${activeSubmenuItem}"]`)
      ?.classList.add('is-active')
  }

  const groups = [...sidebar.querySelectorAll('.sidebar-menu-group')]
  const nav = sidebar.querySelector('.app-sidebar__nav')

  const getSubmenu = (trigger) => {
    const submenuId = trigger.getAttribute('aria-controls')
    return submenuId ? document.getElementById(submenuId) : null
  }

  const positionSubmenu = (trigger, submenu) => {
    if (!nav) return

    const sidebarRect = sidebar.getBoundingClientRect()
    const navRect = nav.getBoundingClientRect()
    const triggerRect = trigger.getBoundingClientRect()
    const top = triggerRect.top - sidebarRect.top + triggerRect.height / 2
    const left = navRect.right - sidebarRect.left + 8

    submenu.style.setProperty('--submenu-top', `${top}px`)
    submenu.style.setProperty('--submenu-left', `${left}px`)
  }

  const setGroupExpanded = (group, isExpanded) => {
    const trigger = group.querySelector('[data-has-submenu]')
    const submenu = trigger ? getSubmenu(trigger) : null

    group.classList.toggle('is-expanded', isExpanded)
    trigger?.setAttribute('aria-expanded', String(isExpanded))

    if (!submenu) return

    if (isExpanded && trigger) {
      positionSubmenu(trigger, submenu)
      submenu.hidden = false
      return
    }

    submenu.hidden = true
  }

  const closeAllGroups = () => {
    sidebar.querySelectorAll('.sidebar-submenu').forEach((submenu) => {
      submenu.hidden = true
    })

    groups.forEach((group) => {
      group.classList.remove('is-expanded')
      group.querySelector('[data-has-submenu]')?.setAttribute('aria-expanded', 'false')
    })
  }

  groups.forEach((group) => {
    const trigger = group.querySelector('[data-has-submenu]')
    const submenu = trigger ? getSubmenu(trigger) : null
    if (!trigger || !submenu) return

    trigger.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()

      const willExpand = !group.classList.contains('is-expanded')
      closeAllGroups()

      if (willExpand) {
        setGroupExpanded(group, true)
      }
    })
  })

  window.addEventListener('resize', () => {
    const expandedGroup = groups.find((group) => group.classList.contains('is-expanded'))
    const trigger = expandedGroup?.querySelector('[data-has-submenu]')
    const submenu = trigger ? getSubmenu(trigger) : null

    if (trigger && submenu && !submenu.hidden) {
      positionSubmenu(trigger, submenu)
    }
  })

  document.addEventListener('click', (event) => {
    if (!sidebar.contains(event.target)) {
      closeAllGroups()
    }
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllGroups()
    }
  })
}
