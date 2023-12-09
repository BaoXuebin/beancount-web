import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Col, Row, Tabs } from 'antd';
import React, { Component } from 'react';
import AccountBalanceChart from '../../components/chart/AccountBalanceChart';
import AccountDayTrendChart from '../../components/chart/AccountDayTrendChart';
import IncomeExpensesLineChart from '../../components/chart/IncomeExpensesLineChart';
import PayeeChart from '../../components/chart/PayeeChart';
import SubAccountPercentPie from '../../components/chart/SubAccountPercentPie';
import StatisticAmount from '../../components/StatisticAmount';
import { AccountTypeDict, defaultIfEmpty, fetch, getCurrentMonth, getLastMonth } from '../../config/Util';
import ThemeContext from '../../context/ThemeContext';
import Page from '../base/Page';
import './styles/stats.css';
import MonthSelector from '../../components/MonthSelector';
import dayjs from 'dayjs';
import AccountAmount from '../../components/AccountAmount';
import AccountCascader from '../../components/AccountCascader';

class Stats extends Component {

  theme = this.context.theme
  timeoutEvent = null

  state = {
    statsTab: localStorage.getItem("statsTabIndx") || '1',
    loading: false,
    chartLoading: false,
    Assets: 0,
    Income: 0,
    Expenses: 0,
    Liabilities: 0,
    hideMoney: JSON.parse(window.localStorage.getItem("hideMoney") || 'false'),
    selectedMonth: dayjs().date() >= 10 ? getCurrentMonth() : getLastMonth(),
    selectedAccounts: defaultIfEmpty(JSON.parse(window.localStorage.getItem('accounts') || '[]'), [])
  }

  componentDidMount() {
    this.queryStatsTotalAmount()
  }

  componentWillUnmount() {
    if (this.timeoutEvent) {
      clearTimeout(this.timeoutEvent)
    }
  }

  queryStatsTotalAmount = () => {
    this.setState({ loading: true })
    let year = '', month = '';
    const { selectedMonth } = this.state
    if (selectedMonth) {
      const yearAndMonth = selectedMonth.split('-').filter(a => a)
      if (yearAndMonth.length === 1) {
        year = yearAndMonth[0]
      } else if (yearAndMonth.length === 2) {
        year = yearAndMonth[0]
        month = yearAndMonth[1]
      }
    }
    fetch(`/api/auth/stats/total?year=${year}&month=${month}`)
      .then(res => {
        const { Income, Expenses, Liabilities, Assets } = res;
        this.setState({ Assets, Income, Expenses, Liabilities })
      }).catch(console.error).finally(() => { this.setState({ loading: false }) })
  }

  handleChangeMonth = (selectedMonth) => {
    this.setState({ selectedMonth }, () => {
      this.queryStatsTotalAmount()
    })
  }

  handleChangeAccount = (accounts) => {
    this.setState({
      selectedAccounts: accounts
    })
  }

  handleChangeTab = (statsTab) => {
    if (this.timeoutEvent) {
      clearTimeout(this.timeoutEvent)
    }
    this.setState({ chartLoading: true, statsTab }, () => {
      localStorage.setItem("statsTabIndx", statsTab)
    })
    this.timeoutEvent = setTimeout(() => {
      this.setState({ chartLoading: false })
    }, 300)
  }

  handleHideMoney = () => {
    const hideMoney = !this.state.hideMoney
    this.setState({ hideMoney })
    window.localStorage.setItem('hideMoney', hideMoney)
  }

  render() {
    if (this.context.theme !== this.theme) {
      this.theme = this.context.theme
    }

    const { loading, hideMoney, statsTab } = this.state
    const totalLiabilitiesStr = AccountAmount('Liabilities:', this.state.Liabilities || 0)
    const totalLiabilitiesVal = Number(totalLiabilitiesStr.substring(1, 100))
    const totalLiabilitiesPrefix = totalLiabilitiesStr.substring(0, 1)
    return (
      <div className="stats-page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <MonthSelector value={this.state.selectedMonth} onChange={this.handleChangeMonth} />
            &nbsp;&nbsp;{hideMoney ? <Button size="small" icon={<EyeInvisibleOutlined />} onClick={this.handleHideMoney}></Button> : <Button size="small" icon={<EyeOutlined />} onClick={this.handleHideMoney}></Button>}
          </div>
          <div>
            <AccountCascader value={this.state.selectedAccounts} onChange={this.handleChangeAccount} />
          </div>
        </div>
        {/* <h1>统计</h1> */}
        <div style={{ height: '1rem' }}></div>
        <div>
          <Row gutter={16}>
            <Col span={12} offset={6}>
              <StatisticAmount
                hide={hideMoney}
                style={{ cursor: 'pointer' }}
                title={`${AccountTypeDict['Assets']}总额`}
                value={this.state.Assets || 0}
                loading={loading}
              />
            </Col>
          </Row>
          <div style={{ height: '1rem' }}></div>
          <Row gutter={16}>
            <Col span={8}>
              <StatisticAmount hide={hideMoney} title={`累计${AccountTypeDict['Income']}`} value={-this.state.Income || 0} loading={loading} prefix="+" valueStyle={{ color: '#cf1322' }} />
            </Col>
            <Col span={8}>
              <StatisticAmount hide={hideMoney} title={`累计${AccountTypeDict['Expenses']}`} value={this.state.Expenses || 0} loading={loading} prefix="-" valueStyle={{ color: '#3f8600' }} />
            </Col>
            <Col span={8}>
              <StatisticAmount hide={hideMoney} title={`累计${AccountTypeDict['Liabilities']}`} value={totalLiabilitiesVal} loading={loading} prefix={totalLiabilitiesPrefix} valueStyle={{ color: '#3f8600' }} />
            </Col>
          </Row>
        </div>
        <Tabs defaultActiveKey="1" destroyInactiveTabPane activeKey={statsTab} centered style={{ marginTop: '2rem' }} onChange={this.handleChangeTab}>
          <Tabs.TabPane tab="月度收支统计图" key="1">
            <IncomeExpensesLineChart chartLoading={this.state.chartLoading} selectedMonth={this.state.selectedMonth} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="资产负债统计" key="2">
            <AccountBalanceChart chartLoading={this.state.chartLoading} selectedAccounts={this.state.selectedAccounts} selectedMonth={this.state.selectedMonth} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="损益账户统计" key="3">
            <AccountDayTrendChart chartLoading={this.state.chartLoading} selectedAccounts={this.state.selectedAccounts} selectedMonth={this.state.selectedMonth} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="账户分布占比" key="4">
            <SubAccountPercentPie chartLoading={this.state.chartLoading} selectedAccounts={this.state.selectedAccounts} selectedMonth={this.state.selectedMonth} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="商户消费排行" key="5">
            <PayeeChart chartLoading={this.state.chartLoading} selectedAccounts={this.state.selectedAccounts} selectedMonth={this.state.selectedMonth} />
          </Tabs.TabPane>
        </Tabs>
      </div >
    );
  }
}

Stats.contextType = ThemeContext

export default Page(Stats);
