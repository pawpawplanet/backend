const { Not, In } = require('typeorm')
const { dataSource } = require('../db/data-source')
const validation = require('../utils/validation')

function checkPermission(role, action) {
  // 驗證 role 是否有效
  if (!USER_ROLES[role.toUpperCase()]) {
    return { status: 'failed', statusCode: 400, message: `無效的角色: '${role}'` }
  }

  // 驗證 action 是否為支援動作
  if (!Object.values(ORDER_ACTIONS).includes(action)) {
    return { status: 'failed', statusCode: 405, message: `不支援的動作: '${action}'` }
  }

  // 檢查角色是否有權限執行該動作
  if (!permissions[role]?.includes(action)) {
    return { status: 'failed', statusCode: 403, message: `未經授權：您的角色 (${role}) 沒有執行 '${action}' 操作的權限` }
  }

  return { status: 'success', statusCode: 200, message: '成功' }
}

async function acceptOrder(userId, orderId) {
  const queryRunner = dataSource.createQueryRunner()

  await queryRunner.connect()
  await queryRunner.startTransaction()

  try {
    const freelancer = await queryRunner.manager.getRepository('Freelancer').findOne({ where: { user_id: userId } })
    const orderRepo = queryRunner.manager.getRepository('Order')
    const order = await orderRepo.findOne({ where: { id: orderId } })

    if (validation.isUndefined(freelancer) || validation.isUndefined(order)) {
      await queryRunner.rollbackTransaction()
      return { statusCode: 400, status: 'failed', message: '無法存取訂單' }
    }
    if (order.freelancer_id !== freelancer.id) {
      await queryRunner.rollbackTransaction()
      return { statusCode: 400, status: 'failed', message: '無法存取訂單，不是您的訂單' }
    }
    if (order.status !== ORDER_STATUS.PENDING) {
      await queryRunner.rollbackTransaction()
      return { statusCode: 422, status: 'failed', message: '無法接受預約，訂單狀態已改變' }
    }

    const otherOrdersOnSameDate = await orderRepo
      .find({
        where: {
          freelancer_id: freelancer.id,
          id: Not(order.id),
          service_date: order.service_date,
          status: In([ORDER_STATUS.PENDING, ORDER_STATUS.PAID]),
        }
      })

    const pendingOrders = otherOrdersOnSameDate.filter(order => order.status === ORDER_STATUS.PENDING)
    const paidOrders = otherOrdersOnSameDate.filter(order => order.status === ORDER_STATUS.PAID)

    if (!validation.isUndefined(paidOrders) && paidOrders.length > 0) {
      await queryRunner.rollbackTransaction()
      return { statusCode: 400, status: 'failed', message: '無法接受預約，您當天已有預約' }
    }

    // 調整訂單狀態  
    order.status = ORDER_STATUS.ACCEPT
    if (!validation.isUndefined(pendingOrders) && pendingOrders.length > 0) {
      pendingOrders.forEach(order => {
        order.status = ORDER_STATUS.REJECTED
        order.did_freelancer_close_the_order = true
      })
    }

    const orders = (!validation.isUndefined(pendingOrders) && pendingOrders.length > 0) ? [order].concat(pendingOrders) : [order]
    await orderRepo.save(orders)

    await queryRunner.commitTransaction()
    return { statusCode: 200, status: 'success', message: '成功接受預約', data: { order_status: ORDER_STATUS.ACCEPT } }

  } catch (error) {
    await queryRunner.rollbackTransaction()
    console.error('acceptOrder 發生錯誤:', error)
    return {
      status: 'error',
      statusCode: 500,
      message: `接受預約時發生錯誤: ${error.message}`,
      errorDetails: error,
    }
  } finally {
    await queryRunner.release()
  }
}

async function rejectOrder(userId, orderId) {
  try {
    const freelancer = await dataSource.getRepository('Freelancer').findOne({ where: { user_id: userId } })
    const orderRepo = dataSource.getRepository('Order')
    const order = await orderRepo.findOne({ where: { id: orderId } })

    if (validation.isUndefined(freelancer) || validation.isUndefined(order)) {
      return { statusCode: 400, status: 'failed', message: '無法存取訂單' }
    }
    if (order.freelancer_id !== freelancer.id) {
      return { statusCode: 400, status: 'failed', message: '無法存取訂單，不是您的訂單' }
    }
    if (order.status !== ORDER_STATUS.PENDING) {
      return { statusCode: 422, status: 'failed', message: '無法拒絕預約，訂單狀態已改變' }
    }

    // 調整訂單狀態  
    order.status = ORDER_STATUS.REJECTED
    order.did_freelancer_close_the_order = true
    await orderRepo.save(order)
    return { statusCode: 200, status: 'success', message: '成功拒絕預約', data: { order_status: ORDER_STATUS.REJECTED } }

  } catch (error) {
    console.error('rejectOrder 發生錯誤:', error)
    return {
      status: 'error',
      statusCode: 500,
      message: `拒絕預約時發生錯誤: ${error.message}`,
      errorDetails: error
    }
  }
}

