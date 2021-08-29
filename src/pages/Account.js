import { FormOutlined, LoadingOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Alert, Button, Collapse, Drawer, Form, Input, List, message, Select, Tabs, Tag, Upload } from 'antd';
import dayjs from 'dayjs';
import Decimal from 'decimal.js';
import React, { Component } from 'react';
import AccountAmount from '../components/AccountAmount';
import AccountIcon from '../components/AccountIcon';
import { fetch, getAccountCata, getAccountIcon, getAccountName } from '../config/Util';
import ThemeContext from '../context/ThemeContext';
import Page from './base/Page';
import './styles/Account.css';

const { Option } = Select;
const { Panel } = Collapse;
const { TabPane } = Tabs;
const validateMessages = {
  required: '${label} 不能为空！'
};

const AccountList = ({ loading, accounts, onEdit, onBalance }) => {
  const groupByAccountsDict = {}
  accounts.forEach(acc => {
    const typeKey = acc.type.key;
    const typeName = acc.type.name;
    const accGroup = groupByAccountsDict[typeName]
    if (accGroup) {
      accGroup.children.push(acc)
    } else {
      groupByAccountsDict[typeName] = { id: typeKey, name: typeName, children: [acc] }
    }
  })
  return (
    <Collapse ghost>
      {
        Object.values(groupByAccountsDict).map(groupByAccount => {
          const totalAmount = groupByAccount.children.map(acc => Decimal(acc.amount || 0)).reduce((a, b) => a.plus(b))
          return <Panel key={groupByAccount.id} header={`${groupByAccount.children.length}个${groupByAccount.name}账户 (￥${Math.abs(totalAmount)})`}>
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={groupByAccount.children}
              renderItem={item => (
                <List.Item
                  actions={[
                    item.amount ? <div>{AccountAmount(item.account, item.amount)}</div> : '',
                    item.loading ?
                      <LoadingOutlined /> :
                      <a key="list-delete" onClick={() => { onEdit(item.account) }}>编辑</a>,
                    <a key="list-balance" onClick={() => { onBalance(item.account) }}>核算</a>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<AccountIcon iconType={getAccountIcon(item.account)} />}
                    title={<div>{item.endDate && <Tag color="#f50">已关闭</Tag>}<span>{getAccountName(item.account)}</span></div>}
                    description={`${item.startDate}${item.endDate ? '~' + item.endDate : ''}`}
                  />
                </List.Item>
              )}
            />
          </Panel>
        })
      }
    </Collapse>
  )
}

class Account extends Component {

  theme = this.context.theme
  formRef = React.createRef();
  balanceFormRef = React.createRef();

  state = {
    loading: false,
    drawerVisible: false,
    balanceDrawerVisible: false,
    accountDrawerVisible: false,
    accounts: [],
    fetchAccountTypeloading: false,
    accountTypes: [],
    selectedAccountType: '',
    iconType: '',
    selectedAccountTypePrefix: 'Assets',
    balanceAccount: null,
    editAccount: null
  }

  componentDidMount() {
    this.queryAllAccounts()
    this.queryAllAccountTypes()
  }

  queryAllAccounts = () => {
    this.setState({ loading: true })
    fetch('/api/auth/account/all')
      .then(accounts => {
        this.setState({ accounts })
      }).catch(console.error).finally(() => { this.setState({ loading: false }) })
  }

  queryAllAccountTypes = () => {
    this.setState({ fetchAccountTypeloading: true })
    fetch('/api/auth/account/type')
      .then(accountTypes => {
        this.setState({ accountTypes })
      }).catch(console.error).finally(() => { this.setState({ fetchAccountTypeloading: false }) })
  }

  handleChangeAccountType = (selectedAccountType) => {
    this.setState({ selectedAccountType })
  }

  handleChangeAccountTypePrefix = (selectedAccountTypePrefix) => {
    this.setState({ selectedAccountTypePrefix })
  }

  handleAddAccount = (values) => {
    this.setState({ loading: true })
    const { account, date, accountType, accountTypeName } = values
    if (this.state.selectedAccountType === 'Undefined') {
      const type = `${this.state.selectedAccountTypePrefix}:${accountType}`
      fetch(`/api/auth/account/type?type=${type}&name=${accountTypeName}`, { method: 'POST' })
        .then(result => {
          this.setState({ drawerVisible: false, accountTypes: [result, ...this.state.accountTypes] });
          // 清空表单内容
          this.formRef.current.resetFields();
          message.success("添加成功")
        }).catch(console.error).finally(() => { this.setState({ loading: false }) })
    } else {
      const acc = `${this.state.selectedAccountType}:${account}`
      fetch(`/api/auth/account?account=${acc}&date=${date}`, { method: 'POST' })
        .then(result => {
          this.setState({ drawerVisible: false, accounts: [result, ...this.state.accounts] });
          // 清空表单内容
          this.formRef.current.resetFields();
          message.success("添加成功")
        }).catch(console.error).finally(() => { this.setState({ loading: false }) })
    }
  };

  handleCloseAccount = () => {
    const account = this.state.editAccount;
    const accounts = this.state.accounts.map(acc => acc.account === account ? Object.assign({ loading: true }, acc) : acc)
    this.setState({ accounts })
    const date = dayjs().format('YYYY-MM-DD')
    fetch(`/api/auth/account/close?account=${account}&date=${date}`, { method: 'POST' })
      .then(res => {
        const accounts = this.state.accounts.filter(acc => acc.account !== account)
        this.setState({ accounts })
      }).catch(console.error)
      .finally(() => { this.setState({ accountDrawerVisible: false, accounts: this.state.accounts.map(acc => { delete acc.loading; return acc; }) }) })
  }

  handleBalanceAccount = (values) => {
    this.setState({ loading: true })

    const account = this.state.balanceAccount
    const amount = values.amount
    fetch(`/api/auth/account/balance?account=${account}&amount=${amount}`, { method: 'POST' })
      .then(() => {
        const accounts = this.state.accounts.map(acc => {
          if (acc.account === account) {
            acc.amount = amount
            return acc
          }
          return acc
        })
        this.setState({ accounts, balanceDrawerVisible: false })
        this.formRef.current.resetFields();
      }).catch(console.error).finally(() => { this.setState({ loading: false }) })
  }

  handleEditAccountInput = (value) => {
    const account = `${this.state.selectedAccountType}:${value.target.value}`
    this.setState({ iconType: getAccountIcon(account) })
  }

  handleOpenDrawer = () => {
    this.setState({ drawerVisible: true }, () => {
      this.formRef.current.setFieldsValue({ date: dayjs().format('YYYY-MM-DD') })
    })
  }

  handleCloseDrawer = () => {
    this.setState({ drawerVisible: false })
  }

  handleOpenBalanceDrawer = (account) => {
    this.setState({ balanceDrawerVisible: true, balanceAccount: account })
  }

  handleCloseBalanceDrawer = () => {
    this.setState({ balanceDrawerVisible: false, balanceAccount: null })
  }

  handleOpenAccountDrawer = (account) => {
    this.setState({ accountDrawerVisible: true, editAccount: account })
  }

  handleCloseAccountDrawer = () => {
    this.setState({ accountDrawerVisible: false })
  }

  handleChangeFile = (info) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 上传成功`);
      this.setState({ accountDrawerVisible: false })
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`);
    }
  }

  render() {
    if (this.context.theme !== this.theme) {
      this.theme = this.context.theme
    }
    const { accounts, loading, drawerVisible, balanceDrawerVisible, accountTypes, iconType, selectedAccountType,
      selectedAccountTypePrefix, accountDrawerVisible, editAccount } = this.state

    return (
      <div className="account-page">
        <div className="button-wrapper">
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={this.handleOpenDrawer}>
            添加账户
          </Button>
          <Button type="text" size="small" icon={<FormOutlined />} onClick={() => { this.props.history.push('/edit') }}>
            编辑源文件
          </Button>
        </div>
        <Drawer
          title="新增账户"
          placement="bottom"
          closable={true}
          onClose={this.handleCloseDrawer}
          visible={drawerVisible}
          height="540"
          className="page-drawer"
          bodyStyle={{ display: 'flex', justifyContent: 'center' }}
        >
          <Form
            name="add-account-form"
            className="page-form"
            size="large"
            style={{ textAlign: 'left' }}
            ref={this.formRef}
            onFinish={this.handleAddAccount}
            validateMessages={validateMessages}
          >
            <Form.Item
              name="type"
              label=" 类型"
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                placeholder="类型"
                optionFilterProp="children"
                onChange={this.handleChangeAccountType}
              >
                <Option value="Undefined">+ 新增账户类型</Option>
                {
                  accountTypes.map(acc => <Option key={acc.key} value={acc.key}>{`${acc.key.slice(0, acc.key.indexOf(":"))}:${acc.name}`}</Option>)
                }
              </Select>
            </Form.Item>
            {
              selectedAccountType === 'Undefined' ?
                <Form.Item
                  name="accountType"
                  label="账户类型"
                  rules={[{ required: true }]}
                >
                  <Input
                    addonBefore={
                      <Select defaultValue={selectedAccountTypePrefix} onChange={this.handleChangeAccountTypePrefix}>
                        <Option value="Assets">资产</Option>
                        <Option value="Income">收入</Option>
                        <Option value="Expenses">支出</Option>
                        <Option value="Liabilities">负债</Option>
                        <Option value="Equity">权益</Option>
                      </Select>
                    }
                    placeholder="账户类型，如 Shopping"
                  />
                </Form.Item> :
                <Form.Item
                  name="account"
                  label="账户"
                  rules={[{ required: true }]}
                >
                  <Input
                    placeholder="账户名称，如 ICBC:工商银行"
                    addonAfter={<AccountIcon iconType={getAccountIcon(iconType)} />}
                    onChange={this.handleEditAccountInput}
                  />
                </Form.Item>
            }
            {
              selectedAccountType === 'Undefined' ?
                <Form.Item
                  name="accountTypeName"
                  label="类型名称"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="账户类型的名称，用以账户分类，如购物" />
                </Form.Item> :
                <Form.Item name="date" label="日期" rules={[{ required: true }]}>
                  <Input type="date" placeholder="时间" />
                </Form.Item>
            }
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} className="submit-button">
                添加账户
              </Button>
            </Form.Item>
          </Form>
        </Drawer>
        <div>
          <Tabs defaultActiveKey="Assets">
            <TabPane tab="资产账户" key="1">
              <AccountList loading={loading} accounts={accounts.filter(acc => getAccountCata(acc.account) === "Assets")} onEdit={this.handleOpenAccountDrawer} onBalance={this.handleOpenBalanceDrawer} />
            </TabPane>
            <TabPane tab="收入账户" key="Income">
              <AccountList loading={loading} accounts={accounts.filter(acc => getAccountCata(acc.account) === "Income")} onEdit={this.handleOpenAccountDrawer} onBalance={this.handleOpenBalanceDrawer} />
            </TabPane>
            <TabPane tab="支出账户" key="Expenses">
              <AccountList loading={loading} accounts={accounts.filter(acc => getAccountCata(acc.account) === "Expenses")} onEdit={this.handleOpenAccountDrawer} onBalance={this.handleOpenBalanceDrawer} />
            </TabPane>
            <TabPane tab="负债账户" key="Liabilities">
              <AccountList loading={loading} accounts={accounts.filter(acc => getAccountCata(acc.account) === "Liabilities")} onEdit={this.handleOpenAccountDrawer} onBalance={this.handleOpenBalanceDrawer} />
            </TabPane>
            <TabPane tab="权益账户" key="Equity">
              <AccountList loading={loading} accounts={accounts.filter(acc => getAccountCata(acc.account) === "Equity")} onEdit={this.handleOpenAccountDrawer} onBalance={this.handleOpenBalanceDrawer} />
            </TabPane>
          </Tabs>
        </div>
        <div>
          <Drawer
            title={`核算账户：${this.state.balanceAccount}`}
            placement="bottom"
            closable={true}
            onClose={this.handleCloseBalanceDrawer}
            visible={balanceDrawerVisible}
            className="page-drawer"
            height="300"
            bodyStyle={{ display: 'flex', justifyContent: 'center' }}
          >
            <Form
              name="balance-account-form"
              className="page-form"
              size="large"
              style={{ textAlign: 'left' }}
              ref={this.balanceFormRef}
              onFinish={this.handleBalanceAccount}
              validateMessages={validateMessages}
            >
              <Form.Item
                name="amount"
                rules={[{ required: true }]}
              >
                <Input type="number" placeholder="今日结束的金额" />
              </Form.Item>
              <Form.Item>
                <Alert type="info" message="核算账户前，请确保 Equity:OpeningBalances 账户存在" showIcon />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} className="submit-button">
                  核算
                </Button>
              </Form.Item>
            </Form>
          </Drawer>
          <Drawer
            title={`账户：${this.state.editAccount}`}
            placement="bottom"
            closable={true}
            onClose={this.handleCloseAccountDrawer}
            visible={accountDrawerVisible}
            className="page-drawer"
            height="300"
            bodyStyle={{ display: 'flex', justifyContent: 'center' }}
          >
            <div className="page-form">
              <Upload style={{ display: 'block' }}
                name='file'
                action={`/api/auth/account/icon?account=${editAccount}`}
                headers={{ ledgerId: window.localStorage.getItem("ledgerId") }}
                onChange={this.handleChangeFile}
              >
                <Button size="large" loading={loading} icon={<UploadOutlined />} style={{ width: '100%' }} >
                  更换ICON
                </Button>
              </Upload>
              <div style={{ height: '1rem' }}></div>
              <Button size="large" type="danger" loading={loading} className="submit-button" onClick={this.handleCloseAccount}>
                关闭账户
              </Button>
            </div>
          </Drawer>
        </div>
      </div >
    );
  }
}

Account.contextType = ThemeContext

export default Page(Account);
