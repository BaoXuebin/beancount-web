import { CloseCircleOutlined, PlusOutlined, TagsOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Divider, Drawer, Form, Input, message, Select, Tag } from 'antd';
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
    templates: [], // 记账模版
    showTag: false,
    tags: []
  }

  componentDidMount() {
    // 延迟一秒请求
    setTimeout(() => {
      this.queryAllValidAccounts()
      this.queryLatest100Payees()
      this.queryTransactionTemplates()
      this.queryAllTags()
    }, 1000)
  }

  queryAllValidAccounts = () => {
    fetch('/api/auth/account/valid')
      .then(accounts => {
        this.setState({ accounts })
      }).catch(console.error)
  }

  queryLatest100Payees = () => {
    fetch('/api/auth/payee')
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
    const accountCommodity = this.getAccountCommodity(account)
    // 账户货币单位不同，需要指定汇率
    entries[idx].commodity = accountCommodity
    if (accountCommodity !== this.props.commodity.val) {
      entries[idx].priceCommodity = this.props.commodity.val
    }
    this.formRef.current.setFieldsValue({ entries })
  }

  getAccountCommodity = (account) => {
    const arr = this.state.accounts.filter(acc => acc.account === account)[0]
    if (arr) {
      return arr.commodity
    }
    return ''
  }

  handleSubmit = (values) => {
    this.setState({ loading: true })
    fetch('/api/auth/entry', { method: 'POST', body: values })
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

  handleDeleteTransactionTemplate = (e, id) => {
    e.preventDefault()
    fetch(`/api/auth/transaction/template?id=${id}`, { method: 'DELETE' })
      .then(res => {
        this.setState({ templates: this.state.templates.filter(t => t.id !== id) })
      })
  }

  handleSetTemplate = (template) => {
    delete template.date;
    template.entries.forEach(e => e.amount = Number(e.amount))
    console.log(template)
    this.formRef.current.setFieldsValue(template)
  }

  handleToggleShowTagInput = () => {
    this.setState({ showTag: !this.state.showTag })
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
        {
        ...this.props
        }
      >
        <Form className="page-form" size="large" ref={this.formRef} onFinish={this.handleSubmit} validateMessages={validateMessages}>
          <div style={{ marginBottom: '1rem' }}>
            {
              this.state.templates.map(t => (
                <a key={t.id} onClick={() => { this.handleSetTemplate(t) }}>
                  <Tag size="middle" color="#1DA57A" closable onClose={(e) => { this.handleDeleteTransactionTemplate(e, t.id) }}>{t.templateName || t.payee || t.id}</Tag>
                </a>
              ))
            }
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
          <div style={{ display: 'flex' }}>
            <Form.Item
              name="desc" rules={[{ required: true, message: '详细描述' }]}
              style={{ flex: 1 }}
            >
              <Input
                placeholder="详细描述，记录细节"
              />
            </Form.Item>
            <TagsOutlined style={{ color: this.state.showTag ? '#1DA57A' : 'gray', width: '40px', lineHeight: '40px', fontSize: '20px' }} onClick={this.handleToggleShowTagInput} />
          </div>
          {
            this.state.showTag &&
            <Form.Item name="tags" rules={[{ required: true }]}>
              <Select mode="tags" style={{ width: '100%' }} placeholder="标签（不支持中文），旅行/计划/学习">
                {
                  this.state.tags.map(tag => <Select.Option key={tag} value={tag}>{tag}</Select.Option>)
                }
              </Select>
            </Form.Item>
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
                      let balanceAmount = null
                      formEntriesValues.entries.filter(a => a && a.amount).forEach(entryValue => {
                        const { amount, commodity, price, priceCommodity } = entryValue
                        if (priceCommodity && priceCommodity !== commodity && amount && price) {
                          // 不同币种需要计算税率
                          balanceAmount = (balanceAmount || Decimal(0)).sub(Decimal(amount).mul(Decimal(price)))
                        } else if (amount) {
                          balanceAmount = (balanceAmount || Decimal(0)).sub(Decimal(amount))
                        }
                      })
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
                            (accountCommodity && accountCommodity !== this.props.commodity.val) &&
                            <Fragment>
                              <Form.Item
                                hidden
                                name={[field.name, 'priceCommodity']}
                                fieldKey={[field.fieldKey, 'priceCommodity']}
                              >
                                <Input />
                              </Form.Item>
                              <Form.Item
                                name={[field.name, 'price']}
                                fieldKey={[field.fieldKey, 'price']}
                              >
                                <Input type="number" addonBefore={`1${accountCommodity}≈`} addonAfter={this.props.commodity.val} placeholder={'汇率（选填）'} onChange={this.handleChangeAmount} />
                              </Form.Item>
                            </Fragment>
                          }
                          <Form.Item
                            hidden
                            name={[field.name, 'commodity']}
                            fieldKey={[field.fieldKey, 'commodity']}
                          >
                            <Input />
                          </Form.Item>
                          <div style={{ display: 'flex' }}>
                            <Form.Item
                              name={[field.name, 'amount']}
                              fieldKey={[field.fieldKey, 'amount']}
                              rules={[{ required: true, message: '金额' }]}
                              style={{ flex: 1 }}
                            >
                              <Input
                                type="number"
                                addonBefore={accountCommodity}
                                placeholder={balanceAmount || "金额"}
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