const mongoose = require('../index')
const GoodsSchema = mongoose.Schema({
  rank: { type: String },
  available: { type: String },
  productTitle: { type: String },
  link: { type: String },
  stars: { type: String },
  reviews: { type: String },
  picture: { type: String },
  price: { type: String },
  productId: { type: String, index: true },
  time: { type: String, index: true },
})

const GoodsModel = mongoose.model('goods', GoodsSchema, 'goods')
module.exports = GoodsModel
