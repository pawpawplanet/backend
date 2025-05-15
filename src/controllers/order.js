const { dataSource } = require('../db/data-source')


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

module.exports = {
    PostOrderReview

}