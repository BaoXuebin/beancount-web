import { Segmented, Spin } from 'antd';
import { Axis, Chart, Coordinate, Interaction, Interval, Tooltip } from "bizcharts";
import Decimal from 'decimal.js';
import React, { Component } from "react";
import { AccountTypeDict, defaultIfEmpty, fetch, formatCurrency, formatPercent, getAccountName } from '../../config/Util';

const defaultAccount = [{ value: 'Expenses', label: AccountTypeDict['Expenses'] }]
class SubAccountPercentPie extends Component {

  state = {
    loading: false,
    subAccountPercentData: [],
    level: '1',
    accountPrefix: defaultIfEmpty(this.props.selectedAccounts, defaultAccount)[0].value
  }

  componentDidMount() {
    this.queryStatsSubAccountPercent(this.props.selectedMonth)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedMonth !== this.props.selectedMonth) {
      this.queryStatsSubAccountPercent(nextProps.selectedMonth)
    }
  }

  queryStatsSubAccountPercent = (selectedMonth) => {
    this.setState({ loading: true })
    let year, month;
    const { accountPrefix, level } = this.state;
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
            return { item: r.account, count: Number(subAccountAmount), percent: Number(Decimal(subAccountAmount / totalAmount).toFixed(5)) }
          })
        })
      }).finally(() => { this.setState({ loading: false }) })
  }

  handleChangeAccount = (accountPrefix) => {
    this.setState({ accountPrefix }, () => {
      this.queryStatsSubAccountPercent(this.props.selectedMonth)
    })
  }

  handleChangeAccountLevel = (level) => {
    this.setState({ level }, () => {
      this.queryStatsSubAccountPercent(this.props.selectedMonth)
    })
  }

  render() {
    if (this.props.chartLoading) {
      return <div style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin /></div>
    }
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <Segmented options={defaultIfEmpty(this.props.selectedAccounts, defaultAccount)} value={this.state.accountPrefix} onChange={this.handleChangeAccount} />
          <Segmented options={[
            { value: '1', label: '账户类型' },
            { value: '', label: '所有账户' }
          ]} value={this.state.level} onChange={this.handleChangeAccountLevel} />
        </div>
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
                  return `${getAccountName(data.item)}: ${formatPercent(data.percent)}`;
                },
              }]}
              tooltip={['item*percent*count', (item, percent, count) => {
                return {
                  title: item,
                  name: '合计',
                  value: `${formatCurrency(count, this.props.commodity)} (${formatPercent(percent)})`
                }
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
