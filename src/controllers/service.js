const bcrypt = require('bcrypt') // 用來加密/驗證密碼
const { IsNull, In } = require('typeorm')

const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('UsersController')



async function getService(req, res, next) {
    console.log('成功進入 getService');
    try {
        const {
            service_type_id, date,
            min_price, max_price,
            city,  area, sort,
            limit = 10,page = 1,
          } = req.query;

          
          const serviceRepo = dataSource.getRepository('Service')
          const reviewRepo = dataSource.getRepository('Review')

          const query = serviceRepo
          .createQueryBuilder('service')
          .leftJoinAndSelect('service.freelancer', 'freelancer')
          .leftJoinAndSelect('service.service_type', 'serviceType')
          .where('service.enabled = true');

          if (service_type_id) {
            query.andWhere('service.service_type_id = :service_type_id', { service_type_id });
          }
      
          if (min_price) {
            query.andWhere('service.price >= :min_price', { min_price });
          }
      
          if (max_price) {
            query.andWhere('service.price <= :max_price', { max_price });
          }
      
          if (city) {
            query.andWhere('freelancer.city = :city', { city });
          }
      
          if (area) {
            query.andWhere('freelancer.area = :area', { area });
          }
      
          if (date) {
            query.andWhere(qb => {
              const subQuery = qb.subQuery()
                .select('1')
                .from('Order', 'order')
                .where('order.service_id = service.id')
                .andWhere('DATE(order.service_date) = :date', { date })
                .getQuery();
              return `NOT EXISTS ${subQuery}`;
            });
          }
      
          if (sort === 'price_asc') {
            query.orderBy('service.price', 'ASC');
          } else if (sort === 'price_desc') {
            query.orderBy('service.price', 'DESC');
          } else {
            query.orderBy('service.created_at', 'DESC');
          }


          const take = parseInt(limit);
          const skip = (parseInt(page) - 1) * take;
          query.take(take).skip(skip);
      
          const [rawServices, total] = await query.getManyAndCount();
      
          const serviceIds = rawServices.map(s => s.id);
          const reviews = await reviewRepo
                .createQueryBuilder('review')
                .select('freelancer.service_id', 'service_id')  // 使用 Freelancer 的 service_id
                .addSelect('AVG(review.rating)', 'avg_rating')
                .addSelect('COUNT(*)', 'count')
                .leftJoin('review.freelancer', 'freelancer')  // 連接 Freelancer
                .where('freelancer.service_id IN (:...serviceIds)', { serviceIds })  // 使用 Freelancer 的 service_id 來查詢
                .groupBy('freelancer.service_id')  // 基於 service_id 分組
                .getRawMany();
      
          const reviewMap = {};
          reviews.forEach(r => {
            reviewMap[r.service_id] = {
              rating: parseFloat(r.avg_rating),
              review_count: parseInt(r.count),
            };
          });
      
          const services = rawServices.map(s => {
            const firstImage = s.images?.split(',')[0] || null;
            return {
              id: s.id,
              title: s.title,
              description: s.description,
              service_type_id: s.service_type_id,
              freelancer_id: s.freelancer_id,
              price: s.price,
              price_unit: s.price_unit,
              address: `${s.freelancer.city}${s.freelancer.area}`,
              image: firstImage,
              rating: reviewMap[s.id]?.rating || 0,
              review_count: reviewMap[s.id]?.review_count || 0,
              lat: s.freelancer.lat || null,
              lng: s.freelancer.lng || null,
            };
          });
      
          res.status(200).json({
            message: '成功',
            status: 'success',
            data: {
              services,
              total,
              page: parseInt(page),
              limit: take,
            }
          });
      




    } catch (error){
        console.error('查詢服務失敗:', error);
        next(error);
    }

};


module.exports = {
    getService

}