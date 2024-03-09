import { CloseCircleOutlined, HourglassOutlined, PlusOutlined, TagsOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Divider, Drawer, Form, Input, message, Select, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import Decimal from 'decimal.js';
import React, { Component, Fragment } from 'react';
import { fetch, getAccountIcon } from '../config/Util';
import AccountIcon from './AccountIcon';

const { Option } = Select;

const validateMessages = {
  required: '${label} 不能为空！'
};

const FormList = ({ form, initialValue, ...props }) => {
  React.useEffect(() => {
    form.current.setFields([
      {
        name: props.name,
        value: initialValue
      }
    ]);
  }, []);
  return <Form.List {...props} />;
};

class AddTransactionDrawer extends Component {

  formRef = React.createRef()

  state = {
    loading: false,
    drawerVisible: false,
    templateLoading: false,
    accounts: [],
    payees: [],
    autoCompletePayees: [],
    templates: this.props.defaultAccounts ? [{ entries: [...this.props.defaultAccounts] }] : [], // 记账模版
    showTag: false,
    tags: [],
    isDivide: false,
  }

  componentDidMount() {
    // 延迟一秒请求
    if (this.props.visible) {
      setTimeout(() => {
        this.queryAllValidAccounts()
        this.queryLatest100Payees()
        this.queryTransactionTemplates()
        this.queryAllTags()
      }, 1000)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.loaded) {
      this.queryAllValidAccounts()
      this.queryLatest100Payees()
      this.queryTransactionTemplates()
      this.queryAllTags()
      this.loaded = true
    }
    if (this.formRef.current
      && nextProps.defaultAccounts && nextProps.defaultAccounts.length > 0
      && (!this.props.defaultAccounts || nextProps.defaultAccounts[0].account !== this.props.defaultAccounts[0].account)) {
      this.formRef.current.setFieldsValue({ entries: [...nextProps.defaultAccounts] })
    }
  }

  queryAllValidAccounts = () => {
    fetch('/api/auth/account/valid')
      .then(accounts => {
        this.setState({ accounts })
      }).catch(console.error)
  }

  queryLatest100Payees = () => {
    fetch('/api/auth/transaction/payee')
      .then(payees => {
        this.setState({ payees, autoCompletePayees: payees.slice(0, Math.max(payees.length, 10)) })
      }).catch(console.error)
  }

  queryTransactionTemplates = () => {
    fetch('/api/auth/transaction/template')
      .then(templates => {
        this.setState({ templates })
      }).catch(console.error)
  }

  queryAllTags = () => {
    fetch('/api/auth/tags')
      .then(tags => {
        this.setState({ tags })
      }).catch(console.error)
  }

  handleSearchPayee = (value) => {
    const autoCompletePayees = this.state.payees.filter(p => p.indexOf(value) >= 0)
    this.setState({ autoCompletePayees })
  };

  handleSaveTransactionTemplate = () => {
    const values = this.formRef.current.getFieldsValue();
    if (values && values.entries && values.entries.length > 0) {
      if (this.state.accounts && this.state.accounts.length > 0) {
        values.entries.forEach(e => {
          const accs = this.state.accounts.filter(a => a.account === e.account)
          if (accs && accs.length === 1) {
            e = accs[0]
            e.number = e.number || ''
          }
        })
      }
    }
    const { payee, desc } = values
    values.templateName = `${payee || ''}-${desc || ''}`
    this.setState({ templateLoading: true })
    fetch('/api/auth/transaction/template', { method: 'POST', body: values })
      .then(res => {
        message.success('保存模版成功')
        this.queryTransactionTemplates()
      }).finally(() => {
        this.setState({ templateLoading: false, drawerVisible: false })
      })
  }

  handleChangeAmount = (balanceAmount) => {
    this.setState({ balanceAmount })
  }

  handleChangeAccount = (account, idx) => {
    const entries = this.formRef.current.getFieldsValue().entries;
    const acc = this.getAccount(account)
    if (acc) {
      // 账户货币单位不同，需要指定汇率
      entries[idx] = acc
      if (acc.currency !== this.props.commodity.currency) {
        entries[idx].priceCommodity = this.props.commodity.currency
      }
    }
    this.formRef.current.setFieldsValue({ entries })
  }

  getAccount = (account) => {
    const arr = this.state.accounts.filter(acc => acc.account === account)[0]
    return arr
  }

  getAccountCommodity = (account) => {
    const arr = this.state.accounts.filter(acc => acc.account === account)[0]
    if (arr) {
      return arr.currency
    }
    return ''
  }

  handleSubmit = (values) => {
    const { divideCount, divideCycle } = values
    if (divideCount && divideCount > 0) {
      const date = dayjs(values.date)
      values.divideDateList = []
      for (let i = 0; i < divideCount; i++) {
        if (divideCycle === 'day') {
          values.divideDateList.push(date.add(i, 'days').format('YYYY-MM-DD'))
        } else if (divideCycle === 'week') {
          values.divideDateList.push(date.add(i, 'weeks').format('YYYY-MM-DD'))
        } else if (divideCycle === 'month') {
          values.divideDateList.push(date.add(i, 'months').format('YYYY-MM-DD'))
        }
      }
      delete values.divideCount
      delete values.divideCycle
    }

    if (!values.entries || !values.entries.length) {
      message.error("账目不能为空")
      return
    }

    let nullCount = 0;
    let balanceEntry;
    for (let entry of values.entries) {
      // if (entry && !entry.price && entry.price) {
      //   entry.price = entry.price
      // }
      if (!entry || !entry.number) {
        balanceEntry = entry
        nullCount++;
      }
    }
    if (nullCount == 1) {
      balanceEntry.number = String(this.computeBalanceAmount(values, this.props.commodity.currency))
    } else if (nullCount > 1) {
      message.error("账目金额项不能为空")
      return
    }

    this.setState({ loading: true })
    fetch('/api/auth/transaction', { method: 'POST', body: values })
      .then(res => {
        message.success('添加成功')
        this.formRef.current.resetFields()
        this.formRef.current.setFieldsValue({ date: dayjs().format('YYYY-MM-DD') })
        const { payees } = this.state
        if (values.payee) {
          const newPayees = Array.from(new Set([...payees, values.payee]))
          const autoCompletePayees = newPayees.slice(0, Math.max(newPayees.length, 10))
          this.setState({ autoCompletePayees })
        } else {
          this.setState({ autoCompletePayees: payees.slice(0, Math.max(payees.length, 10)) })
        }
        if (this.props.onSubmit) {
          this.props.onSubmit(values)
        }
      }).finally(() => { this.setState({ loading: false }) })
  }

  computeBalanceAmount(values, ledgerCurrency) {
    let balanceAmount = Decimal(0);
    const currentAccounts = values.entries.filter(a => a && a.currency !== ledgerCurrency && (a.number || a.price))
    const commonAccounts = values.entries.filter(a => a && a.currency === ledgerCurrency && a.number)
    commonAccounts.forEach(entryValue => {
      const { number } = entryValue
      balanceAmount = (balanceAmount || Decimal(0)).sub(Decimal(number))
    })
    currentAccounts.forEach(entryValue => {
      const { number, currency, price } = entryValue
      if (currency && ledgerCurrency !== currency && number && price) {
        balanceAmount = (balanceAmount || Decimal(0)).sub(Decimal(number).mul(Decimal(price)))
      } else if (number) {
        balanceAmount = (balanceAmount || Decimal(0)).sub(Decimal(number))
      } else if (price) {
        balanceAmount = (balanceAmount || Decimal(0)).div(Decimal(price))
      }
    })
    return balanceAmount.toNumber()
  }

  handleDeleteTransactionTemplate = (e, id) => {
    e.preventDefault()
    fetch(`/api/auth/transaction/template?id=${id}`, { method: 'DELETE' })
      .then(res => {
        this.setState({ templates: this.state.templates.filter(t => t.id !== id) })
      })
  }

  handleSetTemplate = (template) => {
    delete template.date;
    if (this.state.accounts && this.state.accounts.length > 0) {
      const entries = template.entries.map(e => {
        const accs = this.state.accounts.filter(a => a.account === e.account)
        if (accs && accs.length === 1) {
          return {...accs[0], number: e.number}
        }
        return e
      })
      template.entries = entries
    }
    this.formRef.current.setFieldsValue(template)
  }

  handleToggleShowTagInput = () => {
    this.setState({ showTag: !this.state.showTag })
  }

  handleToggleShowDivideInput = () => {
    this.setState({ isDivide: !this.state.isDivide })
  }

  render() {
    return (
      <Drawer
        title="记账"
        placement="bottom"
        closable={true}
        height="90vh"
        className="page-drawer"
        bodyStyle={{ display: 'flex', justifyContent: 'center' }}
        forceRender
        {
        ...this.props
        }
      >
        <Form className="page-form" size="large" ref={this.formRef} onFinish={this.handleSubmit} validateMessages={validateMessages}>
          <div style={{ marginBottom: '1rem' }}>
            <Space wrap>
              {
                this.state.templates.map(t => (
                  <a key={t.id} onClick={() => { this.handleSetTemplate(t) }}>
                    <Tag size="middle" color="#1DA57A" closable onClose={(e) => { this.handleDeleteTransactionTemplate(e, t.id) }}>{t.templateName || t.payee || t.id}</Tag>
                  </a>
                ))
              }
            </Space>
          </div>
          <Form.Item name="date" initialValue={dayjs().format('YYYY-MM-DD')} rules={[{ required: true }]}>
            <Input type="date" placeholder="交易时间" />
          </Form.Item>
          <Form.Item name="payee">
            <AutoComplete
              onSearch={this.handleSearchPayee}
              placeholder="收款人/商户/收入来源渠道"
            >
              {this.state.autoCompletePayees.map((payee) => (
                <AutoComplete.Option key={payee} value={payee}>
                  {payee}
                </AutoComplete.Option>
              ))}
            </AutoComplete>
          </Form.Item>
          <Form.Item
            name="desc" rules={[{ required: true, message: '详细描述' }]}
            style={{ flex: 1 }}
          >
            <Input
              placeholder="详细描述，记录细节"
            />
          </Form.Item>
          <div style={{ display: 'flex' }}>
            <TagsOutlined style={{ color: this.state.showTag ? '#1DA57A' : 'gray', width: '40px', lineHeight: '40px', fontSize: '20px' }} onClick={this.handleToggleShowTagInput} />
            <HourglassOutlined style={{ color: this.state.isDivide ? '#1DA57A' : 'gray', width: '40px', lineHeight: '40px', fontSize: '20px' }} onClick={this.handleToggleShowDivideInput} />
          </div>
          {
            this.state.showTag &&
            <Fragment>
              <Divider plain>标签</Divider>
              <Form.Item name="tags" rules={[{ required: true }]}>
                <Select mode="tags" style={{ width: '100%' }} placeholder="标签（不支持中文），旅行/计划/学习">
                  {
                    this.state.tags.map(tag => <Select.Option key={tag} value={tag}>{tag}</Select.Option>)
                  }
                </Select>
              </Form.Item>
            </Fragment>
          }
          {
            this.state.isDivide &&
            <Fragment>
              <Divider plain>预支分期</Divider>
              <div style={{ display: 'flex' }}>
                <Form.Item name="divideCount" rules={[{ required: true, message: "分期数" }]} style={{ flex: '2', marginRight: '12px' }}>
                  <Input type="number" step="1" addonAfter="期" />
                </Form.Item>
                <Form.Item name="divideCycle" initialValue={"month"} style={{ flex: '1' }}>
                  <Select style={{ width: '100%' }}>
                    <Select.Option value="day">间隔一天</Select.Option>
                    <Select.Option value="week">间隔一周</Select.Option>
                    <Select.Option value="month">间隔一月</Select.Option>
                  </Select>
                </Form.Item>
              </div>
            </Fragment>
          }
          <Divider plain>账户明细</Divider>
          <Form.Item>
            <FormList form={this.formRef} name="entries">
              {(fields, { add, remove }) => {
                return (
                  <div>
                    {fields.map(field => {
                      let accountCommodity = null
                      let selectAccount = this.formRef.current.getFieldsValue().entries[field.name];
                      if (selectAccount) {
                        accountCommodity = this.getAccountCommodity(selectAccount.account)
                      }
                      const formEntriesValues = this.formRef.current.getFieldsValue(['entries'])
                      const balanceAmount = this.computeBalanceAmount(formEntriesValues, this.props.commodity.currency)
                      return (
                        <div key={field.name} style={{ display: 'flex', flexDirection: 'column', marginBottom: 8 }}>
                          <Form.Item
                            name={[field.name, 'account']}
                            fieldKey={[field.fieldKey, 'account']}
                            rules={[{ required: true, message: '必输项' }]}
                          >
                            <Select
                              showSearch
                              placeholder="选择账户"
                              optionFilterProp="children"
                              onChange={(acc) => { this.handleChangeAccount(acc, field.name) }}
                              style={{ marginRight: '10px' }}
                            >
                              {
                                this.state.accounts.map(account => <Option value={account.account}>
                                  <AccountIcon style={{ width: '22px', height: '22px', marginRight: '6px' }} iconType={getAccountIcon(account.account)} />
                                  {account.account}
                                </Option>)
                              }
                            </Select>
                          </Form.Item>
                          {
                            (accountCommodity && accountCommodity !== this.props.commodity.currency && (!selectAccount.isAnotherCurrency || !selectAccount.priceDate)) &&
                            <Fragment>
                              <Form.Item
                                hidden
                                name={[field.name, 'priceCurrency']}
                                fieldKey={[field.fieldKey, 'priceCurrency']}
                              >
                                <Input />
                              </Form.Item>
                              <Form.Item
                                name={[field.name, 'price']}
                                fieldKey={[field.fieldKey, 'price']}
                              >
                                <Input type="number" step="0.01" addonBefore={`1 ${accountCommodity}≈`} addonAfter={this.props.commodity.currency} placeholder={'汇率/净值（选填）'} onChange={this.handleChangeAmount} />
                              </Form.Item>
                            </Fragment>
                          }
                          <Form.Item
                            hidden
                            name={[field.name, 'currency']}
                            fieldKey={[field.fieldKey, 'currency']}
                          >
                            <Input />
                          </Form.Item>
                          <div style={{ display: 'flex' }}>
                            <Form.Item
                              name={[field.name, 'number']}
                              fieldKey={[field.fieldKey, 'number']}
                              style={{ flex: 1 }}
                            >
                              <Input
                                type="number"
                                step="0.01"
                                addonBefore={(selectAccount && selectAccount.price) ? `${accountCommodity}≈${selectAccount.price}${this.props.commodity.currency}` : accountCommodity}
                                placeholder={balanceAmount ? `${balanceAmount}(按Enter键可快速保存)` : `${this.state.isDivide ? '预支分期总' : ''}金额`}
                                onChange={this.handleChangeAmount}
                                style={{ flex: 1 }}
                              />
                            </Form.Item>
                            <CloseCircleOutlined style={{ width: '40px', lineHeight: '40px', fontSize: '20px' }} onClick={() => { remove(field.name); }} />
                          </div>
                          <Divider />
                        </div>
                      )
                    })}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => {
                          add();
                        }}
                        block
                      >
                        <PlusOutlined /> 添加账目
                      </Button>
                    </Form.Item>
                  </div>
                );
              }}
            </FormList>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={this.state.loading} className="submit-button">
              保存
            </Button>
            &nbsp;&nbsp;
            <Button htmlType="button" disabled={this.state.loading} loading={this.state.templateLoading} onClick={this.handleSaveTransactionTemplate} block>
              保存为模版
            </Button>
          </Form.Item>
          <Form.Item></Form.Item>
        </Form>
      </Drawer>
    )
  }
}

export default AddTransactionDrawer