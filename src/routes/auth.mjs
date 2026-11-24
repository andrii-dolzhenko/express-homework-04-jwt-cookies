import { Router } from 'express'
import { register, login, me, logout } from '../controllers/auth.mjs'
import { requireJwt } from '../middlewares/requireJwt.mjs'

const router = Router()
router.post('/register', register)
router.post('/login', login)
router.get('/me', requireJwt, me)
router.post('/logout', logout)
export default router
