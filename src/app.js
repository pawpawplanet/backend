const express = require('express');
const cors = require('cors')

const testRouter = require('./routes/testRoute')

const app = express();
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api/test', testRouter) // 處理 /api/test... 路由的請求

// 404： 處理未匹配的路由
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