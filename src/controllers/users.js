const bcrypt = require('bcrypt') // 用來加密/驗證密碼
const { IsNull, In } = require('typeorm')

const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('UsersController')
const generateJWT = require('../utils/generateJWT')

const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/

function isUndefined(value) {
  return value === undefined
}

function isNotValidSting(value) {
  return typeof value !== 'string' || value.trim().length === 0 || value === ''
}

async function postSignup(req, res, next) {
  try {
    const { email, password, confirmPassword, role } = req.body

    if (
      isUndefined(email) || isNotValidSting(email) ||
      isUndefined(password) || isNotValidSting(password) ||
      isUndefined(confirmPassword) || isNotValidSting(confirmPassword) ||
      isUndefined(role) || isNotValidSting(role)
    ) {
      logger.warn('欄位未填寫正確')
      return res.status(400).json({
        status: 'failed',
        message: '欄位未填寫正確'
      })
    }
    if (!passwordPattern.test(password)) {
      logger.warn('密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字')
      return res.status(400).json({
        status: 'failed',
        message: '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'
      })
    }

    if (password !== confirmPassword) {
      logger.warn('密碼與確認密碼不一致')
      return res.status(400).json({
        status: 'failed',
        message: '密碼與確認密碼不一致'
      })
    }


    if (!['freelancer', 'owner'].includes(role)) {
      logger.warn('身分角色不正確，應為 OWNER 或 WORKER')
      return res.status(400).json({
        status: 'failed',
        message: '身分角色不正確'
      })
    }

    const userRepository = dataSource.getRepository('User')
    const existingUser = await userRepository.findOne({ where: { email } })

    if (existingUser) {
      logger.warn('Email 已被使用')
      return res.status(409).json({
        status: 'failed',
        message: 'Email 已被使用'
      })
    }

    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(password, salt)
    const newUser = userRepository.create({
      email,
      role,
      password: hashPassword
    })

    const savedUser = await userRepository.save(newUser)
    logger.info('新建立的使用者ID:', savedUser.id)

    return res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: savedUser.id,
          email: savedUser.email,
          role: savedUser.role
        }
      }
    })

  } catch (error) {
    logger.error('建立使用者錯誤:', error)
    next(error)
  }
}

async function postLogin(req, res, next) {
  try {
    const { email, password } = req.body
    if (isUndefined(email) || isNotValidSting(email) || isUndefined(password) || isNotValidSting(password)) {
      logger.warn('欄位未填寫正確')
      res.status(400).json({
        status: 'failed',
        message: '欄位未填寫正確'
      })
      return
    }
    if (!passwordPattern.test(password)) {
      logger.warn('密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字')
      res.status(400).json({
        status: 'failed',
        message: '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'
      })
      return
    }
    const userRepository = dataSource.getRepository('User')
    const existingUser = await userRepository.findOne({
      select: ['id' , 'password', 'role'],
      where: { email }
    })

    if (!existingUser) {
      res.status(400).json({
        status: 'failed',
        message: '使用者不存在或密碼輸入錯誤'
      })
      return
    }
    logger.info(`使用者資料: ${JSON.stringify(existingUser)}`)
    const isMatch = await bcrypt.compare(password, existingUser.password)
    if (!isMatch) {
      res.status(400).json({
        status: 'failed',
        message: '使用者不存在或密碼輸入錯誤'
      })
      return
    }
    const token = await generateJWT({
      id: existingUser.id,
      role: existingUser.role
    }, config.get('secret.jwtSecret'), {
      expiresIn: `${config.get('secret.jwtExpiresDay')}`
    })

    res.status(201).json({
      status: 'success',
      data: {
        token,
        // user: {
        //   name: existingUser.name
        // }
      }
    })
  } catch (error) {
    logger.error('登入錯誤:', error)
    next(error)
  }
}

async function getProfile(req, res, next) {
  try {
    const { id } = req.user
    const userRepository = dataSource.getRepository('User')
    const user = await userRepository.findOne({
      select: ['name', 'email', 'city', 'area', 'phone', 'description', 'avatar', 'role'],
      where: { id }
    })
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    })
  } catch (error) {
    logger.error('取得使用者資料錯誤:', error)
    next(error)
  }
}

