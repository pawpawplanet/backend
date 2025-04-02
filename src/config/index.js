// dotenv.config() 會讀取 .env 檔案的內容，並將變數加到 process.env 中。
// 必須確保 dotenv.config() 在 任何需要使用環境變數的程式碼之前被執行。
const dotenv = require('dotenv')
const result = dotenv.config()
const web = require('./web')

if (result.error) {
    throw result.error
} else {
    console.log('dotenv.config() - process.env.PORT : ', process.env.PORT)
}

const config = {
    web
}

class ConfigManager {
  /**
   * Retrieves a configuration value based on the provided dot-separated path.
   * Throws an error if the specified configuration path is not found.
   *
   * @param {string} path - Dot-separated string representing the configuration path.
   * @returns {*} - The configuration value corresponding to the given path.
   * @throws Will throw an error if the configuration path is not found.
   */

  static get (path) {
    if (!path || typeof path !== 'string') {
      throw new Error(`incorrect path: ${path}`)
    }
    const keys = path.split('.')
    let configValue = config
    console.log('=== config : ', config)
    console.log('=== configValue : ', configValue)
    keys.forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(configValue, key)) {
        throw new Error(`config ${path} not found`)
      }
      configValue = configValue[key]
      console.log('key : ', key)
      console.log('configValue : ', configValue)
    })
    return configValue
  }
}

module.exports = ConfigManager