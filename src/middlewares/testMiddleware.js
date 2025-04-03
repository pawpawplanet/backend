const INVALID_QUERY_PARAM_MESSAGE = '參數未正確填寫'
const INVALID_QUERY_PARAM_STATUS_CODE = 400

function generateError (status = INVALID_QUERY_PARAM_STATUS_CODE, message = INVALID_QUERY_PARAM_MESSAGE) {
  const error = new Error(message)
  error.status = status
  return error
}

function hasReceiver(req, res, next) {
  const { receiver } = req.query

  if (receiver === undefined || receiver.trim().length === 0) {
      next(generateError())
      return
  }
  next()
}

module.exports = { 
  hasReceiver
}