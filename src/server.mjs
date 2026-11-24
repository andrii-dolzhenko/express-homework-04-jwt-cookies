// Express REST API із модульною архітектурою та навчальними middleware

import express from 'express'
import { resolve } from 'node:path'
import router from './routes/index.mjs'
import { logRequests } from './middlewares/logRequests.mjs'
import { sessionMiddleware } from './middlewares/session.mjs'

const PORT = 3000
const app = express()

// Both PUG and EJS use this views folder; explicit file extensions select the engine.
app.set('views', resolve(process.cwd(), 'src/views'))
app.set('view engine', 'pug')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Глобальний middleware логування після парсерів тіла запиту
app.use(logRequests)

// Навчальні сесії: cookie містить лише ID; дані зберігаються на сервері.
app.use(sessionMiddleware)

// Shared stylesheet and favicon for server-rendered PUG / EJS pages.
app.use('/assets', express.static(resolve(process.cwd(), 'src/public')))
// Also expose /favicon.ico at the site's root as required by HW04.
app.use(express.static(resolve(process.cwd(), 'src/public'), { index: false }))

// Маршрути
app.use(router)

// Обробка помилок для неіснуючих маршрутів
app.use((req, res) => {
  res.status(404).send('Not Found')
})

// Глобальна обробка помилок
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err)

  if (err.status === 400 && err.type === 'entity.parse.failed') {
    return res.status(400).send('Bad Request')
  }

  console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`)
  return res.status(500).send('Internal Server Error')
})

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
  console.log(`
Routes:
  GET                 /
  GET, POST           /users, /articles
  GET, PUT, DELETE    /users/:userId, /articles/:articleId
  POST                /users/strict, /articles/strict
  GET, DELETE         /session  (server-side session visits)`)
  console.log(`
Middleware:
  logRequests          Request metadata and redacted POST/PUT bodies
  demoAuth / strictAuth  Optional Basic-header verification
  validation           User name <= 100; article title <= 200
  demoArticleAccess    Admin-only DELETE when strict access is enabled
  resourceExists       404 on missing users or articles
  express-session      Server-side visit counter; HttpOnly session-ID cookie`)
  console.log(`
Try strict modes:
  curl -i -X POST http://localhost:${PORT}/users/strict -H 'Content-Type: application/json' -H 'Authorization: Basic dGVzdDp0ZXN0' -d '{"name":"Demo User"}'
  curl -i -X DELETE http://localhost:${PORT}/articles/test-article-1 -H 'x-require-strict-access: true' -H 'Authorization: Basic admin'
`)
})

export { server, app }
