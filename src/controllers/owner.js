const validation = require('../utils/validation')
const orderHelper = require('../lib/order-helpers')
const order = require('./order')

async function getOrders(req, res, next) {
  try {
    const result = await order.getOrdersByRole(orderHelper.USER_ROLES.OWNER, req, res, next)

    if (validation.isNotValidObject(result)) {
      return { statusCode: 500, status: 'failed', message: '伺服器錯誤：getOrders has no result...' }
    }

    const isSuccess = !validation.isNotSuccessStatusCode(result.statusCode)
    return res.status(result.statusCode).json({
      status: result.status,
      message: result.message,
      ...(isSuccess && {
        limit: result.data.limit,
        page: result.data.page,
        total: result.data.total,
        data: result.data.orders,
      })
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getOrders
}