import { CloseOutlined, DoubleRightOutlined, UploadOutlined } from '@ant-design/icons';
import { Avatar, Button, List, message, Select, Tag, Upload } from 'antd';
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
          if (d.account.indexOf('Income') && this.state.payeeAccount) {
            d.originAccount = this.state.payeeAccount
            d.originNumber = -1 * Number(d.number)
            d.number = Number(d.number)
            d.targetNumber = d.number
          }
          // 支出
          if (d.account.indexOf('Expenses') && this.state.payeeAccount) {
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
      if ((transaction.payee === item.payee || transaction.desc === item.desc) && !transaction.tags) {
        transaction.tags = tags
      }
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

  render() {
    return (
      <div className="import-page page">
        <div>
          <div>
            <Select placeholder="选择导入账单类型" value={this.state.payeeType} style={{ width: 160 }} onChange={this.handleChangePayeeType}>
              <Select.Option value="AliPay">
                <div>
                  <Avatar size="small" src={AliPayLogo} />
                  &nbsp;
                  支付宝账单
                </div>
              </Select.Option>
              <Select.Option value="WxPay">
                <div>
                  <Avatar size="small" src={WxPayLogo} />
                  &nbsp;
                  微信账单
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
                this.state.accounts.map(account => <Select.Option value={account.account}>
                  <AccountIcon style={{ width: '22px', height: '22px', marginRight: '6px' }} iconType={getAccountIcon(account.account)} />
                  {account.account}
                </Select.Option>)
              }
            </Select>
          </div>
          <Upload
            name='file'
            action={this.getUploadUrl()}
            headers={{ ledgerId: window.localStorage.getItem("ledgerId") }}
            onChange={this.handleChangeFile}
          >
            <Button loading={this.state.loading} icon={<UploadOutlined />} style={{ width: '100%', marginTop: '15px' }} >
              {
                this.state.payeeType === 'AliPay' && '导入支付宝账单(CSV文件)'
              }
              {
                this.state.payeeType === 'WxPay' && '导入微信账单'
              }
            </Button>
          </Upload>
          <Button type="primary" disabled={this.state.transactions.length === 0} loading={this.state.loading} onClick={this.handleImport} style={{ width: '100%', marginTop: '15px' }} >
            导入
          </Button>
        </div>
        <div style={{ marginTop: '16px' }}>
          <List
            split={false}
            header={`共 ${this.state.transactions.length} 条交易记录`}
            itemLayout="horizontal"
            dataSource={this.state.transactions}
            renderItem={item => (
              <List.Item
                actions={[
                  item.number ? <div>{AccountAmount(item.account, item.number, item.currencySymbol, item.currency)}</div> : '',
                  <CloseOutlined color='red' onClick={() => { this.handleDeleteTransaction(item) }} />
                ]}
              >
                <List.Item.Meta
                  avatar={<AccountIcon iconType={getAccountIcon(item.account)} />}
                  title={item.desc}
                  description={
                    <div>
                      {
                        item.tags && <div>{item.tags.map(t => <a style={{ marginRight: '4px' }}>#{t}</a>)}</div>
                      }
                      {item.date}&nbsp;
                      <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>{getAccountName(item.account)}</span>
                      &nbsp;{item.payee}&nbsp;
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
                            this.state.accounts.map(account => <Select.Option value={account.account}>
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
                            this.state.accounts.map(account => <Select.Option value={account.account}>
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
                            this.state.tags.map(tag => <Select.Option value={tag}>
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
