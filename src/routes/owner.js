const express = require('express')
const router = express.Router()

const owner = require('../controllers/owner')
const authenticateToken = require('../middlewares/auth')

router.get('/orders', authenticateToken, owner.getOrders)
router.get('/reserved-dates', authenticateToken, owner.getReservedDates)

module.exports = router