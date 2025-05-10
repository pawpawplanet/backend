const express = require('express')
const router = express.Router()
const upload = require('../controllers/upload')

router.post('/', upload.uploadMiddleware, upload.postUploadImage)

module.exports = router