const express = require('express')
const router = express.Router()
const pets = require('../controllers/pet')
const authenticateToken = require('../middlewares/auth')

router.get('/', authenticateToken, pets.getPet)
router.post('/', authenticateToken, pets.postPet)
router.patch('/', authenticateToken, pets.patchPet)

module.exports = router