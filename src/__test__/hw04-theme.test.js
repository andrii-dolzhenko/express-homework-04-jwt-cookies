import { describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '../server.mjs'

describe('HW04 theme preference cookie', () => {
  test('defaults to Light in the PUG page', async () => {
    const response = await request(app).get('/users').set('Accept', 'text/html')
    expect(response.status).toBe(200)
    expect(response.text).toContain('data-theme="light"')
  })

  test('defaults to Light in the EJS page', async () => {
    const response = await request(app).get('/articles').set('Accept', 'text/html')
    expect(response.status).toBe(200)
    expect(response.text).toContain('data-theme="light"')
  })

  test('POST /theme saves the selected theme in a cookie', async () => {
    const response = await request(app).post('/theme').set('Accept', 'application/json').send({ theme: 'dark' })
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ theme: 'dark' })
    expect(response.headers['set-cookie']?.[0]).toContain('hw04.theme=dark')
  })

  test('theme persists across PUG and EJS pages for the same browser', async () => {
    const agent = request.agent(app)
    await agent.post('/theme').set('Accept', 'application/json').send({ theme: 'dark' })
    const users = await agent.get('/users').set('Accept', 'text/html')
    const articles = await agent.get('/articles').set('Accept', 'text/html')
    expect(users.text).toContain('data-theme="dark"')
    expect(articles.text).toContain('data-theme="dark"')
  })

  test('GET /theme reads the cookie', async () => {
    const agent = request.agent(app)
    await agent.post('/theme').set('Accept', 'application/json').send({ theme: 'dark' })
    const response = await agent.get('/theme')
    expect(response.body).toEqual({ theme: 'dark' })
  })

  test('invalid theme is rejected', async () => {
    const response = await request(app).post('/theme').send({ theme: 'neon' })
    expect(response.status).toBe(400)
  })

  test('a form submission safely redirects back to a local page', async () => {
    const response = await request(app).post('/theme').type('form').send({ theme: 'dark', next: '/articles/test-article-1' })
    expect(response.status).toBe(303)
    expect(response.headers.location).toBe('/articles/test-article-1')
  })

  test('an external next URL is not allowed as a redirect', async () => {
    const response = await request(app).post('/theme').type('form').send({ theme: 'dark', next: '//example.com' })
    expect(response.status).toBe(303)
    expect(response.headers.location).toBe('/users')
  })
})
