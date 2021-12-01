import React, { Component } from 'react'
const Page = ChildComponent => class extends Component {


  defaultCommodity = { currency: 'CNY', symbol: '￥' }
  currentCommodity = window.localStorage.getItem('ledgerCurrency')

  render() {
    return <ChildComponent {...this.props} commodity={this.currentCommodity ? JSON.parse(this.currentCommodity) : this.defaultCommodity} />
  }
}

export default Page