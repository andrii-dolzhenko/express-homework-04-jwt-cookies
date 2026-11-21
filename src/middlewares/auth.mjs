// Навчальна перевірка заголовка Authorization (не production-аутентифікація).
export function demoAuth(req, res, next) {
  const hasAuthorization = Boolean(req.get('Authorization'))
  console.log(`[AUTH] ${hasAuthorization ? 'Authorization header provided' : 'WARN: Authorization header missing (demo mode)'}`)
  next()
}

// За замовчуванням запити проходять. Заголовок x-require-auth вмикає перевірку.
export function strictAuth(req, res, next) {
  const required = req.forceStrictAuth === true || req.get('x-require-auth') === 'true'

  if (required && !/^Basic\s+\S+$/i.test(req.get('Authorization') || '')) {
    console.log('[AUTH] Request rejected: Basic Authorization required')
    return res.status(401).send('Unauthorized')
  }

  next()
}

// Для демонстраційних /strict маршрутів аутентифікація завжди обов'язкова.
export function forceStrictAuth(req, res, next) {
  req.forceStrictAuth = true
  strictAuth(req, res, next)
}
