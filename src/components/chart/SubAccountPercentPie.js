import { Input, Select, Spin } from 'antd';
import { Axis, Chart, Coordinate, Interaction, Interval, Tooltip } from "bizcharts";
import Decimal from 'decimal.js';
import React, { Component } from "react";
import { fetch, getCurrentMonth } from '../../config/Util';
import MonthSelector from '../MonthSelector';


class SubAccountPercentPie extends Component {

  state = {
    loading: false,
    subAccountPercentData: [],
    level: '1',
    accountPrefix: 'Expenses',
    selectedMonth: getCurrentMonth()
  }

  componentDidMount() {
    this.queryStatsSubAccountPercent()
  }

  queryStatsSubAccountPercent = () => {
    this.setState({ loading: true })
    let year, month;
    const { accountPrefix, level, selectedMonth } = this.state;
    if (selectedMonth) {
      const yearAndMonth = selectedMonth.split('-').filter(a => a)
      if (yearAndMonth.length === 1) {
        year = yearAndMonth[0]
      } else if (yearAndMonth.length === 2) {
        year = yearAndMonth[0]
        month = yearAndMonth[1]
      }
    }
    fetch(`/api/auth/stats/account/percent?prefix=${accountPrefix}&year=${year || ''}&month=${month || ''}&level=${level}`)
      .then(res => {
        let totalAmount = Decimal(0)
        res.forEach(r => {
          totalAmount = totalAmount.plus(r.amount)
        })
        totalAmount = totalAmount.toFixed(2)
        this.setState({
          subAccountPercentData: res.map(r => {
            const subAccountAmount = Decimal(r.amount).toFixed(2)
            return { item: r.account.replace(this.state.accountPrefix, '').replace(':', ''), count: Number(subAccountAmount), percent: Number(Decimal(subAccountAmount / totalAmount).toFixed(5)) }
          })
        })
      }).finally(() => { this.setState({ loading: false }) })
  }

  handleEnter = (e) => {
    if (e.key === 'Enter') {
      const accountPrefix = this.accountInput.input.value.trim()
      this.setState({ accountPrefix }, () => {
        this.queryStatsSubAccountPercent()
      })
    }
  }

  handleChangeAccountLevel = (level) => {
    this.setState({ level }, () => {
      this.queryStatsSubAccountPercent()
    })
  }

  handleChangeMonth = (selectedMonth) => {
    this.setState({ selectedMonth }, () => {
      this.queryStatsSubAccountPercent()
    })
  }

  render() {
    if (this.props.chartLoading) {
      return <div style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin /></div>
    }
    return (
      <div style={{ marginTop: '1rem' }}>
        <MonthSelector size="middle" value={this.state.selectedMonth} onChange={this.handleChangeMonth} />
        &nbsp;
        <Input
          ref={input => this.accountInput = input}
          defaultValue={this.state.accountPrefix}
          placeholder="输入账户"
          style={{ width: '240px' }}
          onKeyPress={this.handleEnter}
          addonAfter={
            <Select defaultValue="1" value={this.state.level} onChange={this.handleChangeAccountLevel}>
              <Select.Option value="1">一层</Select.Option>
              <Select.Option value="2">二层</Select.Option>
              <Select.Option value="">不限制</Select.Option>
            </Select>
          }
        />
        <Spin spinning={this.state.loading}>
          <Chart height={560} data={this.state.subAccountPercentData} scale={{
            percent: {
              formatter: (val) => {
                val = val * 100 + '%';
                return val;
              },
            },
          }} autoFit onGetG2Instance={c => {
            c.geometries[0].elements.forEach((e, idx) => {
              e.setState('selected', idx === 0 ? true : false);
            })
          }}
          >
            <Coordinate type="theta" radius={0.75} />
            <Tooltip>
              {(title, items) => {
                return <div style={{ padding: '.8rem 1rem' }}>{title}: {items[0].data.count}元</div>
              }}
            </Tooltip>
            <Axis visible={false} />
            <Interval
              position="percent"
              adjust="stack"
              color="item"
              style={{
                lineWidth: 1,
                stroke: '#fff',
              }}
              label={['count', {
                content: (data) => {
                  let item = data.item
                  if (item.indexOf(':') >= 0) {
                    const arr = item.split(':')
                    item = arr[arr.length - 1]
                  }
                  return `${item}: ${Number(data.percent * 100).toFixed(2)}%`;
                },
              }]}
            />
            <Interaction type='element-single-selected' />
          </Chart>
        </Spin>
      </div>
    )
  }
}

export default SubAccountPercentPie
