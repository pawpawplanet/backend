const http = require('http')
const app = require('../app') // 導入 app.js
const config = require('../config/index')
const { dataSource } = require('../db/data-source')
// 監聽 port
const port = config.get('web.port')

app.set('port', port)

const server = http.createServer(app)

function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }
  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`
  // handle specific listen errors
  switch (error.code) {
  case 'EACCES':
    console.log(`${bind} requires elevated privileges`)
    process.exit(1)
    break
  case 'EADDRINUSE':
    console.log(`${bind} is already in use`)
    process.exit(1)
    break
  default:
    console.log(`exception on ${bind}: ${error.code}`)
    process.exit(1)
  }
}
server.on('error', onError)
server.listen(port, async () => {
  try {
    await dataSource.initialize()
    console.log(`伺服器運作中. port: ${port}`)
  } catch (error) {
    console.log(`伺服器運作失敗: ${error.message}`)
    process.exit(1)
  }
})