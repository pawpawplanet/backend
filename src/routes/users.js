const express = require('express')
const router = express.Router()
const users = require('../controllers/users')

router.post('/signup', users.postSignup)
router.post('/login', users.postLogin)

module.exports = router