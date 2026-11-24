// Browser-only theme preview. No cookies, authentication or server requests.
// This file is copied to GitHub Pages and is not used by the Express app.
(() => {
  'use strict'

  function selectTheme(theme) {
    document.documentElement.dataset.theme = theme
    for (const button of document.querySelectorAll('[data-preview-theme], [data-theme-choice]')) {
      const selected = (button.dataset.previewTheme || button.dataset.themeChoice) === theme
      button.setAttribute('aria-pressed', String(selected))
    }
    const feedback = document.querySelector('#theme-feedback')
    if (feedback) {
      feedback.textContent = 'Preview: ' + theme + ' appearance. No server cookie is saved.'
    }
  }

  for (const button of document.querySelectorAll('[data-preview-theme], [data-theme-choice]')) {
    button.addEventListener('click', () => {
      const theme = button.dataset.previewTheme || button.dataset.themeChoice
      if (theme === 'light' || theme === 'dark') selectTheme(theme)
    })
  }

  const initial = document.documentElement.dataset.theme
  selectTheme(initial === 'dark' ? 'dark' : 'light')
})()
