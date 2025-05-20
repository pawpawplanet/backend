const { Not, In } = require('typeorm')
const { dataSource } = require('../db/data-source')
const validation = require('../utils/validation')

// === api/patchOrderStatus related ===
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

    if (validation.isNotValidObject(owner) || validation.isNotValidObject(order)) {
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
    console.log('ownerCloseOrder error:', error)
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
    console.log('freelancerCloseOrder error:', error)
    return {
      status: 'error',
      statusCode: 500,
      message: `結案時發生錯誤: ${error.message}`,
      errorDetails: error
    }
  }
}


// === api/{role}/orders?tag={tag}&limit={limit}&page={page} related ===
async function freelancerGetOrders(userId, tag, limit, page) {
  const freelancer = await dataSource.getRepository('Freelancer').findOne({ where: { user_id: userId } })
  if (!freelancer || validation.isUndefined(freelancer)) {
    return { statusCode: 400, status: 'failed', message: '無法取得訂單：找不到保姆資料' }
  }

  const query = {
    ...prepareOrderQueryForTagByRole(tag, USER_ROLES.FREELANCER),
    freelancerId: freelancer.id,
    limit: limit,
    page: page
  }

  let result = await getOrdersWithQuery(query)
  
  if (!result) {
    throw new Error('should not happen ... freelancerGetOrders() has no result...')
  } else if (result.statusCode !== 200) {
    return result;
  }

  const data = {
    limit: limit,
    page: page,
    total: result.data.total
  }

  result = await freelancerExpandOrders(result.data.orders)
  if (!result) {
    throw new Error('should not happen ... freelancerExpandOrders() has no result...')
  } 

  return {
    status: result.status,
    statusCode: result.statusCode,
    message: result.message,
    data: {
      ...data,
      data: result.data
    }
  }
}

async function ownerGetOrders(userId, tag, limit, page) {
  const query = {
    ...prepareOrderQueryForTagByRole(tag, USER_ROLES.OWNER),
    ownerId: userId,
    limit: limit,
    page: page
  }

  let result = await getOrdersWithQuery(query)
  if (!result) {
    throw new Error('should not happen ... ownerGetOrders() has no result...')
  } else if (result.statusCode !== 200) {
    return result;
  }

  const data = {
    limit: limit,
    page: page,
    total: result.data.total
  }

  result = await ownerExpandOrders(result.data.orders)
  if (!result) {
    throw new Error('should not happen ... ownerGetOrders() has no result...')
  }

  return {
    status: result.status,
    statusCode: result.statusCode,
    message: result.message,
    data:  {
      ...data,
      data: result.data
    }
  }
}

function prepareOrderQueryForTagByRole(tag, role) {
  const query = { status: [] }
  if (role === USER_ROLES.FREELANCER) {
    switch (tag) {
      case ORDER_CAT_TAG.PENDING.value:
        query.status.push(ORDER_STATUS.PENDING)
        break
      case ORDER_CAT_TAG.ACCEPTED.value:
        query.status.push(ORDER_STATUS.ACCEPT)
        break
      case ORDER_CAT_TAG.PAID.value:
        query.status.push(ORDER_STATUS.PAID)
        break
      case ORDER_CAT_TAG.LATEST_RESPONSE.value:
        query.status.concat([ORDER_STATUS_CANCELLED, ORDER_STATUS_EXPIRED])
        query.didFreelancerCloseTheOrder = false
      case ORDER_CAT_TAG.CLOSE.value:
        query.didFreelancerCloseTheOrder = true
        // query.status = query.status.concat([ORDER_STATUS.CANCELLED, ORDER_STATUS.EXPIRED, ORDER_STATUS.COMPLETED])
        break
      default:
        console.log('should not reach the default case')
    }
  } else if (role === USER_ROLES.OWNER) {
    switch (tag) {
      case ORDER_CAT_TAG.PENDING.value:
        query.status.push(ORDER_STATUS.PENDING)
        break
      case ORDER_CAT_TAG.ACCEPTED.value:
        query.status.push(ORDER_STATUS.ACCEPT)
        break
      case ORDER_CAT_TAG.PAID.value:
        query.status.push(ORDER_STATUS.PAID)
        break
      case ORDER_CAT_TAG.LATEST_RESPONSE.value:
        query.status.push(ORDER_STATUS.REJECTED)
        query.didOwnerCloseTheOrder = false
      case ORDER_CAT_TAG.CLOSE.value:
        query.didOwnerCloseTheOrder = true
        // query.status = query.status.concat([ORDER_STATUS.CANCELLED, ORDER_STATUS.EXPIRED, ORDER_STATUS.COMPLETED])
        break
      default:
        console.log('should not reach the default case')
    }
  }

  return query
}