async function cancelOrder(userId, orderId) {
  try {
    const owner = await dataSource.getRepository('User').findOne({ where: { id: userId } })
    const orderRepo = dataSource.getRepository('Order')
    const order = await orderRepo.findOne({ where: { id: orderId } })

    if (validation.isUndefined(owner) || validation.isUndefined(order)) {
      return { statusCode: 400, status: 'failed', message: '無法存取訂單' }
    }
    if (!order.owner_id || order.owner_id !== owner.id) {
      return { statusCode: 400, status: 'failed', message: '無法存取訂單，不是您的訂單' }
    }
    if (order.did_owner_close_the_order) {
      return { statusCode: 422, status: 'failed', message: '無法取消預約，訂單已結案' }
    }
  
    // 調整訂單狀態  
    order.status = ORDER_STATUS.CANCELLED
    order.did_owner_close_the_order = true
    await orderRepo.save(order) 

    return { statusCode: 200, status: 'success', message: '成功取消預約', data: { order_status: ORDER_STATUS.CANCELLED } }

  } catch (error) {
    return {
      status: 'error',
      statusCode: 500,
      message: `取消預約時發生錯誤: ${error.message}`,
      errorDetails: error
    }
  }
}

async function ownerCloseOrder(userId, orderId) {
  try {
    const owner = await dataSource.getRepository('User').findOne({ where: { id: userId } })
    const orderRepo = dataSource.getRepository('Order')
    const order = await orderRepo.findOne({ where: { id: orderId } })

    if (validation.isUndefined(owner) || validation.isUndefined(order)) {
      return { statusCode: 400, status: 'failed', message: '無法存取訂單' }
    }
    if (order.owner_id !== owner.id) {
      return { statusCode: 400, status: 'failed', message: '無法存取訂單，不是您的訂單' }
    }
    if (order.status !== ORDER_STATUS.REJECTED) {
      return { statusCode: 422, status: 'failed', message: `無法結案，訂單狀態為(${order.status})` }
    }

    // 調整訂單狀態  
    order.did_owner_close_the_order = true

    await orderRepo.save(order)
    return { statusCode: 200, status: 'success', message: '成功結案', data: { order_status: order.status } }

  } catch (error) {
    return {
      status: 'error',
      statusCode: 500,
      message: `結案時發生錯誤: ${error.message}`,
      errorDetails: error
    }
  }
}

async function freelancerCloseOrder(userId, orderId) {
  try {
    const freelancer = await dataSource.getRepository('Freelancer').findOne({ where: { user_id: userId } })
    const orderRepo = dataSource.getRepository('Order')
    const order = await orderRepo.findOne({ where: { id: orderId } })

    if (validation.isUndefined(freelancer) || validation.isUndefined(order)) {
      return { statusCode: 400, status: 'failed', message: '無法存取訂單' }
    }
    if (order.freelancer_id !== freelancer.id) {
      return { statusCode: 400, status: 'failed', message: '無法存取訂單，不是您的訂單' }
    }
    if (order.status !== ORDER_STATUS.CANCELLED && order.status !== ORDER_STATUS.EXPIRED) {
      return { statusCode: 422, status: 'failed', message: `無法結案，訂單狀態為(${order.status})` }
    }

    // 調整訂單狀態  
    order.did_freelancer_close_the_order = true

    await orderRepo.save(order)
    return { statusCode: 200, status: 'success', message: '成功結案', data: { order_status: order.status } }

  } catch (error) {
    return {
      status: 'error',
      statusCode: 500,
      message: `結案時發生錯誤: ${error.message}`,
      errorDetails: error
    }
  }
}

const USER_ROLES = {
  OWNER: 'owner',
  FREELANCER: 'freelancer',
}

const ORDER_ACTIONS = {
  ACCEPT: 'accept',
  REJECT: 'reject',
  CANCEL: 'cancel',
  CLOSE: 'close',
  /*'request' */
  /*'pay'*/
}

const permissions = {
  [USER_ROLES.OWNER]: [ORDER_ACTIONS.CANCEL, ORDER_ACTIONS.CLOSE],
  [USER_ROLES.FREELANCER]: [ORDER_ACTIONS.ACCEPT, ORDER_ACTIONS.REJECT, ORDER_ACTIONS.CLOSE],
}

const ORDER_STATUS = { // 0 pending, 1 accepted, 2 paid, 3 rejected, 4 cancelled, 5 expired 6 completed
  PENDING: 0,    // 飼主請求預約
  ACCEPT: 1,     // 保姆接受預約
  PAID: 2,       // 飼主付款
  REJECTED: 3,   // 保姆拒絕預約
  CANCELLED: 4,  // 飼主取消預約
  EXPIRED: 5,    // 飼主逾期未付款
  COMPLETED: 6  // 訂單完成
}

module.exports = {
  checkPermission,

  acceptOrder,
  rejectOrder,
  cancelOrder,
  ownerCloseOrder,
  freelancerCloseOrder,
  
  USER_ROLES
}