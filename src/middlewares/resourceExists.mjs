import { users } from '../data/users.mjs'
import { articles } from '../data/articles.mjs'

export function checkUserExists(req, res, next) {
  if (!users.has(req.params.userId)) {
    console.log(`[RESOURCE] User not found: ${req.params.userId}`)
    return res.status(404).send('Not Found')
  }

  next()
}

export function checkArticleExists(req, res, next) {
  if (!articles.has(req.params.articleId)) {
    console.log(`[RESOURCE] Article not found: ${req.params.articleId}`)
    return res.status(404).send('Not Found')
  }

  next()
}
