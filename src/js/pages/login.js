const SAVED_EMAIL_KEY = 'doohSavedEmail'

/**
 * 로그인 페이지 전용 동작.
 * 상품 안내 모달도 로그인에서만 쓰므로 여기 둡니다.
 */
export function initLoginPage() {
  const loginForm = document.querySelector('#login-form')
  const emailInput = document.querySelector('#email')
  const saveIdInput = document.querySelector('#save-id')
  const modal = document.querySelector('#pricing-modal')
  const openPricingButton = document.querySelector('#open-pricing')

  if (!loginForm || !emailInput || !saveIdInput) return

  if (modal && openPricingButton) {
    const closeButtons = modal.querySelectorAll('[data-close-modal]')

    const setModalOpen = (isOpen) => {
      modal.classList.toggle('is-open', isOpen)
      modal.setAttribute('aria-hidden', String(!isOpen))
      document.body.classList.toggle('modal-open', isOpen)

      if (isOpen) {
        closeButtons[0]?.focus()
      } else {
        openPricingButton.focus()
      }
    }

    openPricingButton.addEventListener('click', () => setModalOpen(true))
    closeButtons.forEach((button) => {
      button.addEventListener('click', () => setModalOpen(false))
    })

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) {
        setModalOpen(false)
      }
    })
  }

  const savedEmail = localStorage.getItem(SAVED_EMAIL_KEY)
  if (savedEmail) {
    emailInput.value = savedEmail
    saveIdInput.checked = true
  }

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault()

    if (!loginForm.checkValidity()) {
      loginForm.reportValidity()
      return
    }

    if (saveIdInput.checked) {
      localStorage.setItem(SAVED_EMAIL_KEY, emailInput.value)
    } else {
      localStorage.removeItem(SAVED_EMAIL_KEY)
    }
  })
}
