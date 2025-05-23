const express = require('express')
const router = express.Router()
const orders = require('../controllers/order')
const authenticateToken = require('../middlewares/auth')


router.post('/:id/review', authenticateToken, orders.PostOrderReview)
router.post('/', authenticateToken, orders.PostOrder)
router.patch('/:id', authenticateToken, orders.patchOrderStatus)
router.get('/:id/same-date/accepted', authenticateToken, orders.getOrdersAcceptedOnSameDate)
router.get('/:id/same-date/requested', authenticateToken, orders.getOrdersRequestedOnSameDate)

module.exports = router