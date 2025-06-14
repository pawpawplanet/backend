const jwt = require('jsonwebtoken')
const config = require('../config/index')
// 不再使用 logger，改為直接使用 console.warn
// const logger = require('../utils/logger')

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(200).json({ status: 'failed', message: '未提供 token' })
  }

  try {
    const decoded = jwt.verify(token, config.get('secret.jwtSecret'))
    req.user = decoded
    next()
  } catch (error) {
    // 使用 console.warn 替代 logger.warn
    console.warn('Token 驗證失敗', error)
    return res.status(200).json({ status: 'failed', message: 'Token 驗證失敗' })
  }
}

module.exports = authenticateToken
