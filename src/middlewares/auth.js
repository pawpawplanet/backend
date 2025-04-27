const jwt = require('jsonwebtoken')
const config = require('../config/index')
const logger = require('../utils/logger')

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ status: 'failed', message: '未提供 token' })
  }

  try {
    const decoded = jwt.verify(token, config.get('secret.jwtSecret'))
    req.user = decoded 
    next()
  } catch (error) {
    logger.warn('Token 驗證失敗', error)
    return res.status(403).json({ status: 'failed', message: 'Token 驗證失敗' })
  }
}

module.exports = authenticateToken