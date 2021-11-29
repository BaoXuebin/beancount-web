import { Alert, Button, Form, Input, Switch } from 'antd';
import React, { Component } from 'react';
import { fetch } from '../config/Util';
import ThemeContext from '../context/ThemeContext';
import Page from './base/Page';

const validateMessages = {
  required: '${label} 不能为空！'
};

class Init extends Component {

  formRef = React.createRef();

  state = {
    loading: false,
    checkOK: true,
    showForm: false,
    config: {}
  }

  componentDidMount() {
    this.checkReq()
  }

  checkReq = () => {
    this.setState({ loading: true })
    fetch('/api/check', { method: "POST" })
      .then(res => {
        this.setState({ checkOK: true })
      }).catch(() => {
        this.setState({ checkOK: false })
      }).finally(() => { this.setState({ loading: false }) })
  }

  handleNextStep = () => {
    this.setState({ loading: true })
    fetch('/api/config', { method: "GET" })
      .then(config => {
        this.setState({ config, showForm: true })
      }).finally(() => { this.setState({ loading: false }) })
  }

  render() {
    if (!this.state.checkOK) {
      return (
        <div>
          <Alert
            message="检测失败"
            description="依赖未安装，请先安装 beancount"
            type="error"
            showIcon
          />
        </div>
      )
    } else if (this.state.showForm) {
      return (
        <div>
          <Form
            name="init-form"
            className="page-form"
            size="middle"
            layout="vertical"
            style={{ textAlign: 'left' }}
            ref={this.formRef}
            onFinish={this.handleSyncPriceAccount}
            validateMessages={validateMessages}
          >
            <Form.Item label="账本数据存储位置" name="dataPath" initialValue={this.state.config.dataPath} rules={[{ required: true }]}>
              <Input placeholder="账本数据存储位置" />
            </Form.Item>
            <Form.Item label="账户初始化日期" name="date" initialValue={this.state.config.startDate} rules={[{ required: true }]}>
              <Input type="date" placeholder="时间" />
            </Form.Item>
            <Form.Item label="本币位" name="operatingCurrency" initialValue={this.state.config.operatingCurrency} rules={[{ required: true }]}>
              <Input placeholder="本币位" />
            </Form.Item>
            <Form.Item label="平衡账户" name="openingBalances" initialValue={this.state.config.openingBalances} rules={[{ required: true }]}>
              <Input placeholder="平衡账户" />
            </Form.Item>
            <Form.Item label="修改源文件时是否备份数据" valuePropName="isBak">
              <Switch defaultChecked={this.state.config.isBak} />
            </Form.Item>
            <Form.Item>
              <Button block type="primary" htmlType="submit" loading={this.state.loading} className="submit-button">
                确认
              </Button>
            </Form.Item>
          </Form>
        </div>
      )
    }
    return (
      <div>
        <Alert
          message="检测通过"
          description="beancount已安装，点击下一步来完成初始配置"
          type="success"
          showIcon
        />
        <div style={{ marginTop: '1rem' }}></div>
        <Button type="primary" block onClick={this.handleNextStep}>下一步</Button>
      </div>
    )
  }
}

Init.contextType = ThemeContext

export default Page(Init);