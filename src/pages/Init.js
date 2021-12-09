import { Alert, Button, Form, Input, Spin, Switch } from 'antd';
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
    checkStatus: "loading",
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
        this.setState({ checkStatus: "ok" })
      }).catch(() => {
        this.setState({ checkStatus: "error" })
      }).finally(() => { this.setState({ loading: false }) })
  }

  handleNextStep = () => {
    this.setState({ loading: true })
    fetch('/api/config', { method: "GET" })
      .then(config => {
        this.setState({ config, showForm: true })
      }).finally(() => { this.setState({ loading: false }) })
  }

  handleReCheck = () => {
    this.checkReq();
  }

  handleSubmitServerConfig = (values) => {
    this.setState({ loading: true })
    fetch('/api/config', { method: "POST", body: values })
      .then(() => {
        this.props.history.replace('/ledger')
      }).finally(() => { this.setState({ loading: false }) })
  }

  render() {
    if (this.state.checkStatus === "error") {
      return (
        <div>
          <Alert
            message="检测失败"
            description="依赖未安装，请先安装 beancount"
            type="error"
            showIcon
          />
          <div style={{ marginTop: '1rem' }}>
            <Button block type="danger" loading={this.state.loading} onClick={this.handleReCheck}>
              重新检测
            </Button>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <a href="https://www.yuque.com/chuyi-ble7p/beancount-ns/sqwwqa#RwqnF" target="_blank">怎么安装 beancount ?</a>
          </div>
        </div>
      )
    } else if (this.state.checkStatus === "ok") {
      if (this.state.showForm) {
        return (
          <div>
            <Form
              name="init-form"
              className="page-form"
              size="middle"
              layout="vertical"
              style={{ textAlign: 'left' }}
              ref={this.formRef}
              onFinish={this.handleSubmitServerConfig}
              validateMessages={validateMessages}
            >
              <Form.Item label="账本存储位置" name="dataPath" initialValue={this.state.config.dataPath} rules={[{ required: true }]}>
                <Input placeholder="账本存储位置" />
              </Form.Item>
              <Form.Item label="账本开始日期" name="startDate" initialValue={this.state.config.startDate} rules={[{ required: true }]}>
                <Input type="date" placeholder="账本开始日期" />
              </Form.Item>
              <Form.Item label="币种" name="operatingCurrency" initialValue={this.state.config.operatingCurrency} rules={[{ required: true }]}>
                <Input placeholder="币种" />
              </Form.Item>
              <Form.Item label="平衡账户名称设置" name="openingBalances" initialValue={this.state.config.openingBalances} rules={[{ required: true }]}>
                <Input placeholder="平衡账户名称设置" />
              </Form.Item>
              <Form.Item label="修改源文件时是否备份数据" name="isBak" valuePropName="checked" initialValue={this.state.config.isBak}>
                <Switch />
              </Form.Item>
              <Form.Item label="密钥" name="secret" rules={[{ required: true }]}>
                <Input.Password placeholder="密钥" />
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
    return (
      <Spin tip="Loading...">
        <Alert
          message="检测中"
          description="正在检测 beancount 是否已安装"
          type="info"
          showIcon
        />
      </Spin>
    )
  }
}

Init.contextType = ThemeContext

export default Page(Init);