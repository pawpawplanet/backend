const express = require('express')
const router = express.Router()
const freelancers = require('../controllers/freelancers')
const authenticateToken = require('../middlewares/auth')

router.get('/profile', authenticateToken, freelancers.getFreelancerProfile)
router.post('/profile', authenticateToken, freelancers.postFreelancerProfile)
router.patch('/profile', authenticateToken, freelancers.updateFreelancerProfile)

router.get('/orders', authenticateToken, freelancers.getOrders)

router.post('/services', authenticateToken,freelancers.createOrUpdateService)
router.get('/services/:id', authenticateToken,freelancers.getFreelancerServiceDetail)

router.get('/:id/schedule', authenticateToken, freelancers.getSchedule)

module.exports = router