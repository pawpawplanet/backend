const { dataSource } = require('../db/data-source')
const validation = require('../utils/validation')
const orderHelper = require('../lib/order-helpers')

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
        where: { id: orderId  },
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
  
      const review = reviewRepo.create({
        order: { id: orderId },
        rating,
        comment,
        user: { id: reviewerId },           // reviewer 是 user
        freelancer: { id: revieweeId },     // 被評論者
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

module.exports = {
  PostOrderReview,
  patchOrderStatus
}