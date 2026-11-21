import { Router } from 'express'
import { getRoot } from '../controllers/root.mjs'
import usersRouter from './users.mjs'
import articlesRouter from './articles.mjs'
import sessionRouter from './session.mjs'
import themeRouter from './theme.mjs'

const router = Router()

router.get('/', getRoot)
router.use('/users', usersRouter)
router.use('/articles', articlesRouter)
router.use('/session', sessionRouter)
router.use('/theme', themeRouter)

export default router
