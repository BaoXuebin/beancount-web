import { Segmented, Select, Spin } from 'antd';
import { Chart, Interval, Tooltip } from "bizcharts";
import React, { Component } from "react";
import { AccountTypeDict, defaultIfEmpty, fetch, formatCurrency, formatDate } from '../../config/Util';

const defaultAccount = [{ value: 'Expenses', label: AccountTypeDict['Expenses'] }]

class AccountDayTrendChart extends Component {

  state = {
    loading: false,
    dayAmountData: [],
    type: 'day',
    accountPrefix: defaultIfEmpty(this.props.selectedAccounts, defaultAccount)[0].value
  }

  componentDidMount() {
    this.queryAccountDayTrend(this.props.selectedMonth)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedMonth !== this.props.selectedMonth) {
      this.queryAccountDayTrend(nextProps.selectedMonth)
    }
  }

  queryAccountDayTrend = (selectedMonth) => {
    this.setState({ loading: true })
    let year, month;
    const { accountPrefix, type } = this.state;
    if (selectedMonth) {
      const yearAndMonth = selectedMonth.split('-').filter(a => a)
      if (yearAndMonth.length === 1) {
        year = yearAndMonth[0]
      } else if (yearAndMonth.length === 2) {
        year = yearAndMonth[0]
        month = yearAndMonth[1]
      }
    }
    fetch(`/api/auth/stats/account/trend?prefix=${accountPrefix}&year=${year || ''}&month=${month || ''}&type=${type}`)
      .then(data => {
        if (data && data.length > 0) {
          data.forEach(d => {
            d.date = formatDate(d.date)
          });
        }
        this.setState({ dayAmountData: data })
      }).finally(() => { this.setState({ loading: false }) })
  }

  handleChangeAccount = (accountPrefix) => {
    this.setState({ accountPrefix }, () => {
      this.queryAccountDayTrend(this.props.selectedMonth)
    })
  }

  handleChangeStatsType = (type) => {
    this.setState({ type }, () => {
      this.queryAccountDayTrend(this.props.selectedMonth)
    })
  }

  render() {
    if (this.props.chartLoading) {
      return <div style={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin /></div>
    }
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <Segmented options={defaultIfEmpty(this.props.selectedAccounts, defaultAccount)} value={this.state.accountPrefix} onChange={this.handleChangeAccount} />
          <Segmented options={[
            { value: 'day', label: '按天' },
            { value: 'month', label: '按月' },
            { value: 'year', label: '按年' },
            { value: 'sum', label: '累计' }
          ]} value={this.state.type} onChange={this.handleChangeStatsType} />
        </div>
        <Spin spinning={this.state.loading}>
          <Chart height={480} autoFit data={this.state.dayAmountData} interactions={['active-region']} padding={[30, 30, 30, 50]} >
            <Interval
              position="date*amount"
              tooltip={['date*amount', (date, amount) => {
                return {
                  name: '合计',
                  value: formatCurrency(amount, this.props.commodity)
                }
              }]}
            />
            {/* <Tooltip>
              {(title, items) => {
                return <div style={{ padding: '.8rem 1rem' }}>{formatDate(title)}: {formatCurrency(items[0].data.amount, this.props.commodity)}</div>
              }}
            </Tooltip> */}
          </Chart>
        </Spin>
      </div>
    )
  }
}

export default AccountDayTrendChart
