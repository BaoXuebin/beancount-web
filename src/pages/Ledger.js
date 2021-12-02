import { Button, Form, Input, Switch } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import React, { Component, Fragment } from 'react';
import ThemeContext from '../context/ThemeContext';
import Page from './base/Page';
import { fetch } from '../config/Util';
import Config from '../config/Config';

const validateMessages = {
  required: '${label} 不能为空！'
};

class Ledger extends Component {

  theme = this.context.theme
  formRef = React.createRef();

  state = {
    loading: false,
    expand: false,
    config: {}
  }

  componentDidMount() {
    this.handleQueryServerConfig()
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

  render() {
    if (this.context.theme !== this.theme) {
      this.theme = this.context.theme
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
            <Form.Item name="ledgerName" label="账本名称" rules={[{ required: true }]}>
              <Input placeholder="你可以创建多个的账本，账本之间的数据无法互通" />
            </Form.Item>
            <Form.Item name="secret" label="账本密码">
              <Input type="password" placeholder="账本密码" />
            </Form.Item>
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
                <Form.Item label="初始化日期" name="startDate" initialValue={this.state.config.startDate} rules={[{ required: true }]}>
                  <Input type="date" placeholder="初始化日期" />
                </Form.Item>
                <Form.Item label="本币位" name="operatingCurrency" initialValue={this.state.config.operatingCurrency} rules={[{ required: true }]}>
                  <Input placeholder="本币位" />
                </Form.Item>
                <Form.Item label="平衡账户" name="openingBalances" initialValue={this.state.config.openingBalances} rules={[{ required: true }]}>
                  <Input placeholder="平衡账户" />
                </Form.Item>
                <Form.Item label="修改源文件时是否备份数据" name="isBak" valuePropName="checked" initialValue={this.state.config.isBak}>
                  <Switch />
                </Form.Item>
              </Fragment>
            }
            <Form.Item>
              <Button type="primary" block htmlType="submit">
                创建/进入个人账本
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    );
  }
}

Ledger.contextType = ThemeContext

export default Page(Ledger);
