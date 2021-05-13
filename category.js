const puppeteer = require('puppeteer')
const fs = require('fs')
const {
  red,
  blue,
  orange,
  spider,
  getRandomInt,
  shuffleSort,
  log,
} = require('./utils')
const browserOption = {
  headless: false,
  // 延迟
  slowMo: 5,
}
let userAgent = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
]
const chromeOption = {
  viewport: {
    width: 1280,
    height: 800,
  },
  userAgent: userAgent[getRandomInt({ max: 1 })],
}
const waitGotoUrlOption = {
  waitUntil: 'domcontentloaded',
  timeout: 0,
}

let categoryTotalInfo = [
  {
    name: 'Home_Kitchen',
    link:
      'https://www.amazon.com/Best-Sellers-Home-Kitchen/zgbs/home-garden/ref=zg_bs_nav_0',
  },
]
async function getCategoryInfo(page) {
  try {
    const categoryInfo = await page.evaluate(() => {
      let list = []
      document
        .querySelector('#zg_browseRoot .zg_selected')
        .parentElement.nextElementSibling.querySelectorAll('li a')
        .forEach(item => {
          console.log(item, 'item')
          list.push({
            name: item?.innerText,
            link: item?.href,
          })
        })
      return list
    })
    return categoryInfo
  } catch (err) {
    red(err, 'error')
  }
}

async function run(url, type) {
  const browser = await puppeteer.launch(browserOption)
  try {
    const page = await browser.newPage()
    await spider(page)
    await page.emulate(chromeOption)
    await page.goto(url, waitGotoUrlOption)
    // 设置  纽约
    // await page.waitForSelector(
    //   '.glow-toaster-button-submit .a-button-input[type="submit"]'
    // )
    // await page.click('.glow-toaster-button-submit .a-button-input[type="submit"]')
    // await page.waitForTimeout(2000)
    if (await page.$('#GLUXZipUpdateInput')) {
      // await page.waitForSelector('#GLUXZipUpdateInput')
      // await page.type('#GLUXZipUpdateInput', '10010', { delay: 200, timeout })
      // await page.click('#GLUXZipUpdate input[type="submit"]')
      // await page.waitForTimeout(2000)
      // await page.keyboard.press('Enter')
      // await page.waitForTimeout(2000)
    }
    const info = await getCategoryInfo(page)
    categoryTotalInfo.push(...shuffleSort(info))
    for (let i = 0; i < info.length; i++) {
      const { link } = info[i]
      await page.goto(link, waitGotoUrlOption)
      const list = await getCategoryInfo(page)
      categoryTotalInfo.push(...list)
    }
    log(blue('获取数据总条数', categoryTotalInfo.length))
    fs.writeFileSync(
      `${type}.js`,
      `
    const categoryTotalInfo = ${JSON.stringify(categoryTotalInfo)}
    module.exports = {
      categoryTotalInfo
    }`
    )
  } catch (err) {
    log(red(err))
  } finally {
    await browser.close()
  }
}
const { link, name } = categoryTotalInfo[0]
run(link, name)
