import { Segmented, Spin } from 'antd';
import { Chart, Line, Point, Tooltip } from "bizcharts";
import React, { Component } from "react";
import { AccountTypeDict, defaultIfEmpty, fetch } from '../../config/Util';

const defaultAccount = [{ value: 'Assets', label: AccountTypeDict['Assets'] }]

class AccountBalanceChart extends Component {

  state = {
    loading: false,
    balanceData: [],
    accountPrefix: defaultIfEmpty(this.props.selectedAccounts, defaultAccount)[0].value
  }

  componentDidMount() {
    this.queryAccountBalance(this.props.selectedMonth)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedMonth !== this.props.selectedMonth) {
      this.queryAccountBalance(nextProps.selectedMonth)
    }
    if (nextProps.selectedAccounts !== this.props.selectedAccounts) {
      this.setState({ accountPrefix: defaultIfEmpty(nextProps.selectedAccounts, defaultAccount)[0].value })
    }
  }

  queryAccountBalance = (selectedMonth) => {
    this.setState({ loading: true })
    let year, month;
    const { accountPrefix } = this.state;
    if (selectedMonth) {
      const yearAndMonth = selectedMonth.split('-').filter(a => a)
      if (yearAndMonth.length === 1) {
        year = yearAndMonth[0]
      } else if (yearAndMonth.length === 2) {
        year = yearAndMonth[0]
        month = yearAndMonth[1]
      }
    }
    fetch(`/api/auth/stats/account/balance?prefix=${accountPrefix}&year=${year || ''}&month=${month || ''}`)
      .then(balanceData => {
        this.setState({ balanceData })
      }).finally(() => { this.setState({ loading: false }) })
  }

  handleChangeAccount = (accountPrefix) => {
    this.setState({ accountPrefix }, () => {
      this.queryAccountBalance(this.props.selectedMonth)
    })
  }

  render() {
    if (this.props.chartLoading) {
      return <div style={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin /></div>
    }
    return (
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <Segmented options={defaultIfEmpty(this.props.selectedAccounts, defaultAccount)} value={this.state.accountPrefix} onChange={this.handleChangeAccount} />
        </div>
        <Spin spinning={this.state.loading}>
          <Chart
            appendPadding={[10, 0, 0, 10]}
            autoFit
            height={500}
            data={this.state.balanceData}
            scale={{ amount: { alias: '合计', type: 'linear-strict' }, year: { range: [0, 1] } }}
          >

            <Line position="date*amount" />
            <Point position="date*amount" />
            <Tooltip showCrosshairs follow={false} />
          </Chart>
        </Spin>
      </div >
    )
  }
}

export default AccountBalanceChart
