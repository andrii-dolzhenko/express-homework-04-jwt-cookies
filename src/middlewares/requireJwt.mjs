import jwt from 'jsonwebtoken'
import { accounts } from '../data/accounts.mjs'
import { JWT_COOKIE, JWT_ISSUER, JWT_SECRET } from '../config/jwt.mjs'

export function requireJwt(req, res, next) {
  const header = req.get('Authorization') || ''
  const bearer = header.match(/^Bearer\s+(\S+)$/i)?.[1]
  const token = req.cookies?.[JWT_COOKIE] || bearer
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
    })
    // In-memory accounts may have been reset after a server restart.
    const account = Array.from(accounts.values()).find((item) => item.id === payload.sub)
    if (!account) return res.status(401).json({ error: 'Invalid or expired token' })
    req.authUser = { id: account.id, username: account.username }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
