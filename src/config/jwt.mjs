import { randomBytes } from 'node:crypto'

// A random secret is created for local experiments when JWT_SECRET is not set.
// Set JWT_SECRET explicitly for a stable server secret (never commit secrets).
export const JWT_SECRET = process.env.JWT_SECRET || randomBytes(32).toString('hex')
export const JWT_COOKIE = 'hw04.token'
export const JWT_EXPIRY = '1h'
export const JWT_COOKIE_MAX_AGE_MS = 60 * 60 * 1000
export const JWT_ISSUER = 'express-homework-04'

export function tokenCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: JWT_COOKIE_MAX_AGE_MS,
  }
}
