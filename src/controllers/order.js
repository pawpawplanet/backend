const { dataSource } = require('../db/data-source')
const validation = require('../utils/validation')
const orderHelper = require('../lib/order-helpers')
const { Not } = require('typeorm')


async function PostOrderReview(req, res, next) {
  console.log('成功進入 PostOrderReview')

  try {
    const { id } = req.params
    const { orderId, rating, comment, reviewerId, revieweeId } = req.body

    if (!orderId || !rating || !reviewerId || !revieweeId || !comment) {
      return res.status(400).json({
        status: 'error',
        message: '缺少必要欄位 (orderId, rating, reviewerId, revieweeId)',
      })
    }

    const orderRepo = dataSource.getRepository('Order')
    const reviewRepo = dataSource.getRepository('Review')

    const order = await orderRepo.findOne({
      where: { id: orderId },
      relations: ['review'],
    })

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: '找不到該訂單',
      })
    }

    if (order.review) {
      return res.status(400).json({
        status: 'error',
        message: '該訂單已經有評論',
      })
    }

    // const review = reviewRepo.create({
    //   order: { id: orderId },
    //   rating,
    //   comment,
    //   user: { id: reviewerId },           // reviewer 是 user
    //   freelancer: { id: revieweeId },     // 被評論者
    // })

    const review = reviewRepo.create({
      order: { id: orderId },
      rating,
      comment,
      reviewer_id: { id: reviewerId },     // reviewer 是 user
      reviewee_id: { id: revieweeId },     // 被評論者
    })

    await reviewRepo.save(review)

    return res.status(201).json({
      status: 'success',
      message: '評論新增成功',
      // data: {
      //   reviewId: review.id,
      //   rating: review.rating,
      //   comment: review.comment,
      // },
    })



  } catch (error) {
    console.error('新增評論失敗:', error)
    next(error)
  }

}

async function patchOrderStatus(req, res, next) {
  try {
    const { id, role } = req.user
    const { action } = req.body
    const orderId = req.params.id

    if (validation.isUndefined(action) || validation.isNotValidSting(action)
      || validation.isUndefined(orderId) || validation.isNotValidSting(orderId)) {
      res.status(400).json({
        status: 'failed',
        message: '欄位未填寫正確'
      })
      return
    }

    let result = orderHelper.checkPermission(role, action)
    if (result.statusCode !== 200) {
      return res.status(result.statusCode).json({
        status: result.status,
        message: result.message
      })
    }

    result = null
    switch (action) {
      case 'accept':
        result = await orderHelper.acceptOrder(id, orderId)
        break
      case 'reject':
        result = await orderHelper.rejectOrder(id, orderId)
        break
      case 'cancel':
        result = await orderHelper.cancelOrder(id, orderId)
        break
      case 'close':
        result = role === orderHelper.USER_ROLES.OWNER ?
          await orderHelper.ownerCloseOrder(id, orderId) : await orderHelper.freelancerCloseOrder(id, orderId)
        break
      default:
        console.log('should not reach the default case')
    }

    if (!result) {
      throw new Error('should not happen ... patchOrderStatus() has no result...')
    }

    return res.status(result.statusCode).json({
      status: result.status,
      message: result.message,
      data: result.data
    })
  } catch (error) {
    next(error)
  }
}

async function getOrdersByRole(role, req, res, next) {
  try {
    const id = req.user.id
    const loginRole = req.user.role

    if (loginRole !== role) {
      res.status(403).json({
        status: 'failed',
        message: `未經授權：您的角色 (${loginRole}) 沒有執行此 API 的權限`
      })
      return
    }

    const tag = parseInt(req.query.tag)
    const limit = parseInt(req.query.limit)
    const page = parseInt(req.query.page)

    if (validation.isUndefined(tag) || validation.isNotValidInteger(tag)
      || validation.isUndefined(limit) || validation.isNotValidInteger(limit) || limit <= 0
      || validation.isUndefined(page) || validation.isNotValidInteger(page) || page <= 0) {
      console.log(tag, limit, page)
      res.status(400).json({
        status: 'failed',
        message: '欄位未填寫正確'
      })
      return
    }

    result = null
    switch (tag) {
      case orderHelper.ORDER_CAT_TAG.PENDING.value:
      case orderHelper.ORDER_CAT_TAG.ACCEPTED.value:
      case orderHelper.ORDER_CAT_TAG.PAID.value:
      case orderHelper.ORDER_CAT_TAG.LATEST_RESPONSE.value:
      case orderHelper.ORDER_CAT_TAG.CLOSE.value:
        result = role === orderHelper.USER_ROLES.FREELANCER ?
          await orderHelper.freelancerGetOrders(id, tag, limit, page) :
          await orderHelper.ownerGetOrders(id, tag, limit, page)
        break
      default:
        res.status(400).json({
          status: 'failed',
          message: `欄位未填寫正確：不支援的 tag(${tag})`
        })
        return
    }

    if (!result) {
      throw new Error('should not happen ... freelancerGetOrders() has no result...')
    }

    return res.status(result.statusCode).json({
      status: result.status,
      message: result.message,
      limit: result.statusCode === 200 ? result.limit : 0,
      page: result.statusCode === 200 ? result.page : 0,
      total: result.statusCode === 200 ? result.total : 0,
      data: result.data
    })
  } catch (error) {
    next(error)
  }
}

