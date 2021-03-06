const mongoose = require('mongoose')
const config = require('../config/env')

mongoose.set('useCreateIndex', true)
// 创建连接
mongoose.connect(
  config.databases,
  { useNewUrlParser: true, useUnifiedTopology: true },
  err => {
    if (err) return console.log('连接失败:' + err)
    console.log('连接成功')
  }
)

module.exports = mongoose
