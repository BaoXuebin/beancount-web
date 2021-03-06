import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Col, Row, Tabs } from 'antd';
import React, { Component } from 'react';
import AccountDayTrendChart from '../../components/chart/AccountDayTrendChart';
import IncomeExpensesLineChart from '../../components/chart/IncomeExpensesLineChart';
import PayeeChart from '../../components/chart/PayeeChart';
import SubAccountPercentPie from '../../components/chart/SubAccountPercentPie';
import StatisticAmount from '../../components/StatisticAmount';
import { AccountTypeDict, fetch } from '../../config/Util';
import ThemeContext from '../../context/ThemeContext';
import Page from '../base/Page';
import './styles/stats.css';

class Stats extends Component {

  theme = this.context.theme
  timeoutEvent = null

  state = {
    loading: false,
    chartLoading: false,
    Assets: 0,
    Income: 0,
    Expenses: 0,
    Liabilities: 0,
    hideMoney: window.localStorage.getItem("hideMoney") || false
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
    fetch('/api/auth/stats/total')
      .then(res => {
        const { Income, Expenses, Liabilities, Assets } = res;
        this.setState({ Assets, Income, Expenses, Liabilities })
      }).catch(console.error).finally(() => { this.setState({ loading: false }) })
  }

  handleChnageTab = () => {
    if (this.timeoutEvent) {
      clearTimeout(this.timeoutEvent)
    }
    this.setState({ chartLoading: true })
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

    const { loading, hideMoney } = this.state

    return (
      <div className="stats-page">
        <h1>????????????{hideMoney ? <EyeInvisibleOutlined onClick={this.handleHideMoney} /> : <EyeOutlined onClick={this.handleHideMoney} />}</h1>
        <div>
          <Row gutter={16}>
            <Col span={12} offset={6}>
              <StatisticAmount
                hide={hideMoney}
                style={{ cursor: 'pointer' }}
                title={`${AccountTypeDict['Assets']}??????`}
                value={this.state.Assets || 0}
                loading={loading}
              />
            </Col>
          </Row>
          <div style={{ height: '1rem' }}></div>
          <Row gutter={16}>
            <Col span={8}>
              <StatisticAmount hide={hideMoney} title={`??????${AccountTypeDict['Income']}`} value={-this.state.Income || 0} loading={loading} prefix="+" valueStyle={{ color: '#cf1322' }} />
            </Col>
            <Col span={8}>
              <StatisticAmount hide={hideMoney} title={`??????${AccountTypeDict['Expenses']}`} value={this.state.Expenses || 0} loading={loading} prefix="-" valueStyle={{ color: '#3f8600' }} />
            </Col>
            <Col span={8}>
              <StatisticAmount hide={hideMoney} title={`??????${AccountTypeDict['Liabilities']}`} value={-this.state.Liabilities || 0} loading={loading} prefix="-" valueStyle={{ color: '#3f8600' }} />
            </Col>
          </Row>
        </div>
        <Tabs defaultActiveKey="1" centered style={{ marginTop: '2rem' }} onChange={this.handleChnageTab}>
          <Tabs.TabPane tab="?????????????????????" key="1">
            <IncomeExpensesLineChart chartLoading={this.state.chartLoading} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="??????????????????" key="2">
            <SubAccountPercentPie chartLoading={this.state.chartLoading} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="???????????????" key="3">
            <AccountDayTrendChart chartLoading={this.state.chartLoading} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="??????????????????" key="4">
            <PayeeChart chartLoading={this.state.chartLoading} />
          </Tabs.TabPane>
        </Tabs>
      </div >
    );
  }
}

Stats.contextType = ThemeContext

export default Page(Stats);
