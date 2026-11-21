import { Router } from 'express'
import { listUsers, createUser, getUser, updateUser, deleteUser } from '../controllers/users.mjs'
import { validateUserData } from '../middlewares/validation.mjs'
import { demoAuth, strictAuth, forceStrictAuth } from '../middlewares/auth.mjs'
import { checkUserExists } from '../middlewares/resourceExists.mjs'

const router = Router()

// Звичайні маршрути доступні без авторизації; строгий режим — за заголовком.
router.use(demoAuth, strictAuth)

// Статичний маршрут розміщено до маршрутів з параметрами.
router.post('/strict', forceStrictAuth, validateUserData, createUser)

router.get('/', listUsers)
router.post('/', validateUserData, createUser)
router.get('/:userId', checkUserExists, getUser)
router.put('/:userId', checkUserExists, validateUserData, updateUser)
router.delete('/:userId', checkUserExists, deleteUser)

export default router
