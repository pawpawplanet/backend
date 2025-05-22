function isNotValidObject(value) {
  return !value || value === undefined
}

function isUndefined(value) {
  return value === undefined
}

function isNotValidSting(value) {
  return typeof value !== 'string' || value.trim().length === 0 || value === ''
}

function isNotValidInteger(value) {
  return typeof value !== 'number' || value < 0 || value % 1 !== 0
}

function isNotSuccessStatusCode(value) {
  return isNotValidInteger(value) || value >=400
}

function generateError(status, message, detail) {
  const error = new Error(message)
  error.status = status
  error.detail = detail
  return error
}

module.exports = {
  isNotValidObject,
  isUndefined,
  isNotValidSting,
  isNotValidInteger,
  isNotSuccessStatusCode,
  generateError
}