import { Router } from 'express'

const router = Router()

// The dashboard is server-rendered so the cookie-selected theme is available.
router.get('/', (req, res) => res.render('demo.pug'))
router.get('/icon', (req, res) => res.render('demo-icon.pug'))

export default router
