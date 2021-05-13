const xlsx = require('node-xlsx')
// {
//   rank:
//     '商品里排第76名家居厨房用品 (查看商品销售排行榜家居厨房用品)\n商品里排第1名地毯及室内装饰品清洁机\n',
//   available: '无',
//   productTitle: 'Bissell 多功能便携式地毯和室内装饰清洁器,1400B,绿色',
//   link:
//     'https://www.amazon.com/-/zh/dp/B0016HF5GK/ref=zg_bs_home-garden_76?_encoding=UTF8&psc=1&refRID=8XWE029PATFKM8RDRAPD',
//   stars: '平均 4.6 星',
//   reviews: '21,275',
//   picture:
//     'https://images-na.ssl-images-amazon.com/images/I/71ZrlZFuOfL._AC_UL200_SR200,200_.jpg',
//   price: 'US$149.99 - US$195.29',
//   productId: 'B0016HF5GK'
// }

function writeXls(data, name) {
  let title = [
    '排名',
    '上架时间',
    '商品标题',
    '亚马逊商品链接',
    '评分',
    '评价数量',
    '商品图片',
    '商品价格',
    '商品ID',
  ]

  let list = []
  list.push(title)

  data.forEach(item => {
    let info = []
    info.push(item.rank)
    info.push(item.available)
    info.push(item.productTitle)
    info.push(item.link)
    info.push(item.stars)
    info.push(item.reviews)
    info.push(item.picture)
    info.push(item.price)
    info.push(item.productId)
    list.push(info)
  })
  const options = {
    '!cols': [{ wch: 30 }, { wch: 100 }, { wch: 20 }, { wch: 20 }],
    '!margins': {
      left: 0.7,
      right: 0.7,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3,
    },
  }

  let buffer = xlsx.build(
    [
      {
        name: 'sheet1',
        data: list,
      },
    ],
    options
  )
  fs.writeFileSync(`./${name}.xlsx`, buffer, { flag: 'w' })
}

module.exports = { writeXls }
