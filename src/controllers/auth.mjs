import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { accounts } from '../data/accounts.mjs'
import { JWT_COOKIE, JWT_ISSUER, JWT_SECRET, JWT_EXPIRY, tokenCookieOptions } from '../config/jwt.mjs'

const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,32}$/

function input(req) {
  const { username, password } = req.body || {}
  if (typeof username !== 'string' || typeof password !== 'string') return null
  const cleanUsername = username.trim()
  if (!USERNAME_PATTERN.test(cleanUsername) || password.length < 8 || password.length > 72) return null
  return { username: cleanUsername, password }
}

function setAuthCookie(res, account) {
  const token = jwt.sign(
    { sub: account.id, username: account.username },
    JWT_SECRET,
    { algorithm: 'HS256', expiresIn: JWT_EXPIRY, issuer: JWT_ISSUER }
  )
  res.cookie(JWT_COOKIE, token, tokenCookieOptions())
}

export async function register(req, res) {
  const values = input(req)
  if (!values) return res.status(400).json({ error: 'Invalid username or password' })

  const key = values.username.toLowerCase()
  if (accounts.has(key)) return res.status(409).json({ error: 'Username already exists' })

  const account = {
    id: randomUUID(),
    username: values.username,
    passwordHash: await bcrypt.hash(values.password, 10),
  }
  accounts.set(key, account)
  setAuthCookie(res, account)
  return res.status(201).json({ user: { id: account.id, username: account.username } })
}

export async function login(req, res) {
  const values = input(req)
  if (!values) return res.status(400).json({ error: 'Invalid username or password' })

  const account = accounts.get(values.username.toLowerCase())
  if (!account || !(await bcrypt.compare(values.password, account.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  setAuthCookie(res, account)
  return res.status(200).json({ user: { id: account.id, username: account.username } })
}

export function me(req, res) {
  return res.status(200).json({ user: req.authUser })
}

export function logout(req, res) {
  res.clearCookie(JWT_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
  return res.status(204).end()
}
