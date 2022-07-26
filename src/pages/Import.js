import { CloseCircleOutlined, CloseOutlined, DoubleRightOutlined, ExclamationCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { Avatar, Button, Input, List, message, Modal, Select, Tag, Upload } from 'antd';
import React, { Component } from 'react';
import AliPayLogo from '../assets/aliPay.png';
import WxPayLogo from '../assets/wxPay.png';
import AccountAmount from '../components/AccountAmount';
import AccountIcon from '../components/AccountIcon';
import { fetch, getAccountIcon, getAccountName } from '../config/Util';
import ThemeContext from '../context/ThemeContext';
import Page from './base/Page';


class Import extends Component {

  theme = this.context.theme

  state = {
    loading: false,
    payeeType: 'AliPay',
    payeeAccount: null,
    transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
    accounts: [],
    tags: []
  }

  componentDidMount() {
    this.queryAllValidAccounts()
    this.queryAllTags()
  }

  queryAllValidAccounts = () => {
    fetch('/api/auth/account/valid')
      .then(accounts => {
        this.setState({ accounts })
      }).catch(console.error)
  }

  queryAllTags = () => {
    fetch('/api/auth/tags')
      .then(tags => {
        this.setState({ tags })
      }).catch(console.error)
  }

  handleChangePayeeType = (payeeType) => {
    this.setState({ payeeType, payeeAccount: null })
  }

  getUploadUrl = () => {
    if (this.state.payeeType === 'AliPay') {
      return '/api/auth/import/alipay'
    } else if (this.state.payeeType === 'WxPay') {
      return '/api/auth/import/wx'
    }
    return ''
  }

  getPayeeName = () => {
    if (this.state.payeeType === 'AliPay') {
      return '支付宝'
    }
    if (this.state.payeeType === 'WxPay') {
      return '微信'
    }
    return ''
  }

  handleChangeFile = (info) => {
    if (info.file.status === 'done') {
      const { code, data } = info.file.response
      if (code === 200) {
        message.success(`${info.file.name} 解析成功`);
        const transactions = data.map(d => {
          // 收入
          if (d.account.indexOf('Income')) {
            d.originAccount = this.state.payeeAccount
            d.originNumber = -1 * Number(d.number)
            d.number = Number(d.number)
            d.targetNumber = d.number
          }
          // 支出
          if (d.account.indexOf('Expenses')) {
            d.targetAccount = this.state.payeeAccount
            d.targetNumber = Number(d.number)
            d.number = -1 * Number(d.number)
            d.originNumber = d.number
          }
          return d
        })
        this.setState({ transactions }, () => { localStorage.setItem('transactions', JSON.stringify(this.state.transactions)) })
      } else {
        message.success(`${info.file.name} 解析失败`);
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 解析失败`);
    }
  }

  handleChangePayeeAccount = (payeeAccount) => {
    const transactions = this.state.transactions.map(d => {
      // 收入
      if (d.account.indexOf('Income') && payeeAccount) {
        d.originAccount = payeeAccount
      }
      // 支出
      if (d.account.indexOf('Expenses') && payeeAccount) {
        d.targetAccount = payeeAccount
      }
      return d
    })
    this.setState({ payeeAccount, transactions }, () => { localStorage.setItem('transactions', JSON.stringify(this.state.transactions)) })
  }

  handleChangePayee = (oldPayee, newPayee) => {
    const transactions = this.state.transactions.map(d => {
      if (d.payee === oldPayee) {
        d.payee = newPayee
      }
      return d
    })
    this.setState({ transactions }, () => { localStorage.setItem('transactions', JSON.stringify(this.state.transactions)) })
  }

  handleChangeDesc = (id, desc) => {
    const transactions = this.state.transactions.map(d => {
      if (d.id === id) {
        d.desc = desc
      }
      return d
    })
    this.setState({ transactions }, () => { localStorage.setItem('transactions', JSON.stringify(this.state.transactions)) })
  }

  handleChangeOriginAccount = (account, item) => {
    const transactions = this.state.transactions.map(transaction => {
      if ((transaction.payee === item.payee || transaction.desc === item.desc) && !transaction.originAccount) {
        transaction.originAccount = account
        transaction.account = account
      }
      if (transaction.id === item.id) {
        transaction.originAccount = account
        transaction.account = account
      }
      return transaction
    })
    this.setState({ transactions }, () => { localStorage.setItem('transactions', JSON.stringify(this.state.transactions)) })
  }

  handleChangeTargetAccount = (account, item) => {
    const transactions = this.state.transactions.map(transaction => {
      if ((transaction.payee === item.payee || transaction.desc === item.desc) && !transaction.targetAccount) {
        transaction.targetAccount = account
        transaction.account = account
      }
      if (transaction.id === item.id) {
        transaction.targetAccount = account
        transaction.account = account
      }
      return transaction
    })
    this.setState({ transactions }, () => { localStorage.setItem('transactions', JSON.stringify(this.state.transactions)) })
  }

  handleChangeTags = (tags, item) => {
    const transactions = this.state.transactions.map(transaction => {
      if (transaction.id === item.id) {
        transaction.tags = tags
      }
      return transaction
    })
    this.setState({ transactions }, () => { localStorage.setItem('transactions', JSON.stringify(this.state.transactions)) })
  }

  handleImport = () => {
    const data = this.state.transactions.map(transaction => {
      if (!transaction.originAccount || !transaction.targetAccount) {
        return null;
      }
      return {
        date: transaction.date,
        payee: transaction.payee,
        Desc: transaction.desc,
        tags: transaction.tags,
        entries: [
          { account: transaction.originAccount, number: transaction.originNumber },
          { account: transaction.targetAccount, number: transaction.targetNumber }
        ]
      }
    })
    this.setState({ loading: true })
    fetch('/api/auth/transaction/batch', { method: 'POST', body: data.filter(d => d) })
      .then(data => {
        const transactions = this.state.transactions.filter(t => {
          const key = t.date + t.payee + t.desc
          return data.indexOf(key) < 0
        }).map(t => {
          t.error = true
          return t
        })
        this.setState({ transactions }, () => { localStorage.setItem('transactions', JSON.stringify(this.state.transactions)) })
      })
      .finally(() => { this.setState({ loading: false }) })
  }

  handleDeleteTransaction = (item) => {
    this.setState({ transactions: this.state.transactions.filter(t => t.id !== item.id) }, () => { localStorage.setItem('transactions', JSON.stringify(this.state.transactions)) })
  }

  handleClearTransaction = () => {
    Modal.confirm({
      title: '确认清除交易列表？',
      icon: <ExclamationCircleOutlined />,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        this.setState({ transactions: [] }, () => {
          localStorage.removeItem('transactions')
        })
      }
    });
  }

  handleOpenDownloadGuide = () => {
    Modal.info({
      title: `如何下载${this.getPayeeName()}账单？`,
      content: (
        <div>
          {
            this.state.payeeType === 'AliPay' &&
            <div>
              <p>1. 登录 <a href="https://consumeprod.alipay.com/record/advanced.htm" target="_blank">支付宝官网</a></p>
              <p>2. 选择 <strong>下载账单：Excel格式</strong></p>
            </div>
          }
          {
            this.state.payeeType === 'WxPay' &&
            <div>
              <p>1. 打开手机微信App</p>
              <p>2. 点击：我>>服务>>钱包>>账单>>常见问题</p>
              <p>3. 点击下载账单，选择用于个人对账</p>
            </div>
          }
        </div>
      ),
      okText: "知道了"
    });
  }

  render() {
    return (
      <div className="import-page page">
        <div>
          <div>
            <Select placeholder="选择导入账单类型" value={this.state.payeeType} style={{ width: 120 }} onChange={this.handleChangePayeeType}>
              <Select.Option key="AliPay" value="AliPay">
                <div>
                  <Avatar size="small" src={AliPayLogo} />
                  &nbsp;
                  支付宝
                </div>
              </Select.Option>
              <Select.Option key="WxPay" value="WxPay">
                <div>
                  <Avatar size="small" src={WxPayLogo} />
                  &nbsp;
                  微信
                </div>
              </Select.Option>
            </Select>
            <Select
              showSearch
              value={this.state.payeeAccount}
              placeholder={`指定${this.getPayeeName()}账户`}
              optionFilterProp="children"
              onChange={this.handleChangePayeeAccount}
              style={{ marginLeft: '10px', width: '300px' }}
            >
              {
                this.state.accounts.map(account => <Select.Option key={account.account} value={account.account}>
                  <AccountIcon style={{ width: '22px', height: '22px', marginRight: '6px' }} iconType={getAccountIcon(account.account)} />
                  {account.account}
                </Select.Option>)
              }
            </Select>
            <a style={{ marginLeft: '12px' }} onClick={this.handleOpenDownloadGuide}>如何下载{this.getPayeeName()}账单？</a>
          </div>
          <Upload
            name='file'
            action={this.getUploadUrl()}
            headers={{ ledgerId: window.localStorage.getItem("ledgerId") }}
            onChange={this.handleChangeFile}
          >
            <Button loading={this.state.loading} icon={<UploadOutlined />} style={{ width: '100%', marginTop: '15px' }} >
              导入{this.getPayeeName()}账单
            </Button>
          </Upload>
          <Button type="primary" disabled={this.state.transactions.length === 0} loading={this.state.loading} onClick={this.handleImport} style={{ width: '100%', marginTop: '15px' }} >
            导入
          </Button>
        </div>
        <div style={{ marginTop: '16px' }}>
          <List
            split={false}
            header={
              <div>
                <stong>{`共 ${this.state.transactions.length} 条交易记录`}</stong>
                &nbsp;&nbsp;
                <Button type='danger' size='small' icon={<CloseCircleOutlined />} onClick={this.handleClearTransaction}>清空</Button>
              </div>
            }
            itemLayout="horizontal"
            dataSource={this.state.transactions}
            rowKey={record => record.id}
            renderItem={item => (
              <List.Item
                key={item.id}
                actions={[
                  item.number ? <div>{AccountAmount(item.account, item.number, item.currencySymbol, item.currency)}</div> : '',
                  <CloseOutlined color='red' onClick={() => { this.handleDeleteTransaction(item) }} />
                ]}
              >
                <List.Item.Meta
                  avatar={<AccountIcon iconType={getAccountIcon(item.account)} />}
                  title={<Input size='small' value={item.desc} onChange={(e) => this.handleChangeDesc(item.id, e.target.value) } style={{ width: '240px', margin: 'auto 10px' }} />}
                  description={
                    <div>
                      {
                        item.tags && <div>{item.tags.map(t => <a style={{ marginRight: '4px' }}>#{t}</a>)}</div>
                      }
                      {item.date}&nbsp;
                      <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>{getAccountName(item.account)}</span>
                      <Input size='small' value={item.payee} onChange={(e) => this.handleChangePayee(item.payee, e.target.value) } style={{ width: '240px', margin: 'auto 10px' }} />
                      {item.error && <Tag color="red">导入异常</Tag>}
                      <div style={{ marginTop: '10px' }}>
                        <Select
                          showSearch
                          value={item.originAccount}
                          size="small"
                          placeholder="选择账户"
                          optionFilterProp="children"
                          onChange={(acc) => { this.handleChangeOriginAccount(acc, item) }}
                          style={{ marginRight: '10px', width: '240px' }}
                        >
                          {
                            this.state.accounts.map(account => <Select.Option key={account.account} value={account.account}>
                              <AccountIcon style={{ width: '18px', height: '18px', marginRight: '6px' }} iconType={getAccountIcon(account.account)} />
                              {account.account}
                            </Select.Option>)
                          }
                        </Select>
                        <DoubleRightOutlined />
                        <Select
                          showSearch
                          value={item.targetAccount}
                          size="small"
                          placeholder="选择账户"
                          optionFilterProp="children"
                          onChange={(acc) => { this.handleChangeTargetAccount(acc, item) }}
                          style={{ marginLeft: '10px', width: '240px' }}
                        >
                          {
                            this.state.accounts.map(account => <Select.Option key={account.account} value={account.account}>
                              <AccountIcon style={{ width: '18px', height: '18px', marginRight: '6px' }} iconType={getAccountIcon(account.account)} />
                              {account.account}
                            </Select.Option>)
                          }
                        </Select>
                      </div>
                      <div style={{ marginTop: '10px' }}>
                        <Select
                          showSearch
                          mode="tags"
                          size="small"
                          placeholder="指定标签"
                          optionFilterProp="children"
                          onChange={(tags) => { this.handleChangeTags(tags, item) }}
                          style={{ width: '514px' }}
                        >
                          {
                            this.state.tags.map(tag => <Select.Option id={tag} value={tag}>
                              {tag}
                            </Select.Option>)
                          }
                        </Select>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      </div>
    )
  }
}

Import.contextType = ThemeContext

export default Page(Import);
