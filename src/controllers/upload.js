const multer = require('multer')
const firebaseAdmin = require('firebase-admin')
const { v4: uuidv4 } = require('uuid')

const config = require('../config/index')

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(config.get('secret.firebase.serviceAccount')),
  storageBucket: config.get('secret.firebase.storageBucket')
})

const MAX_FILE_SIZE = 5 * 1024 * 1024 //5MB
const ALLOWED_FILE_TYPES = {
  'image/jpeg': true,
  'image/png': true
}

const bucket = firebaseAdmin.storage().bucket()
const upload = multer({
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter(req, file, cb) {
    if (!ALLOWED_FILE_TYPES[file.mimetype]) {
      return cb(new Error('不支援的檔案類型'), false)
    }
    cb(null, true)
  }
})

//可接收任意數量的檔案
const uploadMutiMiddleware = upload.any()
//可接收多張圖片
// eslint-disable-next-line no-unused-vars
async function postMutiUploadImage(req, res, next) {
  const files = req.files
  if (!files || files.length === 0) {
    return res.status(400).json({
      status: 'failed',
      message: '沒有收到檔案'
    })
  }

  const urls = []

  try {
    for (const file of files) {
      const ext = file.originalname.split('.').pop()
      const blob = bucket.file(`images/${uuidv4()}.${ext}`)
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype
        }
      })

      await new Promise((resolve, reject) => {
        blobStream.on('finish', async () => {
          try {
            const [imgUrl] = await blob.getSignedUrl({
              action: 'read',
              expires: '12-31-2500'
            })
            urls.push(imgUrl)
            resolve()
          } catch (err) {
            reject(err)
          }
        })

        blobStream.on('error', reject)
        blobStream.end(file.buffer)
      })
    }

    res.status(200).json({
      status: 'success',
      data: {
        image_url: urls
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      status: 'failed',
      message: '有檔案上傳失敗'
    })
  }
}

//只能接收一張圖片
// eslint-disable-next-line no-unused-vars
async function postUploadImage(req, res, next) {
  const file = req.file
  if (!file) {
    return res.status(200).json({
      status: 'failed',
      message: '沒有收到檔案'
    })
  }

  try {
    const ext = file.originalname.split('.').pop()
    const blob = bucket.file(`images/${uuidv4()}.${ext}`)
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    })

    await new Promise((resolve, reject) => {
      blobStream.on('finish', async () => {
        try {
          const [imgUrl] = await blob.getSignedUrl({
            action: 'read',
            expires: '12-31-2500'
          })
          res.status(200).json({
            status: 'success',
            data: {
              image_url: imgUrl
            }
          })
          resolve()
        } catch (err) {
          reject(err)
        }
      })

      blobStream.on('error', reject)
      blobStream.end(file.buffer)
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      status: 'failed',
      message: '檔案上傳失敗'
    })
  }
}
module.exports = {
  uploadMiddleware: upload.single('file'),
  uploadMutiMiddleware,
  postUploadImage,
  postMutiUploadImage
}
