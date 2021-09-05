import { getAccountCata } from "../config/Util"

const AccountAmount = (account, amount, commoditySymbol = '', commodity = '') => {
  amount = Number(amount).toFixed(2)
  const cata = getAccountCata(account)
  if (cata === 'Income') {
    return amount > 0 ? `-${commoditySymbol}${Math.abs(amount)} ${commoditySymbol ? '' : commodity}` : `+${commoditySymbol}${Math.abs(amount)} ${commoditySymbol ? '' : commodity}`
  } else if (cata === 'Assets') {
    return amount > 0 ? `${commoditySymbol}${Math.abs(amount)} ${commoditySymbol ? '' : commodity}` : `-${commoditySymbol}${Math.abs(amount)} ${commoditySymbol ? '' : commodity}`
  } else if (cata === 'Expenses') {
    return amount > 0 ? `-${commoditySymbol}${Math.abs(amount)} ${commoditySymbol ? '' : commodity}` : `+${commoditySymbol}${Math.abs(amount)} ${commoditySymbol ? '' : commodity}`
  } else if (cata === 'Liabilities') {
    return amount > 0 ? `+${commoditySymbol}${Math.abs(amount)} ${commoditySymbol ? '' : commodity}` : `-${commoditySymbol}${Math.abs(amount)} ${commoditySymbol ? '' : commodity}`
  }
  return String(amount)
}

export default AccountAmount