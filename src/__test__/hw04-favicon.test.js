import { describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '../server.mjs'

const pages = ['/users', '/users/test-user-1', '/articles', '/articles/test-article-1']

describe('HW04 static favicon', () => {
  test.each(pages)('GET %s references /favicon.ico', async (url) => {
    const response = await request(app).get(url).set('Accept', 'text/html')
    expect(response.status).toBe(200)
    expect(response.text).toContain('href="/favicon.ico"')
    expect(response.text).toContain('href="/assets/favicon.svg"')
  })

  test('favicon.ico is served as a nonempty ICO file', async () => {
    const response = await request(app).get('/favicon.ico')
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/^image\/(vnd\.microsoft\.icon|x-icon)/)
    expect(response.body.length).toBeGreaterThan(100)
  })
})
