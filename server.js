require('dotenv').config()
const http = require('http')
const client = require('./db')

const requestListener = async (req, res) => {
  const headers = { 'Content-Type': 'application/json' }
  let body = ''
  req.on('data', (chunk) => {
    body += chunk
  })

  if (req.url === '/api/users' && req.method === 'GET') { // 查詢 user
    try {
      const result = await client.query('SELECT * FROM users')
      res.writeHead(200, headers)
      res.write(JSON.stringify({ status: 'success', data: result.rows }))
      res.end()
    } catch (error) {
      res.writeHead(500, headers)
      res.write(JSON.stringify({ status: 'error', message: error.message }))
      res.end()
    }
  } else if (req.url === '/api/users' && req.method === 'POST') { // 新增 user
    req.on('end', async () => {
      try {
        const { name, email } = JSON.parse(body)
        const query = 'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *'
        const values = [name, email]

        const result = await client.query(query, values)
        res.writeHead(201, headers)
        res.write(JSON.stringify({ status: 'success', data: result.rows[0] }))
        res.end()
      } catch (error) {
        res.writeHead(500, headers)
        res.write(JSON.stringify({ status: 'error', message: error.message }))
        res.end()
      }
    })

  } else if (req.url.startsWith('/api/users/') && req.method === 'DELETE') { // 刪除 user
    const id = req.url.split('/').pop()
    try {
      const query = 'DELETE FROM users WHERE id = $1 RETURNING *'
      const result = await client.query(query, [id])

      if (result.rowCount === 0) {
        res.writeHead(404, headers)
        res.write(JSON.stringify({ status: 'failed', message: '找不到該筆資料' }))
      } else {
        res.writeHead(200, headers)
        res.write(JSON.stringify({ status: 'success', message: '刪除成功' }))
      }
      res.end()
    } catch (error) {
      res.writeHead(500, headers)
      res.write(JSON.stringify({ status: 'error', message: error.message }))
      res.end()
    }

  } else if (req.method === 'OPTIONS') {
    res.writeHead(200, headers)
    res.end()
  } else {
    res.writeHead(404, headers)
    res.write(JSON.stringify({
      status: 'failed',
      message: '無此網站路由',
    }))
    res.end()
  }
}

const server = http.createServer(requestListener)

server.listen(process.env.PORT, () => {
  console.log(`伺服器啟動成功, port: ${process.env.PORT}`)
})