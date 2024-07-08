import { Select } from 'antd'
import React, { Fragment } from 'react'

export default ({ currencies = [], ledgerCurrency, defaultValue, onChange }) => {
  if (currencies.length === 0) {
    return <Fragment />
  }
  if (currencies.length === 1) {
    return <div>{currencies[0].currency}</div>
  }
  return (
    <Select defaultValue={defaultValue} onChange={onChange} className="select-before">
      {
        currencies.map(
          ({ price, currency }) =>
            <Select.Option value={currency}>
              {currency}
            </Select.Option>
        )
      }
    </Select>
  )
}