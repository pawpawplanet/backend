const router = require('express').Router()
const testMiddleware = require('../middlewares/testMiddleware')

/*
 路由：處理 /api/test/helloworld?receiver=... 的請求
 以 middleware 判斷參數是否正確填寫，正確填寫( hasReceiver()正常 return )才會回傳 'Hello World to ${receiver}'
*/
router.get('/helloworld', testMiddleware.hasReceiver, async (req, res, next) => { 
    const { receiver } = req.query
    res.json({
        message: `Hello World to ${receiver}!`,
        status: "success"
    });
}) 

module.exports = router