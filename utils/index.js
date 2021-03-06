const chalk = require('chalk')
const log = console.log
const red = chalk.red
const blue = chalk.blue
const orange = chalk.keyword('orange')

async function spider(page) {
  return await page.evaluateOnNewDocument(() => {
    ;() => {
      window.chrome = {
        app: {
          isInstalled: false,
          InstallState: {
            DISABLED: 'disabled',
            INSTALLED: 'installed',
            NOT_INSTALLED: 'not_installed',
          },
          RunningState: {
            CANNOT_RUN: 'cannot_run',
            READY_TO_RUN: 'ready_to_run',
            RUNNING: 'running',
          },
        },
        runtime: {
          OnInstalledReason: {
            CHROME_UPDATE: 'chrome_update',
            INSTALL: 'install',
            SHARED_MODULE_UPDATE: 'shared_module_update',
            UPDATE: 'update',
          },
          OnRestartRequiredReason: {
            APP_UPDATE: 'app_update',
            OS_UPDATE: 'os_update',
            PERIODIC: 'periodic',
          },
          PlatformArch: {
            ARM: 'arm',
            ARM64: 'arm64',
            MIPS: 'mips',
            MIPS64: 'mips64',
            X86_32: 'x86-32',
            X86_64: 'x86-64',
          },
          PlatformNaclArch: {
            ARM: 'arm',
            MIPS: 'mips',
            MIPS64: 'mips64',
            X86_32: 'x86-32',
            X86_64: 'x86-64',
          },
          PlatformOs: {
            ANDROID: 'android',
            CROS: 'cros',
            LINUX: 'linux',
            MAC: 'mac',
            OPENBSD: 'openbsd',
            WIN: 'win',
          },
          RequestUpdateCheckStatus: {
            NO_UPDATE: 'no_update',
            THROTTLED: 'throttled',
            UPDATE_AVAILABLE: 'update_available',
          },
        },
      }
      const newProto = navigator.__proto__
      delete newProto.webdriver
      navigator.__proto__ = newProto
    }
  })
}

function getRandomInt({ min = 0, max }) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ???????????????
Date.prototype.format = function (fmt) {
  var o = {
    'M+': this.getMonth() + 1, //??????
    'd+': this.getDate(), //???
    'h+': this.getHours(), //??????
    'm+': this.getMinutes(), //???
    's+': this.getSeconds(), //???
    'q+': Math.floor((this.getMonth() + 3) / 3), //??????
    S: this.getMilliseconds(), //??????
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (this.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }
  return fmt
}

//
function shuffleSort(arr) {
  var newArr = [...arr]
  var n = newArr.length
  while (n--) {
    var index = Math.floor(Math.random() * n)
    ;[newArr[index], newArr[n]] = [newArr[n], newArr[index]]
  }
  return newArr
}

module.exports = {
  shuffleSort,
  log,
  red,
  blue,
  orange,
  spider,
  getRandomInt,
}