async function getOrdersWithQuery(query) {
  const orderRepo = dataSource.getRepository('Order');
  const queryBuilder = orderRepo.createQueryBuilder('order');

  // 飼主或保姆 id
  if (query.freelancerId) {
    queryBuilder.andWhere('order.freelancer_id = :freelancerId', { freelancerId: query.freelancerId });
  } else if (query.ownerId) {
    queryBuilder.andWhere('order.owner_id = :ownerId', { ownerId: query.ownerId });
  } else {
    return { statusCode: 400, status: 'failed', message: '無法取得訂單：查詢條件缺少會員資料' }
  }

  // 訂單狀態
  if (query.status.length > 0) {
    queryBuilder.andWhere('order.status IN (:...status)', { status: query.status });
  }

  // 保姆是否已結案
  if (query.didFreelancerCloseTheOrder !== undefined) {
    queryBuilder.andWhere('order.did_freelancer_close_the_order = :didFreelancerCloseTheOrder', {
      didFreelancerCloseTheOrder: query.didFreelancerCloseTheOrder,
    });
  }

  // 飼主是否已結案
  if (query.didOwnerCloseTheOrder !== undefined) {
    queryBuilder.andWhere('order.did_owner_close_the_order = :didOwnerCloseTheOrder', {
      didOwnerCloseTheOrder: query.didOwnerCloseTheOrder,
    });
  }

  try {
    // 複製 queryBuilder 以進行計數查詢，避免影響原始查詢
    const countQueryBuilder = queryBuilder.clone();
    const total = await countQueryBuilder.getCount();

    queryBuilder.take(query.limit); // 設定每頁筆數
    queryBuilder.skip((query.page - 1) * query.limit); // 設定要跳過的筆數

    const orders = await queryBuilder.getMany();

    return {
      status: 'success',
      statusCode: 200,
      message: '成功',
      data: {
        limit: query.limit,
        page: query.page,
        total: total,
        orders: orders
      }
    }
  } catch (error) {
    console.error('getOrdersWithQuery() error: ', error)
    return {
      status: 'error',
      statusCode: 500,
      message: `查詢指定標籤訂單時發生錯誤: ${error.message}`,
      errorDetails: error
    }
  }
}

async function freelancerExpandOrders(orders) {
  const orderRepo = dataSource.getRepository('Order')
  const petRepo = dataSource.getRepository('Pet')
  const reviewRepo = dataSource.getRepository('Review')

  try {
    const expandedOrders = await Promise.all(orders.map(async (order) => { // orders 改為 await Promise.all
      const expandOrder = await orderRepo
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.owner', 'owner')
        .leftJoinAndSelect('order.service', 'service')
        .where('order.id = :orderId', { orderId: order.id })
        .getOne();

      const pet = await petRepo.findOne({ where: { id: order.pet_id } });
      const review = await reviewRepo.findOne({ where: { order_id: order.id } }) || {}

      if (!expandOrder || !pet) {
        throw new Error(`Order ${order} 關聯資料有誤`);
      }

      return { ...expandOrder, pet, review };
    }));

    const data = expandedOrders.map(expandedOrder => {
      return {
        owner: {
          name: expandedOrder.owner.name,
          phone: expandedOrder.owner.phone,
          city: expandedOrder.owner.city,
          area: expandedOrder.owner.area,
          description: expandedOrder.owner.description,
          avatar: expandedOrder.owner.avatar,
        },
        pet: {
          name: expandedOrder.pet.name,
          species_id: expandedOrder.pet.species_id,
          size: expandedOrder.pet.size,
          birthday: expandedOrder.pet.birthday,
          gender: expandedOrder.pet.gender,
          personality_description: expandedOrder.pet.personality_description,
          avatar: expandedOrder.pet.avatar,
        },
        service: {
          service_type_id: expandedOrder.service.service_type_id,
          price: expandedOrder.service.price,
          price_unit: expandedOrder.service.price_unit,
        },
        order: {
          id: expandedOrder.id,
          service_date: expandedOrder.service_date,
          note: expandedOrder.note,
          status: expandedOrder.status,
          did_freelancer_close_the_order: expandedOrder.did_freelancer_close_the_order,
          did_owner_close_the_order: expandedOrder.did_owner_close_the_order,
          created_at: expandedOrder.created_at,
          updated_at: expandedOrder.updated_at,
        },
        review: expandedOrder.review
      };
    })

    return { statusCode: 200, status: 'success', message: '成功', data: data }
  } catch (error) {
    console.log('freelancerExpandOrders error: ', error)
    return {
      status: 'error',
      statusCode: 500,
      message: error.message,
      error: error,
    };
  }
}

