const validation = require('../utils/validation')
const orderHelper = require('../lib/order-helpers')
const order = require('./order')
const dayjs = require('dayjs')
const { dataSource } = require('../db/data-source')

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

// 取得自己的已付款日期(服務即將進行)
async function getReservedDates(req, res, next) {
  try {
    const { id: ownerId, role } = req.user

    if (role !== orderHelper.USER_ROLES.OWNER) {
      return res.status(403).json({
        status: 'failed',
        message: `未經授權：您的角色 (${role}) 沒有執行此 API 的權限`
      })
    }

    const DAYS_AHEAD = 7
    const today = dayjs().tz('Asia/Taipei')
    const startDayJSDate = today.add(1, 'day')
    const endDayJSDate = today.add(DAYS_AHEAD, 'day')

    const availableDates = []
    for (let i = 1; i <= DAYS_AHEAD; i++) {
      const dayJSDate = today.add(i, 'day')
      availableDates.push(dayJSDate.format('YYYY-MM-DD'))
    }

    const orderRepo = dataSource.getRepository('Order')
    const orders = await orderRepo
      .createQueryBuilder('order')
      .where('order.owner_id = :ownerId ', { ownerId })
      .andWhere('order.status = :status', { status: orderHelper.ORDER_STATUS.PAID })
      .andWhere('order.service_date IN (:...dates)', { dates: availableDates })
      .getMany()

    const reservedStrDates = orders.map(order => order.service_date)
      .map(date => dayjs(date).tz('Asia/Taipei').format('YYYY-MM-DD'))


    return res.status(200).json({
      status: 'success',
      message: '成功',
      data: {
        start_date: startDayJSDate.format('YYYY-MM-DD'),
        end_date: endDayJSDate.format('YYYY-MM-DD'),
        reserved_dates: reservedStrDates
      }
    })
  } catch (error) {
    console.error('getSchedule error:', error)
    next(error)
  }
}

module.exports = {
  getOrders,
  getReservedDates
}