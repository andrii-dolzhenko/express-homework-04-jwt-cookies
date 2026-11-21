import { describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '../server.mjs'

describe('EJS article pages', () => {
  test('GET /articles renders an HTML list for a browser', async () => {
    const response = await request(app).get('/articles').set('Accept', 'text/html')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/^text\/html/)
    expect(response.text).toContain('<!DOCTYPE html>')
    expect(response.text).toContain('Articles')
    expect(response.text).toContain('/articles/test-article-1')
  })

  test('GET /articles/:articleId renders details of the selected article', async () => {
    const response = await request(app).get('/articles/test-article-1').set('Accept', 'text/html')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/^text\/html/)
    expect(response.text).toContain('test-article-1')
    expect(response.text).toContain('Тестова стаття 1')
  })

  test('GET /articles without Accept: text/html keeps JSON compatibility', async () => {
    const response = await request(app).get('/articles')

    expect(response.status).toBe(200)
    expect(response.body).toBeInstanceOf(Array)
    expect(response.body[0]).toHaveProperty('title')
  })

  test('GET /articles/:articleId with Accept: application/json keeps JSON', async () => {
    const response = await request(app)
      .get('/articles/test-article-1')
      .set('Accept', 'application/json')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ id: 'test-article-1', title: 'Тестова стаття 1' })
  })

  test('nonexistent article returns 404 instead of an HTML details page', async () => {
    const response = await request(app).get('/articles/missing-id').set('Accept', 'text/html')

    expect(response.status).toBe(404)
    expect(response.text).toBe('Not Found')
  })

  test('HTML pages use the same data as the REST API and escape article titles', async () => {
    const title = '<img src=x onerror=alert(1)>'
    const created = await request(app).post('/articles').send({ title })
    expect(created.status).toBe(201)

    try {
      const response = await request(app)
        .get(`/articles/${created.body.id}`)
        .set('Accept', 'text/html')

      expect(response.status).toBe(200)
      expect(response.text).toContain('&lt;img src=x onerror=alert(1)&gt;')
      expect(response.text).not.toContain(title)
    } finally {
      await request(app).delete(`/articles/${created.body.id}`)
    }
  })
})