async function ownerExpandOrders(orders) {
  const orderRepo = dataSource.getRepository('Order')
  const petRepo = dataSource.getRepository('Pet')
  const reviewRepo = dataSource.getRepository('Review')
  const userRepo = dataSource.getRepository('User')

  try {
    const expandedOrders = await Promise.all(orders.map(async (order) => { // orders 改為 await Promise.all
      const expandOrder = await orderRepo
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.freelancer', 'freelancer')
        .leftJoinAndSelect('order.service', 'service')
        .where('order.id = :orderId', { orderId: order.id })
        .getOne();

      const pet = await petRepo.findOne({ where: { id: order.pet_id } });
      const review = await reviewRepo.findOne({ where: { order_id: order.id } }) || {}

      if (!expandOrder || !pet) {
        throw new Error(`Order ${order} 關聯資料有誤`);
      }

      return { ...expandOrder, pet, review };
    }));

    const data = await Promise.all(expandedOrders.map(async (expandedOrder) => {
      const user = await userRepo.findOne({
        where: { id: expandedOrder.freelancer.user_id },
      });

      return {
        freelancer: {
          name: user?.name ?? null,
          phone: user?.phone ?? null,
          city: user?.city ?? null,
          area: user?.area ?? null,
          description: user?.description ?? null,
          avatar: user?.avatar ?? null,
        },
        pet: {
          name: expandedOrder.pet.name,
          species_id: expandedOrder.pet.species_id,
          size: expandedOrder.pet.size,
          birthday: expandedOrder.pet.birthday,
          gender: expandedOrder.pet.gender,
          personality_description: expandedOrder.pet.personality_description,
          avatar: expandedOrder.pet.avatar,
        },
        service: {
          name: expandedOrder.service.name,
          service_type_id: expandedOrder.service.service_type_id,
          price: expandedOrder.service.price,
          price_unit: expandedOrder.service.price_unit,
        },
        order: {
          id: expandedOrder.id,
          service_date: expandedOrder.service_date,
          note: expandedOrder.note,
          status: expandedOrder.status,
          did_freelancer_close_the_order: expandedOrder.did_freelancer_close_the_order,
          did_owner_close_the_order: expandedOrder.did_owner_close_the_order,
          created_at: expandedOrder.created_at,
          updated_at: expandedOrder.updated_at,
        },
        review: expandedOrder.review,
      };
    }));
    

    return { statusCode: 200, status: 'success', message: '成功', data: data }
  } catch (error) {
    return {
      status: 'error',
      statusCode: 500,
      message: error.message,
      error: error,
    };
  }
}

// === constants ===
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

const ORDER_CAT_TAG = {
  PENDING: {
    value: 0,
    captions: {
      [USER_ROLES.OWNER]: '等待回覆',
      [USER_ROLES.FREELANCER]: '等待接受'
    }
  },
  ACCEPTED: {
    value: 1,
    captions: {
      [USER_ROLES.OWNER]: '預約成功付款',
      [USER_ROLES.FREELANCER]: '等待付款'
    }
  },
  PAID: {
    value: 2,
    captions: {
      [USER_ROLES.OWNER]: '即將執行',
      [USER_ROLES.FREELANCER]: '即將執行'
    }
  },
  LATEST_RESPONSE: {
    value: 3,
    captions: {
      [USER_ROLES.OWNER]: '最新回應',
      [USER_ROLES.FREELANCER]: '最新回應'
    }
  }, // 飼主 “”， 保姆 “最新回應”
  CLOSE: {
    value: 4,
    captions: {
      [USER_ROLES.OWNER]: '結案',
      [USER_ROLES.FREELANCER]: '結案'
    }
  }
}

// === exports ===
module.exports = {
  checkPermission,

  acceptOrder,
  rejectOrder,
  cancelOrder,
  ownerCloseOrder,
  freelancerCloseOrder,

  freelancerGetOrders,
  ownerGetOrders,

  freelancerExpandOrders,
  ownerExpandOrders,
  
  USER_ROLES,
  ORDER_CAT_TAG,
  ORDER_STATUS
}