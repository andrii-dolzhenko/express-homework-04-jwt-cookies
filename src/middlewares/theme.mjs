import { DEFAULT_THEME, THEME_COOKIE_NAME, VALID_THEMES } from '../config/theme.mjs'

// Theme is untrusted cookie input: only known values reach the templates.
export function loadTheme(req, res, next) {
  const value = req.cookies?.[THEME_COOKIE_NAME]
  res.locals.theme = VALID_THEMES.includes(value) ? value : DEFAULT_THEME
  res.locals.currentPath = req.path
  next()
}
