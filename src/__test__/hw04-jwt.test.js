import { randomUUID } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '../server.mjs'
import { accounts } from '../data/accounts.mjs'
import { JWT_SECRET, JWT_ISSUER } from '../config/jwt.mjs'

function username() { return `demo_${randomUUID().replace(/-/g, '').slice(0, 16)}` }

async function registerUser(agent, name, password = 'SafePass123!') {
  return agent.post('/auth/register').send({ username: name, password })
}

describe('HW04 JWT authentication', () => {
  test('GET /auth/me rejects unauthenticated requests', async () => {
    const response = await request(app).get('/auth/me')
    expect(response.status).toBe(401)
  })

  test('registration validates credentials', async () => {
    const response = await request(app).post('/auth/register').send({ username: 'ab', password: 'short' })
    expect(response.status).toBe(400)
  })

  test('registration issues an HttpOnly JWT cookie without returning the token in JSON', async () => {
    const response = await registerUser(request(app), username())
    expect(response.status).toBe(201)
    expect(response.body.user).toHaveProperty('id')
    expect(response.body).not.toHaveProperty('token')
    expect(response.headers['set-cookie']?.[0]).toContain('hw04.token=')
    expect(response.headers['set-cookie']?.[0]).toContain('HttpOnly')
    expect(response.headers['set-cookie']?.[0]).toContain('SameSite=Lax')
  })

  test('duplicate username is rejected regardless of letter case', async () => {
    const name = username()
    await registerUser(request(app), name)
    const response = await registerUser(request(app), name.toUpperCase())
    expect(response.status).toBe(409)
  })

  test('passwords are stored as bcrypt hashes, not plaintext', async () => {
    const name = username()
    await registerUser(request(app), name)
    const account = accounts.get(name.toLowerCase())
    expect(account.passwordHash).not.toBe('SafePass123!')
    expect(account.passwordHash).toMatch(/^\$2[aby]\$/)
  })

  test('bad password produces 401', async () => {
    const name = username()
    await registerUser(request(app), name)
    const response = await request(app).post('/auth/login').send({ username: name, password: 'WrongPass123!' })
    expect(response.status).toBe(401)
  })

  test('login grants cookie access to the protected /auth/me route', async () => {
    const name = username()
    await registerUser(request(app), name)
    const agent = request.agent(app)
    const login = await agent.post('/auth/login').send({ username: name, password: 'SafePass123!' })
    expect(login.status).toBe(200)
    const me = await agent.get('/auth/me')
    expect(me.status).toBe(200)
    expect(me.body.user.username).toBe(name)
  })

  test('logout clears the JWT cookie', async () => {
    const agent = request.agent(app)
    await registerUser(agent, username())
    const logout = await agent.post('/auth/logout')
    expect(logout.status).toBe(204)
    expect(logout.headers['set-cookie']?.[0]).toContain('hw04.token=;')
    const me = await agent.get('/auth/me')
    expect(me.status).toBe(401)
  })

  test('an invalid token is rejected', async () => {
    const response = await request(app).get('/auth/me').set('Cookie', 'hw04.token=bad.token.value')
    expect(response.status).toBe(401)
  })

  test('Bearer Authorization is supported for API testing', async () => {
    const name = username()
    const registered = await registerUser(request(app), name)
    const token = jwt.sign({ sub: registered.body.user.id, username: name }, JWT_SECRET, {
      algorithm: 'HS256', expiresIn: '1h', issuer: JWT_ISSUER,
    })
    const response = await request(app).get('/auth/me').set('Authorization', `Bearer ${token}`)
    expect(response.status).toBe(200)
  })
})
