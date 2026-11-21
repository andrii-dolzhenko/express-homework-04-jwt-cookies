import { users } from '../data/users.mjs'
import { wantsHtml } from '../utils/wantsHtml.mjs'

export function listUsers(req, res) {
  const allUsers = Array.from(users.entries()).map(([id, user]) => ({ id, ...user }))
  if (wantsHtml(req)) {
    return res.status(200).render('users/list.pug', { users: allUsers })
  }

  res.status(200).json(allUsers)
}

export function createUser(req, res) {
  const { name } = req.body
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).send('Bad Request')
  }

  const userId = Date.now().toString()
  users.set(userId, { name: name.trim() })

  res.status(201).json({ id: userId, name: name.trim() })
}

export function getUser(req, res) {
  const user = users.get(req.params.userId)
  if (!user) {
    return res.status(404).send('Not Found')
  }
  const userDetails = { id: req.params.userId, ...user }
  if (wantsHtml(req)) {
    return res.status(200).render('users/details.pug', { user: userDetails })
  }

  res.status(200).json(userDetails)
}

export function updateUser(req, res) {
  const user = users.get(req.params.userId)
  if (!user) {
    return res.status(404).send('Not Found')
  }

  const { name } = req.body
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).send('Bad Request')
  }

  users.set(req.params.userId, { name: name.trim() })
  res.status(200).json({ id: req.params.userId, name: name.trim() })
}

export function deleteUser(req, res) {
  if (!users.has(req.params.userId)) {
    return res.status(404).send('Not Found')
  }
  users.delete(req.params.userId)
  res.status(204).send()
}
