import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, message, Modal, Space } from 'antd';
import React, { Component } from 'react';
import { fetch } from '../config/Util';
import ThemeContext from '../context/ThemeContext';
import Page from './base/Page';


class Setting extends Component {


  ledgerTitle = localStorage.getItem('ledgerTitle') || '账本'
  state = {
    loading: false
  }

  handleOpenDeleteModal = () => {
    Modal.confirm({
      title: `确认删除${this.ledgerTitle}？`,
      icon: <ExclamationCircleOutlined />,
      content: '删除后将不能恢复',
      okText: '删除',
      onOk: this.handleDelete,
      okButtonProps: { danger: true },
      cancelText: '取消',
    });
  }

  handleDelete = () => {
    this.setState({ loading: true })
    fetch('/api/auth/ledger', { method: 'DELETE' })
      .then(() => {
        // 清除本地缓存
        localStorage.clear()
        message.success(`${this.ledgerTitle}已删除`);
        this.props.history.replace('/ledger')
      })
      .finally(() => { this.setState({ loading: false }) })
  }

  render() {
    if (this.context.theme !== this.theme) {
      this.theme = this.context.theme
    }

    return (
      <div className="setting-page">
        <Space direction='vertical' size="middle" style={{ display: 'flex' }}>
          <Button block danger loading={this.state.loading} onClick={this.handleOpenDeleteModal}>删除账本</Button>
        </Space>
      </div>
    )
  }
}

Setting.contextType = ThemeContext

export default Page(Setting);
