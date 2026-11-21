import { describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '../server.mjs'

const htmlRoutes = [
  '/users',
  '/users/test-user-1',
  '/articles',
  '/articles/test-article-1',
]

describe('Shared styling for PUG and EJS pages', () => {
  test.each(htmlRoutes)('GET %s includes the same stylesheet and favicon', async (route) => {
    const response = await request(app).get(route).set('Accept', 'text/html')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/^text\/html/)
    expect(response.text).toContain('href="/assets/css/styles.css"')
    expect(response.text).toContain('href="/assets/favicon.svg"')
    expect(response.text).toContain('class="site-header"')
  })

  test('shared CSS is served with the correct content type and responsive rules', async () => {
    const response = await request(app).get('/assets/css/styles.css')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/^text\/css/)
    expect(response.text).toContain('.record-grid')
    expect(response.text).toContain('@media (max-width: 580px)')
  })

  test('favicon is served as an SVG asset', async () => {
    const response = await request(app).get('/assets/favicon.svg')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/^image\/svg\+xml/)
    const svg = response.text ?? response.body?.toString('utf8')
    expect(svg).toContain('<svg')
  })
})
