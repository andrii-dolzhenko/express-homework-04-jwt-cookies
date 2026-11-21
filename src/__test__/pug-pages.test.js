import { describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '../server.mjs'

describe('PUG user pages', () => {
  test('GET /users renders an HTML list when requested by a browser', async () => {
    const response = await request(app).get('/users').set('Accept', 'text/html')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/^text\/html/)
    expect(response.text).toContain('<!DOCTYPE html>')
    expect(response.text).toContain('Users')
    expect(response.text).toContain('/users/test-user-1')
  })

  test('GET /users/:userId renders the correct user details', async () => {
    const response = await request(app).get('/users/test-user-1').set('Accept', 'text/html')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/^text\/html/)
    expect(response.text).toContain('test-user-1')
    expect(response.text).toContain('Тестовий користувач 1')
  })

  test('ordinary GET /users continues to return JSON', async () => {
    const response = await request(app).get('/users').set('Accept', 'application/json')

    expect(response.status).toBe(200)
    expect(response.body).toBeInstanceOf(Array)
  })

  test('unknown user still returns 404', async () => {
    const response = await request(app).get('/users/missing-id').set('Accept', 'text/html')

    expect(response.status).toBe(404)
    expect(response.text).toBe('Not Found')
  })
})
