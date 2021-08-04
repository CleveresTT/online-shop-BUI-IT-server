const Router = require('express')
const userRouter = require('../controllers/userController')
const authMiddleware = require('../middlewares/authMiddleware')

const router = new Router()

router.post('/registration', userRouter.registration)
router.post('/login', userRouter.login)
router.get('/auth', authMiddleware, userRouter.check)

module.exports = router