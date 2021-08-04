const Router = require('express')
const ratingController = require('../controllers/ratingController')

const router = new Router()

router.post('/', ratingController.set)
router.get('/', ratingController.get)

module.exports = router