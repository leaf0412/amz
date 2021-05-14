const puppeteer = require('puppeteer');
const fs = require('fs');
const _async = require('async');
const {
  red,
  blue,
  orange,
  spider,
  getRandomInt,
  shuffleSort,
  log
} = require('./utils');
const { categoryTotalInfo } = require('./Home_Kitchen');
const Goods = require('./dbs/model/goods');
const browserOption = {
  headless: true,
  // 延迟
  slowMo: 5,
  args: [
    '-disable-gpu', // GPU硬件加速
    '-disable-dev-shm-usage', // 创建临时文件共享内存
    '-disable-setuid-sandbox', // uid沙盒
    '-no-first-run', // 没有设置首页。在启动的时候，就会打开一个空白页面。
    '-no-sandbox', // 沙盒模式
    '-disable-accelerated-2d-canvas', // canvas渲染
    '-no-zygote',
    '-single-process' // 单进程运行
  ]
};
let userAgent = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36'
];
const chromeOption = {
  viewport: {
    width: 1280,
    height: 800
  },
  userAgent: userAgent[getRandomInt({ max: 1 })]
};
const waitGotoUrlOption = {
  waitUntil: 'domcontentloaded',
  timeout: 0
};

const blockedResourceTypes = [
  'image',
  'media',
  'font',
  'texttrack',
  'object',
  'beacon',
  'csp_report',
  'imageset'
];

const skippedResources = [
  'quantserve',
  'adzerk',
  'doubleclick',
  'adition',
  'exelator',
  'sharethrough',
  'cdn.api.twitter',
  'google-analytics',
  'googletagmanager',
  'google',
  'fontawesome',
  'facebook',
  'analytics',
  'optimizely',
  'clicktale',
  'mixpanel',
  'zedo',
  'clicksor',
  'tiqcdn'
];

async function getProductsInfo(page, productDetailInfo) {
  try {
    const productInfo = await page.evaluate(() => {
      let list = [];
      document.querySelectorAll('.zg-item-immersion').forEach((item) => {
        if (item.querySelector('.a-link-normal')) {
          const productUrl = item.querySelector('.a-link-normal')?.href;
          list.push({
            link: productUrl,
            stars: item.querySelector(
              '.a-icon-row.a-spacing-none .a-link-normal span.a-icon-alt'
            )?.innerText,
            reviews: item.querySelector(
              '.a-icon-row.a-spacing-none .a-size-small.a-link-normal'
            )?.innerText,
            picture: item.querySelector('.a-section.a-spacing-small img')?.src,
            price:
              item.querySelector('.a-size-base.a-color-price')?.innerText || 0
          });
        }
      });
      return list;
    });
    productDetailInfo.push(...productInfo);
  } catch (err) {
    log(red(err, 'error'));
  }
}

async function gotoNextPage(page, productDetailInfo) {
  try {
    while (await page.$('.a-pagination .a-last a')) {
      const nextPage = await page.$eval(
        '.a-pagination .a-last a',
        (item) => item.href
      );
      await page.goto(nextPage, waitGotoUrlOption);
      // await page.waitForTimeout(getRandomInt({ min: 1000, max: 1500 }))
      await getProductsInfo(page, productDetailInfo);
    }
  } catch (err) {
    log(red(err, 'error'));
  }
}

async function run(url, type, productDetailInfo, callback) {
  const browser = await puppeteer.launch(browserOption);
  try {
    const page = await browser.newPage();
    await spider(page);
    await page.setDefaultNavigationTimeout(0);
    await page.emulate(chromeOption);
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (
        [...blockedResourceTypes, ...skippedResources].includes(
          req.resourceType()
        )
      ) {
        return req.abort();
      }
      return req.continue();
    });
    await page.goto(url, waitGotoUrlOption);
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
    await getProductsInfo(page, productDetailInfo);
    await gotoNextPage(page, productDetailInfo);
    log(blue(`${type} 获取数据总条数`, productDetailInfo.length));
    if (productDetailInfo.length === 0) {
      callback(null, `${type} 获取数据结束`);
      return browser.close();
    }
    await saveProductInfo(page, type, shuffleSort(productDetailInfo));
    callback(null, `${type} 获取数据结束`);
  } catch (err) {
    callback(err);
    if (!err.toString().includes('ERR_CONNECTION_TIMED_OUT')) {
      log(red(err));
    }
    await browser.close();
  }
}

// 截取商品 id
// /\/dp\/(.*?)\//i.exec(location.pathname)

async function saveProductInfo(page, type, productDetailInfo) {
  const productLength = productDetailInfo.length;
  for (let i = 0; i < productLength; i++) {
    log(
      blue(
        `${type} 正在抓取第${i + 1}条商品数据... 进度 ${
          ((i + 1) / productLength) * 100
        }%`
      )
    );
    try {
      const productUrl = productDetailInfo[i].link;
      const productId = /\/dp\/(.*?)\//i.exec(productUrl)[1];
      const time = new Date().format('yyyy-MM-dd').toString();
      const good = await Goods.findOne({ time, productId });
      if (good) continue;
      await page.goto(productUrl, waitGotoUrlOption);
      const productInfo = await page.evaluate(async () => {
        const sleep = (time = 1000) => {
          return new Promise((resolve) => {
            setTimeout(() => resolve(), time);
          });
        };
        for (var y = 0; y <= 2; y++) {
          window.scrollTo(0, 1280 * y);
          await sleep(500);
        }
        var getKeys = {
          rank: '亚马逊热销商品排名',
          available: 'Amazon.cn上架时间'
        };
        // var getKeys = {
        //   rank: 'Best Sellers Rank',
        //   available: 'Date First Available',
        // }
        let information = {
          productTitle: document.querySelector('#productTitle')?.innerText
        };
        const productDetailTable = document.querySelectorAll(
          '.prodDetSectionEntry'
        );
        const productDetailList = document.querySelectorAll(
          '.detail-bullet-list .a-list-item .a-text-bold'
        );
        const productDetail =
          productDetailTable.length > 0
            ? productDetailTable
            : productDetailList;
        productDetail.forEach((item) => {
          for (let i in getKeys) {
            if (item.innerText.includes(getKeys[i])) {
              information[i] = item.nextElementSibling.innerText;
            }
          }
        });
        return information;
      });
      const goods = new Goods(
        Object.assign(
          {},
          { rank: '无', available: '无' },
          productInfo,
          productDetailInfo[i],

          { time, productId }
        )
      );
      const result = await goods.save();
      if (!result) continue;
      // await page.waitForTimeout(getRandomInt({ min: 500, max: 1000 }))
    } catch (err) {
      log(red(err));
      continue;
    }
  }
}

const start = async () => {
  log(orange(`start spider`));
  _async.mapLimit(
    shuffleSort(categoryTotalInfo),
    2,
    (item, callback) => {
      run(item.link, item.name, [], callback);
    },
    (err, res) => {
      if (err) {
        console.log('err======>', err);
      }
      console.log('==========>  ', res);
      process.exit()
    }
  );
};

start();
