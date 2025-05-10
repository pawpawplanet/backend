const express = require('express')
const router = express.Router()
const freelancers = require('../controllers/freelancers')
const authenticateToken = require('../middlewares/auth')

router.get('/profile', authenticateToken, freelancers.getFreelancerProfile)
router.post('/profile', authenticateToken, freelancers.postFreelancerProfile)
router.patch('/profile', authenticateToken, freelancers.updateFreelancerProfile)

module.exports = router