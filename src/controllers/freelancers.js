// const { P } = require('pino') // fix eslint warnings
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('FreelancersController')
const orderHelper = require('../lib/order-helpers')
const order = require('./order')
const dayjs = require('dayjs')

function generateCalendar({ working_days, is_weekly_mode }) {
  const today = dayjs()
  const schedule = []

  for (let i = 0; i < 7; i++) {
    const date = today.add(i, 'day')
    const weekday = date.day()
    const status = is_weekly_mode
      ? working_days.includes(weekday) ? '可接案' : '休假'
      : '休假'

    schedule.push({
      date: date.format('YYYY-MM-DD'),
      weekday,
      status,
    })
  }

  return {
    today: today.format('YYYY-MM-DD'),
    start_date: today.add(1, 'day').format('YYYY-MM-DD'),
    end_date: today.add(7, 'day').format('YYYY-MM-DD'),
    schedule
  }
}

//取得保姆個人資料
async function getFreelancerProfile(req, res, next) {
  try {
    const { id } = req.user

    if (!req.user) {
      return res.status(401).json({
        status: 'failed',
        message: '認證失敗，請確認登入狀態'
      })
    }
    
    const freelancerRepo = dataSource.getRepository('Freelancer')
    const serviceRepo = dataSource.getRepository('Service')

    const profile = await freelancerRepo.findOne({
      where: { user_id: id },
      relations: ['user']
    })

    console.log('profile',profile)
    if (!profile) {
      return res.status(200).json({
        status: 'success',
        data: null
      })
    }
    const { user, ...freelancer } = profile

    const calendar = generateCalendar({
      working_days: profile.working_days,
      is_weekly_mode: profile.is_weekly_mode
    })

    console.log('calendar',calendar)


    const services = await serviceRepo.find({
      where: { freelancer_id: profile.id }
    })

    console.log('services',services)


    res.status(200).json({
      status: 'success',
      message: '操作成功',
      data: {
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        phone: user.phone,
        description: user.description,
        city: user.city,
        area: user.area,
        ...freelancer,
        calendar,
        services: services.map(s => ({
          servic_type_id: s.service_type_id,
          title: s.title,
          description: s.description,
          price: s.price,
          price_unit: s.price_unit,
          enabled: s.enabled
        }))
      }
    })
  } catch(error) {
    logger.error('取得保姆資料錯誤:', error)
    next(error)
  }
}

//新增保姆個人資料
async function postFreelancerProfile(req, res, next) {
  try {
    const { id } = req.user
    const { 
      name, city, area, phone, description, avatar, //user 欄位
      working_days, is_weekly_mode, bank_account //freelancer 欄位
    } = req.body

    const userRepo = dataSource.getRepository('User')
    const freelancerRepo = dataSource.getRepository('Freelancer')

    const existingUser = await userRepo.findOne({ where: { id } })
    // const existingFreelancer = await freelancerRepo.findOne({ where: { user_id: id } }) // fix eslint warnings

    if (!req.user) {
      return res.status(401).json({
        status: 'failed',
        message: '認證失敗，請確認登入狀態'
      })
    }
    
    existingUser.name = name
    existingUser.city = city
    existingUser.area = area
    existingUser.phone = phone
    existingUser.description = description
    existingUser.avatar = avatar

    await userRepo.save(existingUser)
    console.log('existingUser', existingUser)

    // 建立 freelancer 資料
    const newFreelancer = freelancerRepo.create({
      user: existingUser,
      working_days,
      is_weekly_mode,
      bank_account
    })

    const savedFreelancer = await freelancerRepo.save(newFreelancer)

    return res.status(201).json({
      status: 'success',
      data: savedFreelancer
    })
  } catch(error) {
    logger.error('新增飼主資料錯誤', error)
    next(error)
  }
}

