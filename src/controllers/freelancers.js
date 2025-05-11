// const { P } = require('pino') // fix eslint warnings
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('FreelancersController')

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
        ...freelancer
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


module.exports = {
  getFreelancerProfile,
  postFreelancerProfile,
  updateFreelancerProfile
}