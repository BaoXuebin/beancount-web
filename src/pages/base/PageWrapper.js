import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Config from '../../config/Config';
import { fetch } from '../../config/Util';
import ThemeContext from '../../context/ThemeContext';
import './styles/PageWrapper.css';

class PageWrapper extends Component {

  state = {
    version: ''
  }

  componentDidMount() {
    fetch('/api/version').then((version) => {
      localStorage.setItem('version', version)
      this.setState({ version })
    })
  }

  handleOut = () => {
    localStorage.clear()
    window.location.href = "/web/#/ledger"
  }

  render() {
    let { theme } = this.context;
    const title = window.localStorage.getItem('ledgerTitle') || Config.title
    return (
      <div className={`${theme}-theme`}>
        <div className="wrapper">
          <header>
            <nav className="navbar">
              <div className="container">
                <div className="navbar-header header-logo" to="/">
                  {/* <img src={LogoImage} width="16" height="16" /> */}
                  <Link to="/">{title}</Link>
                </div>
                <div className="menu navbar-right">
                  <Link to="/account">账户</Link>
                  <Link to="/stats">统计</Link>
                  <a onClick={this.handleOut}>退出</a>
                  {/* <Link to="/about">关于</Link> */}
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
              © 2021&nbsp;&nbsp;
              {this.state.version}&nbsp;&nbsp;
              <a href={Config.guide} target="_blank">使用文档</a>&nbsp;&nbsp;
              <a href={Config.issue} target="_blank">反馈BUG</a>&nbsp;&nbsp;
            </div>
          </footer>
        </div>
      </div>
    )
  }
}

PageWrapper.contextType = ThemeContext;

export default PageWrapper;