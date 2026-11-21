// Демонстраційний контроль доступу. НЕ використовуйте як реальну авторизацію.
export function demoArticleAccess(req, res, next) {
  const strictMode = req.get('x-require-strict-access') === 'true'

  if (!strictMode || req.method !== 'DELETE') {
    return next()
  }

  const authorization = req.get('Authorization') || ''
  const credentials = authorization.match(/^Basic\s+(\S+)$/i)?.[1] || ''
  const decoded = Buffer.from(credentials, 'base64').toString('utf8')
  // `Basic admin` потрібен для прикладу з тестів; коректний Base64 теж розпізнається.
  const isAdmin = credentials === 'admin' || decoded.startsWith('admin:')

  if (!isAdmin) {
    console.log('[ACCESS] DELETE article rejected: admin role required')
    return res.status(403).send('Forbidden')
  }

  next()
}