//編輯保姆個人資料
async function updateFreelancerProfile(req, res, next) {
  try {
    const { id } = req.user
    const {
      name, city, area, phone, description, avatar, 
      working_days, is_weekly_mode, bank_account 
    } = req.body

    const userRepo = dataSource.getRepository('User')
    const freelancerRepo = dataSource.getRepository('Freelancer')

    const user = await userRepo.findOne({ where: { id } })
    const freelancer = await freelancerRepo.findOne({ where: { user_id: id } })

    if (!user || !freelancer) {
      return res.status(404).json({ status: 'failed', message: '保姆資料不存在' })
    }

    // 更新 user 資料
    Object.assign(user, { name, city, area, phone, description, avatar })
    await userRepo.save(user)

    // 更新 freelancer 資料
    Object.assign(freelancer, { working_days, is_weekly_mode, bank_account })
    await freelancerRepo.save(freelancer)

    res.status(200).json({
      status: 'success',
      data: {
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        phone: user.phone,
        description: user.description,
        city: user.city,
        area: user.area,
        ...freelancer,
      }
    })
  } catch (error) {
    logger.error('更新保姆資料失敗:', error)
    next(error)
  }
}

async function getOrders(req, res, next) {
  await order.getOrdersByRole(orderHelper.USER_ROLES.FREELANCER, req, res, next)
}
//建立或更新保姆的某個類型服務
async function createOrUpdateService(req, res, next) {
  const { id }  = req.user
  try {
    const {
      enabled, service_type_id, title, description,
      price, price_unit, allowed_pet_types, allowed_pet_ages, allowed_pet_sizes,
      allowed_pet_genders, images, extra_options
    } = req.body

    const validTypes = [0, 1, 2, 3]
    if (!validTypes.includes(service_type_id)) {
      return res.status(400).json({ 
        status: 'failed', 
        message: 'service_type_id 數據錯誤' 
      })
    }
      
    const freelancerRepo = dataSource.getRepository('Freelancer')
    const freelancer = await freelancerRepo.findOneBy({ user_id: id })
    if (!freelancer) {
      return res.status(400).json({ status: 'failed', message: '尚未建立保母資料' })
    }

    const repo = dataSource.getRepository('Service')
    let service = await repo.findOne({
      where: {
        freelancer_id: freelancer.id,
        service_type_id
      }
    })

    if (!service) service = repo.create()

    Object.assign(service, {
      freelancer_id: freelancer.id,
      service_type_id,
      enabled,
      title, 
      description,
      price,
      price_unit, 
      allowed_pet_types, 
      allowed_pet_ages, 
      allowed_pet_sizes,
      allowed_pet_genders, 
      images, 
      extra_options
    })

    const saved = await repo.save(service)
    res.status(200).json({ 
      status: 'success', 
      message: '儲存成功', 
      data: saved 
    })
  } catch(error) {
    console.error('新增或更新服務失敗：', error)
    next(error)
  }
}

// 查詢保母的某個類型服務
async function getFreelancerServiceDetail(req, res, next) {
  try {
    const { id }  = req.user
    const service_type_id = parseInt(req.params.id, 10)
    console.log('req.params.id:', typeof service_type_id)
    console.log('req.user.id:', id)

    const repo = dataSource.getRepository('Service')

    const service = await repo
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.freelancer', 'freelancer')
      .leftJoinAndSelect('freelancer.user', 'user')
      .where('service.service_type_id = :service_type_id', { service_type_id })
      .andWhere('user.id = :userId', { userId: id })
      .getOne()

    if (!service) {
      return res.status(200).json({ 
        status: 'success', data: null 
      })
    }

    const formatted = {
      id: service.id,
      enabled: service.enabled,
      service_type_id: service.service_type_id,
      title: service.title,
      description: service.description,
      price: service.price,
      price_unit: service.price_unit,
      images: service.images,
      allowed_pet_types: service.allowed_pet_types,
      allowed_pet_sizes: service.allowed_pet_size,
      allowed_pet_ages: service.allowed_ages,
      allowed_pet_genders: service.allowed_genders,
      extra_options: service.extra_options,
    }

    res.status(200).json({
      status: 'success',
      message: '成功',
      data: formatted
    })
  } catch (error) {
    console.error('查詢保母服務 error:', error)
    next(error)
  }
}
module.exports = {
  getFreelancerProfile,
  postFreelancerProfile,
  updateFreelancerProfile,
  getOrders,
  createOrUpdateService,
  getFreelancerServiceDetail
}