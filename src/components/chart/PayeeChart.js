import { Input, Select, Spin } from 'antd';
import { Chart, Coordinate, Interaction, Interval } from "bizcharts";
import React, { Component } from "react";
import { fetch, getCurrentMonth } from '../../config/Util';
import MonthSelector from '../MonthSelector';

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

  handleEnter = (e) => {
    if (e.key === 'Enter') {
      const accountPrefix = this.accountInput.input.value.trim()
      this.setState({ accountPrefix }, () => {
        this.queryPayeeStatsValue(this.props.selectedMonth)
      })
    }
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
        <Input
          ref={input => this.accountInput = input}
          defaultValue={this.state.accountPrefix}
          placeholder="输入账户"
          style={{ width: '240px' }}
          onKeyPress={this.handleEnter}
          addonAfter={
            <Select value={this.state.type} onChange={this.handleChangeStatsType}>
              <Select.Option value="sum">累计</Select.Option>
              <Select.Option value="cot">频次</Select.Option>
              <Select.Option value="avg">单笔</Select.Option>
            </Select>
          }
        />
        <Spin spinning={this.state.loading}>
          <Chart
            height={560}
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
                  position: "middle", // top|middle|bottom|left|right
                  // offsetX: -30,
                  // content: numeral(val).format('0,0'),
                  style: {
                    fill: "#fff",
                  },
                }),
                // {
                //   layout: {
                //     type: "overlap",
                //   },
                // },
              ]}
            />
            <Interaction type="active-region" />
          </Chart>
        </Spin>
      </div>
    )
  }
}

export default PayeeChart
