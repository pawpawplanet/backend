const bcrypt = require('bcrypt')
const { IsNull, In } = require('typeorm')

const { dataSource } = require('../db/data-source')
const { password } = require('../config/db')

async function postSignup(req, res, next) {
  try {
    const { email, password, role } = req.body
    const userRepository = dataSource.getRepository('User')
    const existingUser = await userRepository.findOne
    ({
      where: { email }
    })
    if (existingUser) {
      res.status(409).json({
        status: 'failed',
        message: 'Email 已被使用'
      })
      return
    }
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(password, salt)
    const newUser = userRepository.create({
      email,
      role,
      password: hashPassword
    })
    const savedUser = await userRepository.save(newUser)
    res.status(201).json({
      stauts: 'success',
      data: {
        user: {
          id: savedUser.id,
          email: savedUser.email
        }
      }
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

async function postLogin(req, res, next) {

}

module.exports = {
  postSignup,
  postLogin
}