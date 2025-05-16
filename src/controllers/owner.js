const { dataSource } = require('../db/data-source')
const validation = require('../utils/validation')
const orderHelper = require('../lib/order-helpers')
const order = require('./order')

async function getOrders(req, res, next) {
  return result = await order.getOrdersByRole(orderHelper.USER_ROLES.OWNER, req, res, next)
}

module.exports = {
  getOrders
}