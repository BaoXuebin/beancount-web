import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Drawer, Form, Input, message, Select, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import Decimal from 'decimal.js';
import React, { Component } from 'react';
import { fetch } from '../config/Util';

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
  }

  componentDidMount() {
    this.queryAllValidAccounts()
    this.queryLatest100Payees()
    this.queryTransactionTemplates()
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

  handleChangeAmount = () => {
    const formEntriesValues = this.formRef.current.getFieldsValue(['entries'])
    let balanceAmount = Decimal(0)
    formEntriesValues.entries.filter(a => a && a.amount).forEach(entryValue => {
      balanceAmount = balanceAmount.sub(Decimal(entryValue.amount))
    })
    this.setState({ balanceAmount: balanceAmount.toString() })
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
    this.formRef.current.setFieldsValue(template)
  }

  render() {
    return (
      <Drawer
        title="记账"
        placement="bottom"
        closable={true}
        height="600"
        className="page-drawer"
        bodyStyle={{ display: 'flex', justifyContent: 'center' }}
        {
        ...this.props
        }
      >
        <Form className="page-form" size="large" ref={this.formRef} onFinish={this.handleSubmit} validateMessages={validateMessages}>
          <Form.Item>
            <div>
              {
                this.state.templates.map(t => (
                  <a key={t.id} onClick={() => { this.handleSetTemplate(t) }}>
                    <Tag size="middle" color="#1DA57A" closable onClose={(e) => { this.handleDeleteTransactionTemplate(e, t.id) }}>{t.templateName || t.payee || t.id}</Tag>
                  </a>
                ))
              }
            </div>
          </Form.Item>
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
          <Form.Item name="desc" rules={[{ required: true }]}>
            <Input placeholder="详细描述，记录细节" />
          </Form.Item>
          <Form.Item label="账目明细">
            <FormList form={this.formRef} name="entries">
              {(fields, { add, remove }) => {
                return (
                  <div>
                    {fields.map(field => (
                      <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="start">
                        <Form.Item
                          name={[field.name, 'account']}
                          fieldKey={[field.fieldKey, 'account']}
                          rules={[{ required: true, message: '必输项' }]}
                        >
                          <Select
                            showSearch
                            style={{ width: 240 }}
                            placeholder="选择账户"
                            optionFilterProp="children"
                          >
                            {
                              this.state.accounts.map(account => <Option value={account}>{account}</Option>)
                            }
                          </Select>
                        </Form.Item>
                        <Form.Item
                          name={[field.name, 'amount']}
                          fieldKey={[field.fieldKey, 'amount']}
                          rules={[{ required: true, message: '必输项' }]}
                        >
                          <Input type="number" placeholder={this.state.balanceAmount || '金额'} onChange={this.handleChangeAmount} />
                        </Form.Item>
                        <MinusCircleOutlined
                          onClick={() => {
                            remove(field.name);
                          }}
                        />
                      </Space>
                    ))}
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
        </Form>
      </Drawer>
    )
  }
}

export default AddTransactionDrawer