document.querySelector('[data-error-back]')?.addEventListener('click', () => {
  if (window.history.length > 1) {
    window.history.back()
    return
  }

  window.location.href = './'
})
