/**
 * 핸들 기반 포인터 드래그 정렬 (마우스/터치 공통)
 *
 * @param {object} options
 * @param {HTMLElement} options.list
 * @param {string} options.itemSelector
 * @param {string} options.handleSelector
 * @param {string} [options.draggingClass='is-dragging']
 * @param {() => void} [options.onReorder]
 */
export function initPointerSortList({
  list,
  itemSelector,
  handleSelector,
  draggingClass = 'is-dragging',
  onReorder,
}) {
  /** @type {HTMLElement | null} */
  let dragItem = null
  /** @type {number | null} */
  let activePointerId = null
  let moved = false

  const finish = () => {
    if (dragItem) {
      dragItem.classList.remove(draggingClass)
      onReorder?.()
    }

    dragItem = null
    activePointerId = null
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
    document.removeEventListener('pointercancel', onPointerUp)
  }

  /**
   * @param {PointerEvent} event
   */
  const onPointerMove = (event) => {
    if (!dragItem || event.pointerId !== activePointerId) return
    event.preventDefault()
    moved = true

    const y = event.clientY
    const siblings = [...list.querySelectorAll(itemSelector)].filter(
      (el) => el instanceof HTMLElement && el !== dragItem,
    )

    for (let index = 0; index < siblings.length; index += 1) {
      const sibling = siblings[index]
      if (!(sibling instanceof HTMLElement)) continue

      const rect = sibling.getBoundingClientRect()
      const mid = rect.top + rect.height / 2

      if (y < mid) {
        if (dragItem.nextElementSibling !== sibling) {
          list.insertBefore(dragItem, sibling)
        }
        return
      }

      const isLast = index === siblings.length - 1
      if (isLast && y >= mid && sibling.nextElementSibling !== dragItem) {
        list.insertBefore(dragItem, sibling.nextElementSibling)
      }
    }
  }

  /**
   * @param {PointerEvent} event
   */
  const onPointerUp = (event) => {
    if (event.pointerId !== activePointerId) return
    finish()
  }

  list.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return

    const target = event.target
    if (!(target instanceof Element)) return

    const handle = target.closest(handleSelector)
    if (!(handle instanceof HTMLElement) || !list.contains(handle)) return

    const item = handle.closest(itemSelector)
    if (!(item instanceof HTMLElement) || !list.contains(item)) return

    event.preventDefault()
    moved = false
    dragItem = item
    activePointerId = event.pointerId
    item.classList.add(draggingClass)

    document.addEventListener('pointermove', onPointerMove, { passive: false })
    document.addEventListener('pointerup', onPointerUp)
    document.addEventListener('pointercancel', onPointerUp)
  })

  list.addEventListener(
    'click',
    (event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (!target.closest(handleSelector)) return
      if (moved) {
        event.preventDefault()
        event.stopPropagation()
      }
    },
    true,
  )
}
