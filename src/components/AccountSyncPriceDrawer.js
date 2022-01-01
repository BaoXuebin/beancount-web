import { Button, Drawer, Form, Input } from 'antd';
import dayjs from 'dayjs';
import React, { Component } from 'react';
import { fetch } from '../config/Util';
const validateMessages = {
  required: '${label} 不能为空！'
};

class AccountSyncPriceDrawer extends Component {

  formRef = React.createRef();

  state = {
    transactions: [],
    loading: false,
  }

  handleSyncPriceAccount = (formValue) => {
    const editAccount = this.props.account;
    console.log(editAccount)
    if (!editAccount) return;
    this.setState({ loading: true })
    fetch('/api/auth/commodity/price', { method: 'POST', body: { commodity: editAccount.currency, ...formValue } })
      .then(() => {
        this.props.onClose();
        this.formRef.current.resetFields();
      }).catch(console.error).finally(() => { this.setState({ loading: false }) })
  }

  render() {
    const editAccount = this.props.account
    const { loading } = this.state
    return (
      <Drawer
        title={<div>{editAccount.account}</div>}
        placement="bottom"
        closable={true}
        className="page-drawer"
        height="60vh"
        bodyStyle={{ display: 'flex', justifyContent: 'center' }}
        {
        ...this.props
        }
      >
        <div className="page-form">
          <Form
            name="sync-price-form"
            className="page-form"
            size="large"
            style={{ textAlign: 'left' }}
            ref={this.formRef}
            onFinish={this.handleSyncPriceAccount}
            validateMessages={validateMessages}
          >
            <Form.Item name="date" initialValue={dayjs().format('YYYY-MM-DD')} rules={[{ required: true }]}>
              <Input type="date" placeholder="时间" />
            </Form.Item>
            <Form.Item
              name="price"
              rules={[{ required: true }]}
            >
              <Input type="number" step="0.01" addonBefore={`1 ${editAccount.currency}≈`} addonAfter={editAccount.marketCurrency} placeholder="净值/汇率" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} className="submit-button">
                确认
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Drawer>
    )
  }
}


export default AccountSyncPriceDrawer