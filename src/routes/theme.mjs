import { Router } from 'express'
import { readTheme, saveTheme } from '../controllers/theme.mjs'

const router = Router()
router.get('/', readTheme)
router.post('/', saveTheme)
export default router
