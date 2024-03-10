import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Config from '../../config/Config';
import { fetch } from '../../config/Util';
import ThemeContext from '../../context/ThemeContext';
import './styles/PageWrapper.css';
import { WarningOutlined } from '@ant-design/icons';
import { Modal } from 'antd';

class PageWrapper extends Component {

  state = {
    version: '',
    isModalVisible: false,
    error: [],
  }

  componentDidMount() {
    fetch('/api/version').then((version) => {
      localStorage.setItem('version', version)
      this.setState({ version })
    })
    fetch('/api/auth/ledger/check').then((data) => {
      this.setState({ error: data || [] })
    })
  }

  handleOut = () => {
    localStorage.clear()
    this.setState({ error: [] })
    window.location.href = "/web/#/ledger"
  }

  openErrorModal = () => {
    this.setState({ isModalVisible: true })
  }

  closeErrorModal = () => {
    this.setState({ isModalVisible: false })
  }

  render() {
    let { theme } = this.context;
    const title = window.localStorage.getItem('ledgerTitle') || Config.title
    return (
      <div className={`${theme}-theme page-wrapper`}>
        <div className="wrapper">
          <header>
            <nav className="navbar">
              <div className="container">
                <div className="navbar-header header-logo" to="/">
                  {/* <img src={LogoImage} width="16" height="16" /> */}
                  <Link to="/">{title}</Link>
                </div>
                <div className="menu navbar-right">
                  {
                    this.state.error.length > 0 && <a><WarningOutlined style={{ color: 'red' }} onClick={this.openErrorModal} /></a>
                  }
                  <Link to="/account">账户</Link>
                  <Link to="/stats">统计</Link>
                  <Link to="/events">事件</Link>
                  <Link to="/setting">设置</Link>
                  {/* <ThemeToggle /> */}
                  <a href={Config.github}>
                    <img src="https://img.shields.io/github/stars/BaoXuebin/beancount-gs?style=social" />
                  </a>
                </div>
              </div>
            </nav>
          </header>
          <div className="main">
            <div className="main-wrap">
              {this.props.children}
            </div>
          </div>
          <footer className="footer">
            <div className="copyright">
              © {new Date().getFullYear()}&nbsp;&nbsp;
              <a href={`https://github.com/BaoXuebin/beancount-gs/releases/tag/${this.state.version}`} target="_blank">{this.state.version}</a>&nbsp;&nbsp;
              <a href={Config.license} target="_blank">MIT</a>&nbsp;&nbsp;
              <a href={Config.guide} target="_blank">使用文档</a>&nbsp;&nbsp;
              <a href={Config.changelog} target="_blank">更新日志</a>&nbsp;&nbsp;
              <a href={Config.issue} target="_blank">反馈BUG</a>&nbsp;&nbsp;
              <a onClick={this.handleOut}>退出</a>
            </div>
          </footer>
          <Modal width={860} open={this.state.isModalVisible} onOk={this.closeErrorModal} onCancel={this.closeErrorModal}>
            <pre>
              {this.state.error.map(e => <p key={e}>{e}</p>)}
            </pre>
          </Modal>
        </div>
      </div>
    )
  }
}

PageWrapper.contextType = ThemeContext;

export default PageWrapper;