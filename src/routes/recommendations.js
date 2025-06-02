const express = require('express')
const router = express.Router()
const recommendations = require('../controllers/recommendations')

router.get('/', recommendations.getRecommendations)

module.exports = router
