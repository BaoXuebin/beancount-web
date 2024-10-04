import { message } from 'antd';
import dayjs from 'dayjs';
import _fetch from 'isomorphic-fetch';

export const getAccountCata = account => {
  const array = account.split(':')
  if (array && array.length >= 1) {
    return array[0]
  }
  return ''
}
export const getAccountIcon = account => {
  return account.split(':').join('_')
}
export const getAccountName = account => {
  const array = account.split(':')
  if (array && array.length >= 2) {
    return array[array.length - 1]
  }
  return ''
}

export const AccountTypeDict = {
  '': '全部',
  'Income': '收入',
  'Expenses': '支出',
  'Liabilities': '负债',
  'Assets': '资产',
  'Equity': '权益'
}

const checkStatus = (response) => {
  return response;
}

export const fetch = (url, { method, headers, body, hintError } = {}) => {
  // 默认 header
  const _defaultHeaders = { "Content-Type": "application/json", ledgerId: window.localStorage.getItem("ledgerId") }
  return new Promise((resolve, reject) => {
    _fetch(url, { method, headers: Object.assign({}, _defaultHeaders, headers), body: JSON.stringify(body) })
      .then(checkStatus)
      .then(res => res.json())
      .then(res => {
        if (hintError) {
          resolve(res);
          return
        }
        const { code } = res;
        if (code === 200) {
          resolve(res.data);
        } else if (code !== 200) {
          if (code === 400) {
            message.error('请求参数错误')
          } else if (code === 1001) {
            message.error('账目不平衡')
          } else if (code === 1003) {
            message.error("无效账户")
          } else if (code === 1005) {
            message.error("无效命令")
          } else if (code === 1006) {
            message.error("密码错误")
          } else if (code === 1007) {
            message.error("账户已存在")
          } else if (code === 1008) {
            message.error("密钥不匹配")
          } else if (code === 1010) {
            redirectLedgerPage()
          } else if (code === 401) {
            redirectLedgerPage()
          } else {
            message.error('请求失败，请刷新页面重试');
          }
          reject(res);
        }
      })
      .catch((e) => { message.error('请求失败，请刷新页面重试'); reject(e); });
  })
}

export const redirectLedgerPage = () => {
  window.localStorage.removeItem('ledgerId')
  window.location.href = '/web/#/ledger';
}

export const redirectHomePage = () => {
  window.location.href = '/web/#/';
}

export const getCurrentMonth = () => dayjs().format('YYYY-M')
export const getLastMonth = () => dayjs().subtract(1, 'month').format('YYYY-M')


export const getDaysInMonth = (year, month) => {
  const daysOfMonth = [];
  month = parseInt(month, 10);
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  const monthStr = month < 10 ? ('0' + month) : month
  for (let i = 1; i <= lastDayOfMonth; i++) {
    if (i < 10) {
      daysOfMonth.push(year + "-" + monthStr + "-" + "0" + i);
    } else {
      daysOfMonth.push(year + "-" + monthStr + "-" + i);
    }
  }
  return daysOfMonth;
}

export const defaultIfEmpty = (value, defaultValue) => {
  return value && value.length > 0 ? value : defaultValue;
}

export const addAllSelector = (value) => {
  if (value && value.length > 0) {
    return [{ value: '', label: AccountTypeDict[''] }, ...value]
  }
  return value
}

export const formatCurrency = (amount, commodity, account, showPositive) => {
  if (account) {
    if (account.startsWith('Income') || account.startsWith('Expenses')) {
      amount = amount * -1
      showPositive = showPositive === undefined && true
    } else if (account.startsWith('Liabilities')) {
      amount = amount * -1
    }
  }
  const value = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  let symbol = commodity
  if (commodity && commodity.symbol) {
    symbol = commodity.symbol
  }
  return ((showPositive && Number(amount) >= 0) ? '+' : '') + (symbol ? value.replace('$', symbol) : value)
}

export const formatPercent = (number, minFractionDigits = 0, maxFractionDigits = 2) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',               // 设置格式为百分比
    minimumFractionDigits: minFractionDigits,  // 最少保留的小数位
    maximumFractionDigits: maxFractionDigits   // 最多保留的小数位
  }).format(number);
}

export const formatDate = (date) => {
  if (!date) {
    return date
  }
  const parts = date.split('-'); // 按照 "-" 分割输入字符串
  // 如果只有年份
  if (parts.length === 1) {
    return `${parts[0]}年`;  // 直接返回年份 + "年"
  }

  // 如果是年份和月份
  if (parts.length === 2) {
    const year = parts[0];
    const month = parts[1].length === 1 ? `0${parts[1]}` : parts[1]; // 保证月份有两位数字
    return `${year}年${parseInt(month)}月`; // 使用parseInt去除月份的前导零
  }
  return dayjs(date).format('YYYY年MM月DD日')
}