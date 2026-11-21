import { articles } from '../data/articles.mjs'
import { wantsHtml } from '../utils/wantsHtml.mjs'

export function listArticles(req, res) {
  const allArticles = Array.from(articles.entries()).map(([id, article]) => ({ id, ...article }))
  if (wantsHtml(req)) {
    return res.status(200).render('articles/list.ejs', { articles: allArticles })
  }

  res.status(200).json(allArticles)
}

export function createArticle(req, res) {
  const { title } = req.body
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).send('Bad Request')
  }

  const articleId = Date.now().toString()
  articles.set(articleId, { title: title.trim() })

  res.status(201).json({ id: articleId, title: title.trim() })
}

export function getArticle(req, res) {
  const article = articles.get(req.params.articleId)
  if (!article) {
    return res.status(404).send('Not Found')
  }
  const articleDetails = { id: req.params.articleId, ...article }
  if (wantsHtml(req)) {
    return res.status(200).render('articles/details.ejs', { article: articleDetails })
  }

  res.status(200).json(articleDetails)
}

export function updateArticle(req, res) {
  const article = articles.get(req.params.articleId)
  if (!article) {
    return res.status(404).send('Not Found')
  }

  const { title } = req.body
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).send('Bad Request')
  }

  articles.set(req.params.articleId, { title: title.trim() })
  res.status(200).json({ id: req.params.articleId, title: title.trim() })
}

export function deleteArticle(req, res) {
  if (!articles.has(req.params.articleId)) {
    return res.status(404).send('Not Found')
  }
  articles.delete(req.params.articleId)
  res.status(204).send()
}
