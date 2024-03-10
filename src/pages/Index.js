import { AccountBookOutlined, CloudUploadOutlined, EyeInvisibleOutlined, EyeOutlined, FormOutlined, FallOutlined, RiseOutlined } from '@ant-design/icons';
import { Button, Col, Empty, List, Row, Spin, Tabs, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { Component } from 'react';
import AccountAmount from '../components/AccountAmount';
import AccountIcon from '../components/AccountIcon';
import AccountTransactionDrawer from '../components/AccountTransactionDrawer';
import AddTransactionDrawer from '../components/AddTransactionDrawer';
import CalendarDrawer from '../components/CalendarDrawer';
import MonthSelector from '../components/MonthSelector';
import StatisticAmount from '../components/StatisticAmount';
import TagTransactionDrawer from '../components/TagTransactionDrawer';
import { AccountTypeDict, fetch, getAccountIcon, getAccountName } from '../config/Util';
import ThemeContext from '../context/ThemeContext';
import Page from './base/Page';
import './styles/Index.css';

const TabPane = Tabs.TabPane

const TransactionList = ({ loading, transactionGroups, type, onOpenAccountDrawer, onOpenTagDrawer }) => (
  <div style={{ minHeight: '400px' }}>
    {
      (!loading && transactionGroups.length === 0) ? < Empty description={`无${AccountTypeDict[type]}内容`} /> :
        <Spin tip="加载中..." style={{ marginTop: '1rem' }} spinning={loading}>
          {
            transactionGroups.map(group => (
              <List
                split={false}
                key={group.date}
                header={<div>{dayjs(group.date).format('YYYY年M月D号')}&nbsp;&nbsp;{group.date === dayjs().format('YYYY-MM-DD') && <Tag color="#1DA57A">今天</Tag>}</div>}
                itemLayout="horizontal"
                dataSource={group.children}
                renderItem={item => (
                  <List.Item
                    actions={[
                      item.number ? <div>{AccountAmount(item.account, item.number, item.currencySymbol, item.currency)}</div> : ''
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<AccountIcon iconType={getAccountIcon(item.account)} />}
                      title={item.desc}
                      description={
                        <div>
                          {
                            item.tags && <div>{item.tags.map(t => <a style={{ marginRight: '4px' }} onClick={() => onOpenTagDrawer(t)}>#{t}</a>)}</div>
                          }
                          {item.date}&nbsp;
                          <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => { onOpenAccountDrawer(item.account) }}>{getAccountName(item.account)}</span>
                          &nbsp;{item.payee}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ))
          }
        </Spin>
    }
  </div>
)
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
    addTransactionDrawerVisible: false,
    accountTransactionDrawerVisible: false,
    selectedAccount: null,
    tagTransactionDrawerVisible: false,
    selectedTag: null,
    // 账单日历
    calendarDrawerVisible: false,
    // 查询范围：all=全部，year=年，month=月
    queryRange: 'month'
  }

  componentDidMount() {
    if (!window.localStorage.getItem("ledgerId")) {
      this.props.history.replace('/ledger')
    } else {
      this.queryMonthStats();
      this.queryTransactionList();
    }
  }

  queryMonthStats = () => {
    const { selectedMonth, queryRange } = this.state;
    let year = ''
    let mon = ''
    if (queryRange === 'month') { // 选择的年和月
      year = dayjs(selectedMonth).year()
      mon = dayjs(selectedMonth).month() + 1
    } else if (queryRange === 'year') { // 只选择年
      year = dayjs(selectedMonth).year()
    }
    this.setState({ loading: true })
    fetch(`/api/auth/stats/total?year=${year}&month=${mon}`)
      .then(res => {
        const { Income = 0, Expenses = 0, Liabilities = 0, Assets = 0 } = res;
        this.setState({ Income, Expenses, Liabilities, Assets })
      }).catch(console.error).finally(() => { this.setState({ loading: false }) })
  }

  queryTransactionList = () => {
    const { type, selectedMonth, queryRange } = this.state
    let year = ''
    let mon = ''
    if (queryRange === 'month') { // 选择的年和月
      year = dayjs(selectedMonth).year()
      mon = dayjs(selectedMonth).month() + 1
    } else if (queryRange === 'year') { // 只选择年
      year = dayjs(selectedMonth).year()
    }
    this.setState({ listLoading: true })
    fetch(`/api/auth/transaction?type=${type}&year=${year}&month=${mon}`)
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
      this.queryTransactionList();
    })
  }

  handleChangeMonth = (selectedMonth) => {
    let queryRange = 'month'
    if (!selectedMonth) {
      queryRange = 'all'
    } else if (selectedMonth.length === 4) {
      queryRange = 'year'
    }
    console.log(queryRange)
    this.setState({ selectedMonth, queryRange }, () => {
      this.queryMonthStats();
      this.queryTransactionList();
    })
  }

  handleOpenDrawer = () => {
    this.setState({ addTransactionDrawerVisible: true })
  }

  handleCloseDrawer = () => {
    this.setState({ addTransactionDrawerVisible: false })
  }

  handleNavigateImportPage = () => {
    this.props.history.replace('./import')
  }

  handleAddTransaction = () => {
    this.queryMonthStats()
    this.queryTransactionList()
    this.handleCloseDrawer()
  }

  handleHideMoney = () => {
    const hideMoney = !this.state.hideMoney
    this.setState({ hideMoney })
    window.localStorage.setItem('hideMoney', hideMoney)
  }

  handleOpenAccountTransactionDrawer = (selectedAccount) => {
    this.setState({ accountTransactionDrawerVisible: true, selectedAccount })
  }

  handleCloseAccountTransactionDrawer = () => {
    this.setState({ accountTransactionDrawerVisible: false })
  }

  handleOpenTagTransactionDrawer = (selectedTag) => {
    this.setState({ tagTransactionDrawerVisible: true, selectedTag })
  }

  handleCloseTagTransactionDrawer = () => {
    this.setState({ tagTransactionDrawerVisible: false })
  }

  handleOpenCalendarDrawer = () => {
    this.setState({ calendarDrawerVisible: true })
  }

  handleCloseCalendarDrawer = () => {
    this.setState({ calendarDrawerVisible: false })
  }

  getQueryRangeText() {
    if (this.state.queryRange === 'all') return "全部";
    if (this.state.queryRange === 'year') return "年";
    return "月";
  }

  render() {
    if (this.context.theme !== this.theme) {
      this.theme = this.context.theme
    }

    const { loading, listLoading, transactionDateGroup, addTransactionDrawerVisible, hideMoney, accountTransactionDrawerVisible, tagTransactionDrawerVisible, selectedMonth } = this.state
    const transactionGroups = Object.values(transactionDateGroup);
    return (
      <div className="index-page page">
        <div className="top-wrapper">
          <div>
            <MonthSelector value={this.state.selectedMonth} onChange={this.handleChangeMonth} />
            &nbsp;&nbsp;{hideMoney ? <Button size="small" icon={<EyeInvisibleOutlined />} onClick={this.handleHideMoney}></Button> : <Button size="small" icon={<EyeOutlined />} onClick={this.handleHideMoney}></Button>}
          </div>
          <div>
            {this.state.Assets > 0 && !hideMoney && <Tag icon={<RiseOutlined />} color="#f50" >{this.getQueryRangeText()}资产：{AccountAmount('Assets:', this.state.Assets)}</Tag>}
            {this.state.Assets < 0 && !hideMoney && <Tag icon={<FallOutlined />} color="#1DA57A">{this.getQueryRangeText()}资产：{AccountAmount('Assets:', this.state.Assets)}</Tag>}
            <Button size="small" icon={<AccountBookOutlined />} onClick={this.handleOpenCalendarDrawer}>日历</Button>&nbsp;&nbsp;
            <Button size="small" icon={<CloudUploadOutlined />} onClick={this.handleNavigateImportPage}>导入</Button>&nbsp;&nbsp;
            <Button type="primary" size="small" icon={<FormOutlined />} onClick={this.handleOpenDrawer}>记账</Button>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Row>
            <Col span={8}>
              <StatisticAmount hide={hideMoney} title={`${this.getQueryRangeText()}${AccountTypeDict['Income']}`} value={Math.abs(this.state.Income)} loading={loading} prefix={this.state.Income > 0 ? '-' : '+'} valueStyle={{ color: '#cf1322' }} />
            </Col>
            <Col span={8}>
              <StatisticAmount hide={hideMoney} title={`${this.getQueryRangeText()}${AccountTypeDict['Expenses']}`} value={Math.abs(this.state.Expenses)} loading={loading} prefix={this.state.Expenses >= 0 ? '-' : '+'} valueStyle={{ color: '#3f8600' }} />
            </Col>
            <Col span={8}>
              <StatisticAmount hide={hideMoney} title={`${this.getQueryRangeText()}${AccountTypeDict['Liabilities']}`} value={Math.abs(this.state.Liabilities)} loading={loading} prefix={this.state.Liabilities > 0 ? '+' : '-'} valueStyle={{ color: '#3f8600' }} />
            </Col>
          </Row>
        </div>
        <Tabs centered defaultActiveKey="Expenses" onChange={this.handleChangeEntryType} style={{ marginTop: '1rem' }}>
          <TabPane tab="收入明细" key="Income">
            <TransactionList
              type={'Income'}
              loading={listLoading}
              transactionGroups={transactionGroups}
              onOpenAccountDrawer={this.handleOpenAccountTransactionDrawer}
              onOpenTagDrawer={this.handleOpenTagTransactionDrawer}
            />
          </TabPane>
          <TabPane tab="支出明细" key="Expenses">
            <TransactionList
              type={'Expenses'}
              loading={listLoading}
              transactionGroups={transactionGroups}
              onOpenAccountDrawer={this.handleOpenAccountTransactionDrawer}
              onOpenTagDrawer={this.handleOpenTagTransactionDrawer}
            />
          </TabPane>
          <TabPane tab="负债明细" key="Liabilities">
            <TransactionList
              type={'Liabilities'}
              loading={listLoading}
              transactionGroups={transactionGroups}
              onOpenAccountDrawer={this.handleOpenAccountTransactionDrawer}
              onOpenTagDrawer={this.handleOpenTagTransactionDrawer}
            />
          </TabPane>
        </Tabs>
        <AddTransactionDrawer
          {...this.props}
          visible={addTransactionDrawerVisible}
          onClose={this.handleCloseDrawer}
          onSubmit={this.handleAddTransaction}
        />
        {
          this.state.selectedAccount &&
          <AccountTransactionDrawer
            account={this.state.selectedAccount}
            visible={accountTransactionDrawerVisible}
            onClose={this.handleCloseAccountTransactionDrawer}
          />
        }
        {
          this.state.selectedTag &&
          <TagTransactionDrawer
            tag={this.state.selectedTag}
            visible={tagTransactionDrawerVisible}
            onClose={this.handleCloseTagTransactionDrawer}
          />
        }
        {
          this.state.selectedMonth &&
          <CalendarDrawer
            month={this.state.selectedMonth}
            visible={this.state.calendarDrawerVisible}
            onClose={this.handleCloseCalendarDrawer}
          />
        }
      </div>
    );
  }
}

Index.contextType = ThemeContext

export default Page(Index);
