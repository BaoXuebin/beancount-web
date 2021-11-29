import { message } from 'antd';
import dayjs from 'dayjs';
import _fetch from 'isomorphic-fetch';

export const getAccountCata = account => {
  const array = account.split(':')
  if (array && array.length >= 1) {
    return account.split(':')[0]
  }
  return ''
}
export const getAccountIcon = account => {
  const array = account.split(':').reverse()
  for (let i = 0; i < array.length; i++) {
    const type = array[i]
    if (new RegExp('^[a-zA-Z]').test(type)) {
      return type
    }
  }
  return ''
}
export const getAccountName = account => {
  const array = account.split(':')
  if (array && array.length >= 2) {
    return account.split(':')[array.length - 1]
  }
  return ''
}

export const AccountTypeDict = {
  'Income': '收入',
  'Expenses': '支出',
  'Liabilities': '负债',
  'Assets': '资产'
}

const checkStatus = (response) => {
  return response;
}

export const fetch = (url, { method, headers, body } = {}) => {
  // 默认 header
  const _defaultHeaders = { "Content-Type": "application/json", ledgerId: window.localStorage.getItem("ledgerId") }
  return new Promise((resolve, reject) => {
    _fetch(url, { method, headers: Object.assign({}, _defaultHeaders, headers), body: JSON.stringify(body) })
      .then(checkStatus)
      .then(res => res.json())
      .then(res => {
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
          } else if (code === 1010) {
            window.location.href = '/web/#/ledger';
          } else {
            message.error('请求失败，请刷新页面重试');
          }
          reject(res);
        }
      })
      .catch((e) => { message.error('请求失败，请刷新页面重试'); reject(e); });
  })
}

export const getCurrentMonth = () => dayjs().format('YYYY-M')