import { app, server } from '../server.mjs'
import { describe, test, expect, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest'

describe('Express Middlewares', () => {
  beforeAll(async () => {
    // Вимикаємо консоль, щоб логи мідлварів не смітили у виводі тестів
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterAll(() => {
    if (server && server.listening) {
      server.close()
    }
    vi.restoreAllMocks()
  })

  describe('1. Data Validation (validateUserData, validateArticleData)', () => {
    test('POST /users повинен відхиляти занадто довге ім\'я (>100 символів)', async () => {
      const longName = 'A'.repeat(101)
      const response = await request(app).post('/users').send({ name: longName })
      expect(response.status).toBe(400)
    })
    
    test('POST /articles повинен відхиляти занадто довгий заголовок (>200 символів)', async () => {
      const longTitle = 'B'.repeat(201)
      const response = await request(app).post('/articles').send({ title: longTitle })
      expect(response.status).toBe(400)
    })
  })

  describe('2. Strict Authentication (strictAuth)', () => {
    test('POST /users/strict без заголовка Authorization повинен повертати 401', async () => {
      const response = await request(app).post('/users/strict').send({ name: 'Strict User' })
      expect(response.status).toBe(401)
    })

    test('POST /users/strict з неправильним форматом Authorization повинен повертати 401', async () => {
      const response = await request(app)
        .post('/users/strict')
        .set('Authorization', 'Bearer token123')
        .send({ name: 'Strict User' })
      expect(response.status).toBe(401)
    })

    test('POST /users/strict з правильним заголовком Authorization повинен повертати 201', async () => {
      const response = await request(app)
        .post('/users/strict')
        .set('Authorization', 'Basic dGVzdDp0ZXN0') // Basic test:test
        .send({ name: 'Strict User' })
      expect(response.status).toBe(201)
    })
  })

  describe('3. Strict Article Access (demoArticleAccess)', () => {
    let testArticleId

    beforeAll(async () => {
      // Створюємо статтю для тестів видалення
      const response = await request(app)
        .post('/articles')
        .send({ title: 'Article For Delete Test' })
      testArticleId = response.body.id
    })

    test('DELETE /articles/:id у строгому режимі без ролі admin повинен повертати 403', async () => {
      const response = await request(app)
        .delete(`/articles/${testArticleId}`)
        .set('x-require-strict-access', 'true')
        .set('Authorization', 'Basic dGVzdDp0ZXN0') // test:test (без admin)
      expect(response.status).toBe(403)
    })

    test('DELETE /articles/:id у строгому режимі з роллю admin повинен повертати 204', async () => {
      const response = await request(app)
        .delete(`/articles/${testArticleId}`)
        .set('x-require-strict-access', 'true')
        .set('Authorization', 'Basic admin') // has 'admin' in string
      expect(response.status).toBe(204)
    })
  })

  describe('4. Resource Existence (checkUserExists, checkArticleExists)', () => {
    test('PUT /users/:id для неіснуючого користувача повинен повертати 404', async () => {
      const response = await request(app).put('/users/non-existent-user').send({ name: 'Ghost' })
      expect(response.status).toBe(404)
    })

    test('DELETE /articles/:id для неіснуючої статті повинен повертати 404', async () => {
      const response = await request(app).delete('/articles/non-existent-article')
      expect(response.status).toBe(404)
    })
  })
})
