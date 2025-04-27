const express = require('express')
const router = express.Router()
const users = require('../controllers/users')
const authenticateToken = require('../middlewares/auth')

router.post('/signup', users.postSignup)
router.post('/login', users.postLogin)
// router.get('/profile', authenticateToken, async (req, res) => {
//     const userId = req.user.id
//     res.json({ status: 'success', message: `已登入的使用者 ID: ${userId}` })
// })
router.post('/profile', authenticateToken, users.postOwnerProfile)
router.patch('/profile', authenticateToken, users.patchOwnerProfile)


module.exports = router