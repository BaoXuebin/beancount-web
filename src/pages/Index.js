import { EyeInvisibleOutlined, EyeOutlined, FormOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Empty, List, Row, Spin, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { Component } from 'react';
import AccountAmount from '../components/AccountAmount';
import AccountIcon from '../components/AccountIcon';
import AddTransactionDrawer from '../components/AddTransactionDrawer';
import MonthSelector from '../components/MonthSelector';
import StatisticAmount from '../components/StatisticAmount';
import { AccountTypeDict, fetch, getAccountIcon, getAccountName } from '../config/Util';
import ThemeContext from '../context/ThemeContext';
import Page from './base/Page';
import './styles/Index.css';

class Index extends Component {

  theme = this.context.theme
  formRef = React.createRef();
  ledgerId = window.localStorage.getItem("ledgerId")
  currentMonth = dayjs().format('YYYY-M')

  state = {
    loading: false,
    hideMoney: JSON.parse(window.localStorage.getItem("hideMoney") || 'false'),
    Income: 0,
    Expenses: 0,
    Liabilities: 0,
    listLoading: false,
    type: 'Expenses',
    transactionDateGroup: {},
    // 所有记账的月份，初始化当月
    selectedMonth: this.currentMonth,
    addTransactionDrawerVisible: false
  }

  componentDidMount() {
    if (!window.localStorage.getItem("ledgerId")) {
      this.props.history.replace('/ledger')
    } else {
      this.queryMonthStats();
      this.queryEntryList();
    }
  }

  queryMonthStats = () => {
    this.setState({ loading: true })
    fetch(`/api/auth/stats/total?year=${dayjs(this.state.selectedMonth).year()}&month=${dayjs(this.state.selectedMonth).month() + 1}`)
      .then(res => {
        const { Income = 0, Expenses = 0, Liabilities = 0 } = res;
        this.setState({ Income, Expenses, Liabilities })
      }).catch(console.error).finally(() => { this.setState({ loading: false }) })
  }

  queryEntryList = () => {
    const { type, selectedMonth } = this.state
    const year = dayjs(selectedMonth).year()
    const month = dayjs(selectedMonth).month() + 1

    this.setState({ listLoading: true })
    fetch(`/api/auth/entry?type=${type}&year=${year}&month=${month}`)
      .then(transactionList => {
        const transactionDateGroup = {}
        transactionList.forEach(transaction => {
          const date = transaction.date;
          const transactionGroup = transactionDateGroup[date]
          if (transactionGroup) {
            transactionGroup.children.push(transaction)
          } else {
            transactionDateGroup[date] = { date, children: [transaction] }
          }
        })
        this.setState({ transactionDateGroup })
      }).catch(console.error).finally(() => { this.setState({ listLoading: false }) })
  }

  handleChangeEntryType = (type) => {
    this.setState({ type }, () => {
      this.queryEntryList();
    })
  }

  handleChangeMonth = (selectedMonth) => {
    this.setState({ selectedMonth }, () => {
      this.queryMonthStats();
      this.queryEntryList();
    })
  }

  handleOpenDrawer = () => {
    this.setState({ addTransactionDrawerVisible: true })
  }

  handleCloseDrawer = () => {
    this.setState({ addTransactionDrawerVisible: false })
  }

  handleAddTransaction = () => {
    this.queryEntryList()
    this.handleCloseDrawer()
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

    const { loading, type, listLoading, transactionDateGroup, addTransactionDrawerVisible, hideMoney } = this.state
    const transactionGroups = Object.values(transactionDateGroup);
    return (
      <div className="index-page page">
        <div className="top-wrapper">
          <div>
            <MonthSelector value={this.state.selectedMonth} onChange={this.handleChangeMonth} />
            &nbsp;&nbsp;{ hideMoney ? <EyeInvisibleOutlined onClick={this.handleHideMoney} /> : <EyeOutlined onClick={this.handleHideMoney} /> }
          </div>
          <Button type="primary" size="small" icon={<FormOutlined />} onClick={this.handleOpenDrawer}>记账</Button>
        </div>
        <div style={{ textAlign: 'center', cursor: 'pointer' }}>
          <Row>
            <Col span={8} onClick={() => { this.handleChangeEntryType('Income') }}>
              <StatisticAmount hide={hideMoney} title={`本月${AccountTypeDict['Income']}`} value={Math.abs(this.state.Income)} loading={loading} prefix={this.state.Income > 0 ? '-' : '+'} valueStyle={{ color: '#cf1322' }} />
            </Col>
            <Col span={8} onClick={() => { this.handleChangeEntryType('Expenses') }}>
              <StatisticAmount hide={hideMoney} title={`本月${AccountTypeDict['Expenses']}`} value={Math.abs(this.state.Expenses)} loading={loading} prefix={this.state.Expenses >= 0 ? '-' : '+'} valueStyle={{ color: '#3f8600' }} />
            </Col>
            <Col span={8} onClick={() => { this.handleChangeEntryType('Liabilities') }}>
              <StatisticAmount hide={hideMoney} title={`本月${AccountTypeDict['Liabilities']}`} value={Math.abs(this.state.Liabilities)} loading={loading} prefix={this.state.Liabilities > 0 ? '+' : '-'} valueStyle={{ color: '#3f8600' }} />
            </Col>
          </Row>
        </div>
        <Divider plain>本月{AccountTypeDict[this.state.type]}明细</Divider>
        <div>
          {
            (!listLoading && transactionGroups.length === 0) ? < Empty description={`无${AccountTypeDict[type]}内容`} /> :
              <Spin tip="加载中..." style={{ marginTop: '1rem' }} spinning={listLoading}>
                {
                  transactionGroups.map(group => (
                    <List
                      key={group.date}
                      header={<div>{dayjs(group.date).format('YYYY年M月D号')}&nbsp;&nbsp;{group.date === dayjs().format('YYYY-MM-DD') && <Tag color="#1DA57A">今天</Tag>}</div>}
                      itemLayout="horizontal"
                      dataSource={group.children}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            item.amount ? <div>{AccountAmount(item.account, item.amount, item.commoditySymbol)}</div> : ''
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<AccountIcon iconType={getAccountIcon(item.account)} />}
                            title={item.desc}
                            description={`${item.date} ${getAccountName(item.account)} ${item.payee}`}
                          />
                        </List.Item>
                      )}
                    />
                  ))
                }
              </Spin>
          }
        </div>
        <AddTransactionDrawer {...this.props} onClose={this.handleCloseDrawer} onSubmit={this.handleAddTransaction} visible={addTransactionDrawerVisible} />
      </div>
    );
  }
}

Index.contextType = ThemeContext

export default Page(Index);
