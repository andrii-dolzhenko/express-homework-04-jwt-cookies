// Логуємо HTTP-запити, не виводячи потенційні секрети з тіла запиту
export function logRequests(req, res, next) {
  const timestamp = new Date().toISOString()
  const ip = req.ip || req.socket?.remoteAddress || 'Unknown'
  const userAgent = req.get('user-agent') || 'Unknown'

  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`)

  if ((req.method === 'POST' || req.method === 'PUT') && req.body && typeof req.body === 'object') {
    const safeBody = JSON.stringify(req.body, (key, value) =>
      /(password|token|secret|authorization|api[_-]?key)/i.test(key) ? '[REDACTED]' : value
    )

    console.log(`  Request body: ${safeBody}`)
  }

  next()
}
