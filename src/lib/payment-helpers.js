require('dotenv').config();
const ECPayPayment = require('ecpay_aio_nodejs')
const config = require('../config/index')
const { ORDER_STATUS } = require('../lib/order-helpers')

const options = {
  "OperationMode": "Test", //Test or Production
  "MercProfile": {
    "MerchantID": config.get('ecpay.merchantID'),
    "HashKey": config.get('ecpay.hashKey'),
    "HashIV": config.get('ecpay.hashIV')
  },
  "ChoosePayment": "ALL",
  "IgnorePayment": [
    "ATM",
    "CVS",
    "BARCODE",
    "AndroidPay",
    "TWQR",
    "ApplePay",
    "BNPL",
    "WeiXin"
  ],
  "IsProjectContractor": false
}

function prepareECPayData(order, payment) {
  if (!order || !payment) {
    return { statusCode: 500, status: 'failed', message: '伺服器錯誤：沒有訂單、帳單資訊' }
  }

  const BACKEND_HOST = config.get('ecpay.backendHost')
  const FRONTEND_HOST = config.get('ecpay.frontendHost')
  const no = `${order.id}_001`
  const time = getPaymentDateTimeFormatted(payment.paid_at)
  const priceStr = String(order.price || 0)
  const base_param = {
    MerchantTradeNo: no,
    MerchantTradeDate: time,
    TotalAmount: priceStr,
    TradeDesc: order.description || '測試交易描述',
    ItemName: '測試訂單',
    ReturnURL: `${BACKEND_HOST}/api/order/${order.id}/ecpay-result`,
    ClientBackURL: `${FRONTEND_HOST}/api/owners/orders?tag=${ORDER_STATUS.PAID}&limit=10&page=1index.html`, // 消費者點選此按鈕後，會將頁面導回到此設定的網址
    // OrderResultURL: `${FRONTEND_HOST}/ecpay-result`, // 有別於ReturnURL (server端的網址)，OrderResultURL為特店的client端(前端)網址。消費者付款完成後，綠界會將付款結果參數以POST方式回傳到到該網址。詳細說明請參考付款結果通知。; 若與[ClientBackURL]同時設定，將會以此參數為主
    CustomField1: payment.id
  }

  const create = new ECPayPayment(options)
  const html = create.payment_client.aio_check_out_all(base_param)

  return html
}

function validateECPayData(data, order, payment) {
  if (!order || !payment) {
    return { statusCode: 500, status: 'failed', message: '伺服器錯誤：沒有訂單、帳單資訊' }
  }

  // 將送給綠界的 prepared ECPay data 取出，產生驗證碼(e.g. payment methods 相關資訊不包含在內...)
  const { CheckMacValue: checkMacValue , ...param } = data
  
  return (checkMacValue === generateCheckValue(param))
}

function getPaymentDateTimeFormatted(paid_at) {
  const now = paid_at
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0') // Month is 0-indexed
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
}

function generateCheckValue(params) {
  //將 params 從 Object 換成 Array
  const entries = Object.entries(params);

  //第一步，將 params 按照 key 值得字母順序排列
  entries.sort((a, b) => {
    return a[0].localeCompare(b[0]);
  });

  //第二步，用 key1=value1&key2=value2... 這樣的 pattern 將所有 params 串聯成字串
  //並前後加上 HashKey & HashIV 的 value

  let result =
    `HashKey=${config.get('ecpay.hashKey')}&` +
    entries.map((x) => `${x[0]}=${x[1]}`).join('&') +
    `&HashIV=${config.get('ecpay.hashIV') }`;

  //第三步，encode URL 並轉換成小寫
  result = encodeURIComponent(result).toLowerCase();

  //第四步，因爲 URL encode 是 follow RFC 1866
  //使用 js 的encodeURIComponent() 還需要處理一下
  //follow guidence from ECPay https://www.ecpay.com.tw/CascadeFAQ/CascadeFAQ_Qa?nID=1197
  result = result
    .replace(/%2d/g, '-')
    .replace(/%5f/g, '_')
    .replace(/%2e/g, '.')
    .replace(/%21/g, '!')
    .replace(/%2a/g, '*')
    .replace(/%28/g, '(')
    .replace(/%29/g, ')')
    .replace(/%20/g, '+');

  //第五步，轉成 SHA256
  result = SHA256(result).toString();

  //最後，轉成大寫
  return result.toUpperCase();
}

module.exports = {
  prepareECPayData,
  validateECPayData
}