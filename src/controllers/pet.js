const { dataSource } = require('../db/data-source')
const validation = require('../utils/validation')

function isNotValidDate(value) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  return typeof value !== 'string' || !dateRegex.test(value)
}

function isNotValidBoolean(value) {
  return typeof value !== 'boolean'
}

function isNotSelect(value) {
  //1狗2貓3鳥
  //1小2中3大
  return value !== 1 && value !== 2 && value !== 3
}

function isNotGender(value) {
  //1男2女
  return value !== 1 && value !== 2
}

async function getPet(req, res, next) {
  try {
    const { id } = req.user
    const petRepo = dataSource.getRepository('Pet')
    const pet = await petRepo.findOne({
      select: ['id', 'name', 'birthday', 'owner_id', 'species_id', 'is_ligation', 'gender', 'size_id', 'personality_description', 'health_description', 'note', 'avatar'],
      where: { owner_id: id}
    })
    res.status(200).json({
      status: 'success',
      data: {
        pet
      }
    })
  } catch (error) {
    next(error)
  }
}

async function postPet(req, res, next) {
  try {
    const { id } = req.user 
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: 'failed',
        message: '請提供資料'
      })
    }

    const userRepo = dataSource.getRepository('User')
    const user = await userRepo.findOne({ where: { id } })
    if (!user) {
      return res.status(404).json({
        status: 'failed',
        message: '使用者不存在'
      })
    }

    const petRepo = dataSource.getRepository('Pet')
    const pet = await petRepo.findOne({ where: { owner_id: id} })
    if(pet){
      return res.status(409).json({
        status: 'failed',
        message: '資料重複'
      })
    }

    const { name, birthday, species_id, is_ligation, gender, size_id, personality_description, health_description, note, avatar } = req.body
    if (validation.isNotValidSting(name) || isNotValidDate(birthday) || isNotSelect(species_id)
      || isNotValidBoolean(is_ligation) || isNotGender(gender) || isNotSelect(size_id)
      || validation.isUndefined(personality_description) || validation.isUndefined(health_description)
      || validation.isUndefined(note) || validation.isUndefined(avatar)) {
      return res.status(400).json({
        status: 'failed',
        message: '欄位未填寫正確'
      })
    }

    const newPet = petRepo.create({
      owner_id: id,
      name,
      birthday,
      species_id,
      is_ligation,
      gender,
      size_id,
      personality_description,
      health_description,
      note,
      avatar
    })
    const savePet = await petRepo.save(newPet)
    res.status(200).json({
      status: 'success',
      data: savePet
    })
  } catch (error) {
    next(error)
  }
}

async function patchPet(req, res, next) {
  try {
    const { id } = req.user
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: 'failed',
        message: '請提供資料'
      })
    }

    const userRepo = dataSource.getRepository('User')
    const user = await userRepo.findOne({ where: { id } })
    if (!user) {
      return res.status(404).json({
        status: 'failed',
        message: '使用者不存在'
      })
    }

    const petRepo = dataSource.getRepository('Pet')
    const pet = await petRepo.findOne({ where: { owner_id: id} })
    if(!pet){
      return res.status(409).json({
        status: 'failed',
        message: '找不到對應的寵物資料'
      })
    }

    const { name, birthday, species_id, is_ligation, gender, size_id, personality_description, health_description, note, avatar } = req.body
    if (validation.isNotValidSting(name) || isNotValidDate(birthday) || isNotSelect(species_id)
      || isNotValidBoolean(is_ligation) || isNotGender(gender) || isNotSelect(size_id)
      || validation.isUndefined(personality_description) || validation.isUndefined(health_description)
      || validation.isUndefined(note) || validation.isUndefined(avatar)) {
      return res.status(400).json({
        status: 'failed',
        message: '欄位未填寫正確'
      })
    }

    const allowedFields = [
      'name', 'birthday', 'species_id', 'is_ligation', 'gender',
      'size_id', 'personality_description', 'health_description',
      'note', 'avatar'
    ]
    const updates = {}
    for (const key of allowedFields) {
      // eslint-disable-next-line no-prototype-builtins
      if (req.body.hasOwnProperty(key)) {
        updates[key] = req.body[key]
      }
    }

    petRepo.merge(pet, updates)
    const updatedPet = await petRepo.save(pet)
    res.status(200).json({
      status: 'success',
      data: updatedPet
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getPet,
  postPet,
  patchPet
}