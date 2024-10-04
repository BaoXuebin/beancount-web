import { Segmented, Spin } from 'antd';
import { Chart, Coordinate, Interaction, Interval } from "bizcharts";
import React, { Component } from "react";
import { AccountTypeDict, defaultIfEmpty, fetch, formatCurrency } from '../../config/Util';

const defaultAccount = [{ value: 'Expenses', label: AccountTypeDict['Expenses'] }]
class PayeeChart extends Component {

  state = {
    loading: false,
    payee: [],
    type: 'sum',
    accountPrefix: 'Expenses'
  }

  componentDidMount() {
    this.queryPayeeStatsValue(this.props.selectedMonth)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedMonth !== this.props.selectedMonth) {
      this.queryPayeeStatsValue(nextProps.selectedMonth)
    }
  }

  queryPayeeStatsValue = (selectedMonth) => {
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
    fetch(`/api/auth/stats/payee?prefix=${accountPrefix}&year=${year || ''}&month=${month || ''}&type=${type}`)
      .then(payee => {
        const result = payee.slice(-25)
        this.setState({ payee: result })
      }).finally(() => { this.setState({ loading: false }) })
  }

  handleChangeAccount = (value) => {
    this.setState({ accountPrefix: value }, () => {
      this.queryPayeeStatsValue(this.props.selectedMonth)
    })
  }

  handleChangeStatsType = (type) => {
    this.setState({ type }, () => {
      this.queryPayeeStatsValue(this.props.selectedMonth)
    })
  }

  render() {
    if (this.props.chartLoading) {
      return <div style={{ height: 560, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin /></div>
    }
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <Segmented options={defaultIfEmpty(this.props.selectedAccounts, defaultAccount)} value={this.state.accountPrefix} onChange={this.handleChangeAccount} />
          <Segmented options={[
            { value: 'sum', label: '累计' },
            { value: 'cot', label: '频次' },
            { value: 'avg', label: '单笔' },
          ]} value={this.state.type} onChange={this.handleChangeStatsType} />
        </div>
        <Spin spinning={this.state.loading}>
          <Chart
            appendPadding={[0, 70, 0, 0]}
            height={Math.max(this.state.payee.length * 30, 120)}
            data={this.state.payee}
            autoFit
            scale={{
              value: {
                formatter: (v) => `${v}${this.state.type === 'cot' ? '次' : '元'}`,
              },
            }}
          >
            <Coordinate transpose />
            <Interval
              position="payee*value"
              label={[
                "value",
                (val) => ({
                  position: "right", // top|middle|bottom|left|right
                  offsetX: -8,
                  content: this.state.type !== 'cot' ? formatCurrency(val, this.props.commodity) : `${val}次`,
                  style: {
                    fill: "#3c3c3c",
                  },
                }),
              ]}
              tooltip={['payee*value', (payee, value) => {
                return {
                  title: payee,
                  name: '合计',
                  value: this.state.type !== 'cot' ? formatCurrency(value, this.props.commodity) : `${value}次`
                };
              }]}
            />
            <Interaction type="active-region" />
          </Chart>
        </Spin>
      </div>
    )
  }
}

export default PayeeChart
