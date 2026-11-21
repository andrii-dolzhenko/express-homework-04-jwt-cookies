import { Router } from 'express'
import { SESSION_COOKIE_NAME } from '../middlewares/session.mjs'

const router = Router()

// Increment a server-side counter; the browser keeps only an opaque session-ID cookie.
router.get('/', (req, res) => {
  req.session.visits = (req.session.visits || 0) + 1
  res.status(200).type('text/plain').send(`Visits: ${req.session.visits}`)
})

// Reset this browser's demo session without affecting any other sessions or CRUD data.
router.delete('/', (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error)
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/', httpOnly: true, sameSite: 'lax' })
    return res.status(204).end()
  })
})

export default router
