const express = require('express')
const router = express.Router()
const upload = require('../controllers/upload')
const authenticateToken = require('../middlewares/auth')

router.post('/', authenticateToken, upload.uploadMiddleware, upload.postUploadImage)

module.exports = router