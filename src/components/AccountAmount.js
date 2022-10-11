import { getAccountCata } from "../config/Util"

const AccountAmount = (account, amount, currencySymbol = '', currency = '') => {
  amount = Number(amount).toFixed(2)
  const cata = getAccountCata(account)
  if (cata === 'Income') {
    return amount > 0 ? `-${currencySymbol}${Math.abs(amount)} ${currencySymbol ? '' : currency}` : `+${currencySymbol}${Math.abs(amount)} ${currencySymbol ? '' : currency}`
  } else if (cata === 'Assets') {
    return amount > 0 ? `+${currencySymbol}${Math.abs(amount)} ${currencySymbol ? '' : currency}` : `-${currencySymbol}${Math.abs(amount)} ${currencySymbol ? '' : currency}`
  } else if (cata === 'Expenses') {
    return amount > 0 ? `-${currencySymbol}${Math.abs(amount)} ${currencySymbol ? '' : currency}` : `+${currencySymbol}${Math.abs(amount)} ${currencySymbol ? '' : currency}`
  } else if (cata === 'Liabilities') {
    return amount > 0 ? `+${currencySymbol}${Math.abs(amount)} ${currencySymbol ? '' : currency}` : `-${currencySymbol}${Math.abs(amount)} ${currencySymbol ? '' : currency}`
  }
  return String(amount)
}

export default AccountAmount