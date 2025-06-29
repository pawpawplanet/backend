// const bcrypt = require('bcrypt') // 用來加密/驗證密碼 fix eslint warnings
// const { IsNull, In } = require('typeorm') // fix eslint warnings
const { DateTime } = require('luxon')
// const config = require('../config/index') // fix eslint warnings
const { dataSource } = require('../db/data-source')
// const logger = require('../utils/logger')('UsersController') // fix eslint warnings


function getWeekdaysInRange(startStr, endStr) {
  const start = DateTime.fromISO(startStr)
  const end = DateTime.fromISO(endStr)
  const days = []

  let current = start
  while (current <= end) {
    days.push({
      date: current.toISODate(),
      weekday: current.weekday % 7, // 0: Sunday, 6: Saturday
    })
    current = current.plus({ days: 1 })
  }

  return days
}

async function getService(req, res, next) {
  console.log('成功進入 getService')
  try {
    const {
      service_type_id,
      city,
      area,
      date,
      min_price,
      max_price,
      sort, // 'newest' | 'oldest' | 'rating'
      limit = 10,
      page = 1,
    } = req.query

    let dateFilter = null
    if (date === '不限') {
      // 不加條件
    } else if (date === '一個禮拜內') {
      const today = DateTime.now().toISODate()
      const weekLater = DateTime.now().plus({ days: 7 }).toISODate()
      dateFilter = { start: today, end: weekLater }
    } else if (date.includes(',')) {
      const [start, end] = date.split(',').map(d => d.trim())
      if (Date.parse(start) && Date.parse(end)) {
        dateFilter = { start, end }
      }
    } else if (Date.parse(date)) {
      dateFilter = { exact: date }
    }

    const serviceRepo = dataSource.getRepository('Service')
    const reviewRepo = dataSource.getRepository('Review')

    const query = serviceRepo
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.freelancer', 'freelancer')
      .leftJoinAndSelect('freelancer.user', 'freelancerUser')
      .where('service.enabled = true')

    if (service_type_id) {
      query.andWhere('service.service_type_id = :service_type_id', { service_type_id })
    }

    if (city) {
      query.andWhere('freelancerUser.city = :city', { city })
    }

    if (area) {
      query.andWhere('freelancerUser.area = :area', { area })
    }

    if (dateFilter?.exact) {
      const weekday = DateTime.fromISO(dateFilter.exact).weekday % 7
      //console.log("weekday:", weekday)

      query.andWhere(qb => {
        const subQuery = qb.subQuery()
          .select('1')
          .from('Order', 'order')
          .where('order.service_id = service.id')
          .andWhere('DATE(order.service_date) = :date', { date: dateFilter.exact })
          .andWhere('order.status IN (:...activeStatuses)', { activeStatuses: [1, 2] })
          .getQuery()
        return `NOT EXISTS ${subQuery}`
      })



      query.andWhere(`
        (
          freelancer.is_weekly_mode = true
          OR (:weekday = ANY(freelancer.working_days))
        )
        AND (
          freelancer.final_working_date IS NULL
          OR :date <= freelancer.final_working_date
        )
      `, {
        weekday,
        date: dateFilter.exact,
      })

      //console.log(query.getParameters())





    } else if (dateFilter?.start && dateFilter?.end) {
      const weekdaysInRange = getWeekdaysInRange(dateFilter.start, dateFilter.end);
      //const allowedWeekdays = [...new Set(weekdaysInRange.map(d => d.weekday))];
      const allowedWeekdays = [...new Set(weekdaysInRange.map(d => d.weekday.toString()))];
      const allowedDates = weekdaysInRange.map(d => d.date);
      
      console.log("allowedWeekdays:", allowedWeekdays)
      console.log("allowedDates:", allowedDates)

      query.andWhere(qb => {
      const subQuery = qb.subQuery()
        .select('1')
        .from('Order', 'order')
        .where('order.service_id = service.id')
        .andWhere('DATE(order.service_date) IN (:...allowedDates)', { allowedDates })
        .andWhere('order.status IN (:...activeStatuses)', { activeStatuses: [1, 2] })
        .getQuery();
      return `NOT EXISTS ${subQuery}`;
    });


    query.andWhere(`
      freelancer.is_weekly_mode = true
      OR freelancer.working_days && :allowedWeekdays
      AND (
        freelancer.final_working_date IS NULL OR
        freelancer.final_working_date >= :start
      )
    `, {
      allowedWeekdays,
      start: dateFilter.start,
    })

    
    console.log("query.getParameters():", query.getParameters())

    }

    if (min_price) {
      query.andWhere('service.price >= :min_price', { min_price })
    }

    if (max_price) {
      query.andWhere('service.price <= :max_price', { max_price })
    }

    // 排序邏輯整合
    let orderBy = { field: 'service.created_at', order: 'DESC' }
    if (sort === 'oldest') {
      orderBy.order = 'ASC'
    } else if (sort === 'rating') {
      orderBy.order = 'DESC' // 保持順序，稍後 JS 再排序評分
    }
    query.orderBy(orderBy.field, orderBy.order)

    const take = parseInt(limit)
    const skip = (parseInt(page) - 1) * take
    query.take(take).skip(skip)

    const [rawServices, total] = await query.getManyAndCount()

    if (total === 0) {
      return res.status(200).json({
        message: '查詢成功，但沒有符合條件的服務',
        status: 'success',
        data: {
          services: [],
          total: 0,
          page: parseInt(page),
          limit: take,
        }
      })
    }

    const serviceIds = rawServices.map(s => s.id)
    const reviews = await reviewRepo
      .createQueryBuilder('review')
      .leftJoin('review.order', 'order')
      .select('order.service_id', 'service_id')
      .addSelect('AVG(review.rating)', 'avg_rating')
      .addSelect('COUNT(*)', 'count')
      .where('order.service_id IN (:...serviceIds)', { serviceIds })
      .groupBy('order.service_id')
      .getRawMany()

    const reviewMap = {}
    reviews.forEach(r => {
      reviewMap[r.service_id] = {
        rating: parseFloat(r.avg_rating),
        review_count: parseInt(r.count),
      }
    })

    let services = rawServices.map(s => {
      const firstImage = Array.isArray(s.images) && s.images.length > 0 ? s.images[0] : null
      return {
        id: s.id,
        title: s.title,
        description: s.description,
        price: s.price,
        price_unit: s.price_unit,
        image: firstImage,
        rating: reviewMap[s.id]?.rating || 0,
        review_count: reviewMap[s.id]?.review_count || 0,
        freelancer_info: {
          id: s.freelancer.id,
          name: s.freelancer.user?.name || '',
          avatar: s.freelancer.user?.avatar || '',
          phone: s.freelancer.user?.phone || '',
          city: s.freelancer.user?.city || '',
          area: s.freelancer.user?.area || '',
          latitude: s.freelancer.latitude ?? null,
          longitude: s.freelancer.longitude ?? null,
        }
      }
    })

    // 若排序為 rating，前端額外排序一次
    if (sort === 'rating') {
      services.sort((a, b) => b.rating - a.rating)
    }

    res.status(200).json({
      message: '成功',
      status: 'success',
      data: {
        services,
        total,
        page: parseInt(page),
        limit: take,
      }
    })
  } catch (error) {
    console.error('查詢服務失敗:', error)
    res.status(500).json({
      message: '伺服器錯誤，請稍後再試',
      status: 'error'
    })
  }
}




