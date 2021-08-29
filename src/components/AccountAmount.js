import { getAccountCata } from "../config/Util"

const AccountAmount = (account, amount, commoditySymbol = '') => {
  const cata = getAccountCata(account)
  if (cata === 'Income') {
    return amount > 0 ? `-${commoditySymbol}${Math.abs(amount)}` : `+${commoditySymbol}${Math.abs(amount)}`
  } else if (cata === 'Assets') {
    return amount > 0 ? `${commoditySymbol}${Math.abs(amount)}` : `-${commoditySymbol}${Math.abs(amount)}`
  } else if (cata === 'Expenses') {
    return amount > 0 ? `-${commoditySymbol}${Math.abs(amount)}` : `+${commoditySymbol}${Math.abs(amount)}`
  } else if (cata === 'Liabilities') {
    return amount > 0 ? `+${commoditySymbol}${Math.abs(amount)}` : `-${commoditySymbol}${Math.abs(amount)}`
  }
  return String(amount)
}

export default AccountAmount