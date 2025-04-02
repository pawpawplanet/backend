const express = require('express');
const cors = require('cors')
const app = express();

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// 路由：處理 /api 的 GET 請求
app.get('/api', (req, res) => {
    res.json({
        message: "Hello World from Express!",
        status: "success"
    });
});

// 404： 處理未匹配的路由
app.use((req, res) => {
    res.status(404).json({
        error: "Not Found"
    });
});

module.exports = app