async function PostOrder(req, res, next) {
  console.log("新增訂單API")
  const {
    freelancer_id,
    service_id,
    service_date,
    note,
    pet_id,
    owner_id,
    price,
    price_unit,
    status,
    did_owner_close_the_order,
    did_freelancer_close_the_order

  } = req.body


  try {
    const orderRepository = dataSource.getRepository('Order')

    const newOrder = orderRepository.create({
      freelancer_id,
      service_id,
      pet_id,
      owner_id,
      price,
      price_unit,
      status, // 預設 pending
      did_owner_close_the_order,
      did_freelancer_close_the_order,
      service_date,
      note,

    })

    const savedOrder = await orderRepository.save(newOrder)

    res.status(201).json({
      status: "success",
      message: "成功新增訂單",
      data: {
        order_id: savedOrder.id
      }
    });

  } catch (err) {
    console.error('建立訂單失敗:', err)
    res.status(500).json({ message: '伺服器錯誤', error: err.message })
  }
}

// 飼主取得當天其他等待付款的訂單清單
async function getOrdersAcceptedOnSameDate(req, res, next) {
  try {
    const { id, role } = req.user
    const orderId = req.params.id

    if (validation.isUndefined(orderId)) {
      return res.status(400).json({
        status: 'failed',
        message: `欄位未填寫正確`
      })
    }
    
    if (role !== orderHelper.USER_ROLES.OWNER) {
      return res.status(403).json({
        status: 'failed',
        message: `未經授權：您的角色 (${role}) 沒有執行此 API 的權限`
      })
    }

    const orderRepo = dataSource.getRepository('Order')
    const order= await orderRepo.findOne({ where: { id: orderId } })
    if (validation.isNotValidObject(order) || order.status !== orderHelper.ORDER_STATUS.ACCEPTED) {
      return res.status(400).json({
        status: 'failed',
        message: `無法存取訂單：確認訂單是否存在以及訂單狀態是否為 ${orderHelper.ORDER_STATUS.ACCEPTED}`
      })
    }

    const otherOrders = await orderRepo
      .find({
        where: {
          owner_id: id,
          id: Not(order.id),
          service_date: order.service_date,
          status: orderHelper.ORDER_STATUS.ACCEPTED,
        }
      })  
     
    if (otherOrders.length === 0) {
      return res.status(200).json({
        status: 'success',
        message: '成功',
        data: []
      })
    }  

    const result = await orderHelper.ownerExpandOrders(otherOrders)
    if (validation.isNotValidObject(result)) {
      return res.status(500).json({
        status: 'error',
        message: '伺服器錯誤：fownerExpandOrders has no result...'
      })
    }

    const simplifiedData = result.data.map(({ pet, review, ...rest }) => rest)
    return res.status(result.statusCode).json({
      status: result.status,
      message: result.message,
      data: simplifiedData 
    })
  } catch (error) {
    console.error('getOrdersAcceptedOnSameDate error:', error)
    return res.status(500).json({
      status: 'error',
      message: `伺服器錯誤：${error.message}`,
      error
    })
  }
}

// 保姆取得當天其他等待接受的訂單清單
async function getOrdersRequestedOnSameDate(req, res, next) {
  try {
    const { id, role } = req.user
    const orderId = req.params.id

    if (validation.isUndefined(orderId)) {
      return res.status(400).json({
        status: 'failed',
        message: `欄位未填寫正確`
      })
    }
    
    if (role !== orderHelper.USER_ROLES.FREELANCER) {
      return res.status(403).json({
        status: 'failed',
        message: `未經授權：您的角色 (${role}) 沒有執行此 API 的權限`
      })
    }

    const freelancerRepo = dataSource.getRepository('Freelancer')
    const orderRepo = dataSource.getRepository('Order')
    const [freelancer, order] = await Promise.all([
      freelancerRepo.findOne({ where: { user_id: id} }),
      orderRepo.findOne({ where: { id: orderId } })
    ])
    
    if (validation.isNotValidObject(freelancer) || validation.isNotValidObject(order) 
      || order.status !== orderHelper.ORDER_STATUS.PENDING ) {
      return res.status(400).json({
        status: 'failed',
        message: `無法存取訂單：確認訂單是否存在以及訂單狀態是否為 (${orderHelper.ORDER_STATUS.PENDING})`
      })
    }

    const otherOrders = await orderRepo
      .find({
        where: {
          freelancer_id: freelancer.id,
          id: Not(order.id),
          service_date: order.service_date,
          status: orderHelper.ORDER_STATUS.PENDING,
        }
      })

    if (otherOrders.length === 0) {
      return res.status(200).json({
        status: 'success',
        message: '成功',
        data: []
      })
    }    
    const result = await orderHelper.freelancerExpandOrders(ordersRequestedOnSameDate)
    if (validation.isNotValidObject(result)) {
      return res.status(500).json({
        status: 'error',
        message: '伺服器錯誤：freelancerExpandOrders has no result...'
      })
    }

    return res.status(result.statusCode).json({
      status: result.status,
      message: result.message,
      data: result.data
    })
  } catch (error) {
    console.error('getOrdersAcceptedOnSameDate error:', error)
    return res.status(500).json({
      status: 'error',
      message: `伺服器錯誤：${error.message}`,
      error
    })
  }
}

module.exports = {
  PostOrderReview,
  PostOrder,

  patchOrderStatus,
  getOrdersByRole,
  getOrdersAcceptedOnSameDate,
  getOrdersRequestedOnSameDate
}