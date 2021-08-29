import { Button, Form, Input, message } from 'antd';
import React, { Component } from 'react';
import ThemeContext from '../context/ThemeContext';
import Page from './base/Page';

const validateMessages = {
  required: '${label} 不能为空！'
};

class Ledger extends Component {

  theme = this.context.theme
  formRef = React.createRef();

  state = {
    loading: false
  }

  handleCreateLedger = (values) => {
    this.setState({ loading: true })
    fetch(`/api/ledger`, { method: 'POST', headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) })
      .then(res => res.json())
      .then(res => {
        if (res.code === 200) {
          window.localStorage.setItem("ledgerId", res.data)
          this.props.history.replace('/')
        } else if (res.code === 1010) {
          message.error("无效账户")
        } else if (res.code === 1006) {
          message.error("密码错误")
        }
      }).catch((e) => {
        message.error("请求失败")
        console.error(e)
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
            ref={this.formRef}
            onFinish={this.handleCreateLedger}
            validateMessages={validateMessages}
          >
            <Form.Item name="mail" label="用户" rules={[{ required: true }]}>
              <Input placeholder="作为账本的唯一标识，一个用户只允许创建一个账本，推荐使用邮箱" />
            </Form.Item>
            <Form.Item name="secret" label="密码" rules={[{ required: true }]}>
              <Input type="password" placeholder="账本密码" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
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
