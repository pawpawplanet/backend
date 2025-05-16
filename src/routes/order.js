const express = require('express')
const router = express.Router()
const orders = require('../controllers/order')
const authenticateToken = require('../middlewares/auth')


router.post('/:id/review', authenticateToken, orders.PostOrderReview)
router.patch('/:id', authenticateToken, orders.patchOrderStatus)

module.exports = router