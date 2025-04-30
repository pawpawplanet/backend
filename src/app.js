const express = require('express');
const cors = require('cors')

const usersRouter = require('./routes/users')
const serviceRouter = require('./routes/service')

const app = express();
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.send('hello world')
})
app.use('/api/users', usersRouter)
// 404： 處理未匹配的路由

app.use('/api/service', serviceRouter)

app.use((req, res) => {
    res.status(404).json({
        error: "找不到頁面"
    });
});



app.use((err, req, res, next) => {
    console.log('error: ', err)
    // req.log.error(err)
    res.status(500).json({
      status: 'error',
      message: '伺服器錯誤'
    })
});

module.exports = app