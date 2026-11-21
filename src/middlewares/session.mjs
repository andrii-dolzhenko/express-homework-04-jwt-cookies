import { randomBytes } from 'node:crypto'
import session from 'express-session'

// In-memory sessions for this coursework demo only. MemoryStore is not production-safe.
export const SESSION_COOKIE_NAME = 'hw03.sid'

export const sessionMiddleware = session({
  name: SESSION_COOKIE_NAME,
  secret: process.env.SESSION_SECRET || randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // localhost uses HTTP; production must use HTTPS and secure cookies.
    maxAge: 10 * 60 * 1000,
  },
})
