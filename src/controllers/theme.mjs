import { THEME_COOKIE_NAME, THEME_MAX_AGE_MS, VALID_THEMES } from '../config/theme.mjs'

export function readTheme(req, res) {
  res.status(200).json({ theme: res.locals.theme })
}

export function saveTheme(req, res) {
  const { theme, next: nextPage } = req.body || {}
  if (!VALID_THEMES.includes(theme)) {
    return res.status(400).json({ error: 'Theme must be light or dark' })
  }

  res.cookie(THEME_COOKIE_NAME, theme, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: THEME_MAX_AGE_MS,
  })

  // JSON clients can inspect the result; HTML forms return to a safe same-site path.
  if (req.get('accept')?.includes('application/json')) {
    return res.status(200).json({ theme })
  }
  const safePath = typeof nextPage === 'string' &&
    /^\/(?:users|articles|demo)(?:\/[^\/?#]+)?$/.test(nextPage) ? nextPage : '/users'
  return res.redirect(303, safePath)
}