async function postOwnerProfile(req, res, next) {
  try {
    const { id } = req.user // token
    if (!req.body) {
      return res.status(400).json({
        status: 'failed',
        message: '請提供資料'
      });
    }
    const { name, city, area, phone, description, avatar } = req.body

    const profileRepository = dataSource.getRepository('User')
    const existingProfile = await profileRepository.findOne({
      where: { id }
    })

    if (!req.user) {
      return res.status(401).json({
        status: 'failed',
        message: '認證失敗，請確認登入狀態'
      });
    }

    if(existingProfile) {
      return res.status(400).json({
        status: 'failed',
        message: '使用者已經有個人資料，請使用更新功能'
      })
    }

    const newProfile = profileRepository.create({
      id,
      name, 
      city, 
      area,
      phone,
      description,
      avatar
    })

    if (existingProfile.name || existingProfile.city || existingProfile.area || existingProfile.phone || existingProfile.description || existingProfile.avatar) {
      return res.status(400).json({
        status: 'failed',
        message: '使用者已經有個人資料，請使用更新功能'
      })
    }
     
    // existingProfile.name = name
    // existingProfile.city = city
    // existingProfile.area = area
    // existingProfile.phone = phone
    // existingProfile.description = description
    // existingProfile.avatar = avatar

    const savedProfile = await profileRepository.save(newProfile)

    res.status(201).json({
      status: 'success',
      data: { savedProfile }
    })
  } catch (error) {
    logger.error('取得使用者資料錯誤:', error)
    next(error)
  }
}

async function patchOwnerProfile(req, res, next) {
  try {
    const { id } = req.user
    const { name, city, area, phone, description, avatar } = req.body

    const userRepository = dataSource.getRepository('User')
    const result = await userRepository.findOne({ where: { id } })

    if (!result) {
      return res.status(404).json({
        status: 'failed',
        message: '使用者不存在'
      })
    }

    if (isUndefined(name) || isNotValidSting(name)) {
      logger.warn('欄位未填寫正確')
      res.status(400).json({
        status: 'failed',
        message: '欄位未填寫正確'
      })
      return
    }


    if (result.name === name &&
      result.city === city &&
      result.area === area &&
      result.phone === phone &&
      result.description === description &&
      result.avatar === avatar
    ) {
      return res.status(400).json({
        status: 'failed',
        message: '沒有任何欄位被變更'
      })
    }

    if (name !== undefined) result.name = name;
    if (city !== undefined) result.city = city;
    if (area !== undefined) result.area = area;
    if (phone !== undefined) result.phone = phone;
    if (description !== undefined) result.description = description;
    if (avatar !== undefined) result.avatar = avatar;

    const updatedUser = await userRepository.save(result)

    // if (updatedResult.affected === 0) {
    //   res.status(400).json({
    //     status: 'failed',
    //     message: '更新使用者資料失敗'
    //   })
    //   return
    // }
    
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser 
      }
    })
  } catch (error) {
    logger.error('取得使用者資料錯誤:', error)
    next(error)
  }
}

async function putPassword(req, res, next) {
  try {
    const { id } = req.user
    const { password, new_password: newPassword, confirm_new_password: confirmNewPassword } = req.body
    if (isUndefined(password) || isNotValidSting(password) ||
      isUndefined(newPassword) || isNotValidSting(newPassword) ||
      isUndefined(confirmNewPassword) || isNotValidSting(confirmNewPassword)) {
      logger.warn('欄位未填寫正確')
      res.status(400).json({
        status: 'failed',
        message: '欄位未填寫正確'
      })
      return
    }
    if (!passwordPattern.test(password) || !passwordPattern.test(newPassword) || !passwordPattern.test(confirmNewPassword)) {
      logger.warn('密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字')
      res.status(400).json({
        status: 'failed',
        message: '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'
      })
      return
    }
    if (newPassword === password) {
      logger.warn('新密碼不能與舊密碼相同')
      res.status(400).json({
        status: 'failed',
        message: '新密碼不能與舊密碼相同'
      })
      return
    }
    if (newPassword !== confirmNewPassword) {
      logger.warn('新密碼與驗證新密碼不一致')
      res.status(400).json({
        status: 'failed',
        message: '新密碼與驗證新密碼不一致'
      })
      return
    }
    const userRepository = dataSource.getRepository('User')
    const existingUser = await userRepository.findOne({
      select: ['password'],
      where: { id }
    })
    const isMatch = await bcrypt.compare(password, existingUser.password)
    if (!isMatch) {
      res.status(400).json({
        status: 'failed',
        message: '密碼輸入錯誤'
      })
      return
    }
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(newPassword, salt)
    const updatedResult = await userRepository.update({
      id
    }, {
      password: hashPassword
    })
    if (updatedResult.affected === 0) {
      res.status(400).json({
        status: 'failed',
        message: '更新密碼失敗'
      })
      return
    }
    res.status(200).json({
      status: 'success',
      data: null
    })
  } catch (error) {
    logger.error('更新密碼錯誤:', error)
    next(error)
  }
}




module.exports = {
  postSignup,
  postLogin,
  getProfile,
  postOwnerProfile,
  patchOwnerProfile,
  //putPassword,

  // getServiceReviews

  // PostOrderReviews
  

  // getService

  // PostOrders

  // PostLogout


};