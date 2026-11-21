import { Router } from 'express'
import { listArticles, createArticle, getArticle, updateArticle, deleteArticle } from '../controllers/articles.mjs'
import { validateArticleData } from '../middlewares/validation.mjs'
import { demoAuth, strictAuth, forceStrictAuth } from '../middlewares/auth.mjs'
import { demoArticleAccess } from '../middlewares/articleAccess.mjs'
import { checkArticleExists } from '../middlewares/resourceExists.mjs'

const router = Router()

router.use(demoAuth, strictAuth, demoArticleAccess)

// Демонстрація створення статті з обов'язковою Basic-аутентифікацією.
router.post('/strict', forceStrictAuth, validateArticleData, createArticle)

router.get('/', listArticles)
router.post('/', validateArticleData, createArticle)
router.get('/:articleId', checkArticleExists, getArticle)
router.put('/:articleId', checkArticleExists, validateArticleData, updateArticle)
router.delete('/:articleId', checkArticleExists, deleteArticle)

export default router