async function getServiceReviews(req, res, next) {
  console.log('成功進入 getServiceReviews')

  try {
    const { service_id, limit = 10, page = 1 } = req.query

    if (!service_id) {
      return res.status(200).json({
        status: 'error',
        message: '缺少必要參數：service_id',
      })
    }

    const take = parseInt(limit)
    const skip = (parseInt(page) - 1) * take

    const serviceRepo = dataSource.getRepository('Service')
    const reviewRepo = dataSource.getRepository('Review')

    // 1. 取得該服務對應的 freelancer_id
    const service = await serviceRepo.findOne({
      where: { id: service_id },
      select: ['freelancer_id'],
    })

    if (!service) {
      return res.status(200).json({
        status: 'error',
        message: '找不到指定的服務',
      })
    }

    const freelancer_id = service.freelancer_id

    // 2. 查詢 Review（透過 Review -> Order 拿到 service_id）
    const [reviews, total] = await reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.order', 'order')            // 對應訂單
      .leftJoinAndSelect('review.reviewer', 'user')          // 對應撰寫者（user）
      .where('order.service_id = :service_id', { service_id })
      .andWhere('review.reviewee_id = :freelancer_id', { freelancer_id })
      .orderBy('review.created_at', 'DESC')
      .skip(skip)
      .take(take)
      .getManyAndCount()

    const formatted = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      service_date: r.order?.service_date,
      owner_name: r.reviewer?.name || null,
      owner_avatar: r.reviewer?.avatar || null,
    }))

    return res.status(200).json({
      status: 'success',
      message: '評論查詢成功',
      data: {
        reviews: formatted,
        total,
        page: parseInt(page),
        limit: take,
        //perPage: take,
        //totalPages: Math.ceil(total / take),
      },
    })

  } catch (error) {
    console.error('查詢服務失敗:', error)
    return res.status(500).json({
      status: 'error',
      message: '伺服器錯誤，請稍後再試',
    })
  }
}

// 查詢某服務的詳細資料
async function getServiceDetail(req, res, next) {
  try {
    const serviceId = req.params.id

    const serviceRepo = dataSource.getRepository('Service')
    const reviewRepo = dataSource.getRepository('Review')

    const service = await serviceRepo
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.freelancer', 'freelancer')
      .leftJoinAndSelect('freelancer.user', 'user')
      .where('service.id = :id', { id: serviceId })
      .andWhere('service.enabled = true')
      .getOne()

    console.log('service', service)
    if (!service) {
      return res.status(200).json({
        status: 'failed',
        message: '找不到該服務'
      })
    }

    const freelancer = service.freelancer
    const user = freelancer.user

    const { count, avg } = await reviewRepo
      .createQueryBuilder('review')
      .innerJoin('review.order', 'order')
      .innerJoin('order.service', 'service')
      .where('service.id = :serviceId', { serviceId })
      .select('COUNT(*)', 'count')
      .addSelect('AVG(review.rating)', 'avg')
      .getRawOne()

    res.status(200).json({
      status: 'success',
      message: '成功',
      data: {
        service,
        freelancer_profile: {
          user_id: user.id,
          name: user.name,
          avatar: user.avatar,
          description: user.description,
          address: `${user.city}${user.area}`,
          phone: user.phone,
          available_weekdays: freelancer.working_days,
          is_weekly_mode: freelancer.is_weekly_mode
        },
        review_status: {
          count: Number(count),
          avg_rating: avg ? parseFloat(avg).toFixed(1) : 0
        }
      }
    })
  } catch (error) {
    console.error('查詢保姆詳細資料錯誤:', error)
    next(error)
  }
}

module.exports = {
  getService,
  getServiceReviews,
  getServiceDetail
}
