import { BookOutlined, CalendarOutlined, DownOutlined, ExclamationCircleOutlined, PlusOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Modal, Switch } from 'antd';
import React, { Component, Fragment } from 'react';
import { fetch } from '../config/Util';
import ThemeContext from '../context/ThemeContext';
import Page from './base/Page';

const validateMessages = {
  required: '${label} 不能为空！'
};

class Ledger extends Component {

  theme = this.context.theme
  formRef = React.createRef();

  state = {
    loading: false,
    expand: false,
    newLedger: false,
    selectedLedger: {},
    ledgers: [],
    config: {}
  }

  componentDidMount() {
    this.handleQueryServerConfig()
    this.handleQueryLedgerList()
  }

  handleQueryLedgerList = () => {
    this.setState({ loading: true })
    fetch('/api/ledger', { method: "GET" })
      .then(ledgers => {
        this.setState({ ledgers, newLedger: ledgers.length === 0 })
      }).finally(() => { this.setState({ loading: false }) })
  }

  handleQueryServerConfig = () => {
    this.setState({ loading: true })
    fetch('/api/config', { method: "GET" })
      .then(config => {
        if (!config.dataPath) {
          window.location.href = '/web/#/init';
          return
        }
        this.setState({ config })
      }).finally(() => { this.setState({ loading: false }) })
  }

  handleCreateLedger = (values) => {
    // 密码为空时进行安全提醒
    if (!values.secret && this.state.newLedger) {
      Modal.confirm({
        title: '提醒',
        icon: <ExclamationCircleOutlined />,
        content: '未设置密码，这可能会导致数据不安全',
        okText: '确认不设置密码',
        cancelText: '取消',
        onOk: () => this.handleReqCreateLedger(values)
      });
      return;
    }
    this.handleReqCreateLedger(values)
  }

  handleReqCreateLedger = (values) => {
    this.setState({ loading: true })
    fetch('/api/ledger', { method: 'POST', headers: { "Content-Type": "application/json" }, body: values })
      .then(res => {
        window.localStorage.setItem("ledgerId", res.ledgerId)
        if (res.title) {
          window.localStorage.setItem("ledgerTitle", res.title)
        }
        if (res.currency) {
          window.localStorage.setItem("ledgerCurrency", JSON.stringify({ currency: res.currency, symbol: res.currencySymbol }))
        }
        this.props.history.replace('/')
      }).finally(() => { this.setState({ loading: false }) })
  }

  handleSelectLedger = (selectedLedger) => {
    this.setState({ selectedLedger })
  }

  render() {
    if (this.context.theme !== this.theme) {
      this.theme = this.context.theme
    }

    if (!this.state.selectedLedger.mail && !this.state.newLedger) {
      return (
        <div className="ledger-page">
          <div>
            <Button block type="dashed" icon={<PlusOutlined />} onClick={() => { this.setState({ newLedger: true }) }}>
              创建新账本
            </Button>
          </div>
          {
            this.state.ledgers.map(ledger => (
              <Card style={{ width: '100%', marginTop: 16, cursor: 'pointer' }} loading={this.state.loading}>
                <Card.Meta
                  onClick={() => { this.handleSelectLedger(ledger); }}
                  // avatar={
                  //   <Avatar style={{ color: 'white', backgroundColor: '#1DA57A' }}>{ledger.mail.split("")[0]}</Avatar>
                  // }
                  title={ledger.title}
                  description={
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <span><BookOutlined />&nbsp;{ledger.mail}</span>&nbsp;&nbsp;
                        {
                          ledger.createDate && <span><CalendarOutlined />&nbsp;{ledger.createDate}</span>
                        }
                      </div>
                      <div>
                        <span>{ledger.operatingCurrency}</span>
                      </div>
                    </div>
                  }
                />
              </Card>
            ))
          }
        </div>
      )
    }

    return (
      <div className="ledger-page">
        <div>
          <Form
            name="add-account-form"
            size="middle"
            layout="vertical"
            ref={this.formRef}
            onFinish={this.handleCreateLedger}
            validateMessages={validateMessages}
            loading={this.state.loading}
          >
            <Form.Item name="ledgerName" label="账本名称" initialValue={this.state.selectedLedger.mail || ""} rules={[{ required: true }]}>
              <Input placeholder="你可以创建多个的账本，账本之间的数据无法互通" />
            </Form.Item>
            <Form.Item label="修改源文件时是否备份数据" name="isBak" valuePropName="checked" rules={[{ required: true }]} initialValue={this.state.config.isBak}>
              <Switch />
            </Form.Item>
            <Form.Item name="secret" label="账本密码">
              <Input type="password" placeholder="账本密码" />
            </Form.Item>
            {
              !this.state.selectedLedger.mail &&
              <Fragment>
                <div style={{ fontSize: 14, marginBottom: '2rem', textAlign: 'center' }}>
                  <a
                    onClick={() => {
                      this.setState({ expand: !this.state.expand })
                    }}
                  >
                    {this.state.expand ? <UpOutlined /> : <DownOutlined />} 更多账本设置
                  </a>
                </div>
                {
                  this.state.expand &&
                  <Fragment>
                    <Form.Item label="账本开始日期" name="startDate" initialValue={this.state.config.startDate} rules={[{ required: true }]}>
                      <Input type="date" placeholder="账本开始日期" />
                    </Form.Item>
                    <Form.Item label="币种" name="operatingCurrency" initialValue={this.state.config.operatingCurrency} rules={[{ required: true }]}>
                      <Input placeholder="币种" />
                    </Form.Item>
                    <Form.Item label="平衡账户名称设置" name="openingBalances" initialValue={this.state.config.openingBalances} rules={[{ required: true }]}>
                      <Input placeholder="平衡账户名称设置" />
                    </Form.Item>
                  </Fragment>
                }
              </Fragment>
            }
            <Form.Item>
              <Button type="primary" block htmlType="submit">
                创建/进入个人账本
              </Button>
            </Form.Item>
            {
              this.state.ledgers.length > 0 &&
              <Form.Item>
                <Button block onClick={() => { this.setState({ selectedLedger: {}, newLedger: false }) }}>
                  返回账本
                </Button>
              </Form.Item>
            }
          </Form>
        </div>
      </div>
    );
  }
}

Ledger.contextType = ThemeContext

export default Page(Ledger);
