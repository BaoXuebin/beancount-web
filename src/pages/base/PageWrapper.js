import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Config from '../../config/Config';
import ThemeContext from '../../context/ThemeContext';
import './styles/PageWrapper.css';

class PageWrapper extends Component {
  render() {
    let { theme } = this.context;
    return (
      <div className={`${theme}-theme`}>
        <div className="wrapper">
          <header>
            <nav className="navbar">
              <div className="container">
                <div className="navbar-header header-logo" to="/">
                  {/* <img src={LogoImage} width="16" height="16" /> */}
                  <Link to="/">{Config.title}</Link>
                </div>
                <div className="menu navbar-right">
                  <Link to="/account">账户</Link>
                  <Link to="/stats">统计</Link>
                  <Link to="/ledger">退出</Link>
                  {/* <Link to="/about">关于</Link> */}
                  {/* <ThemeToggle /> */}
                  <a href={Config.github}>
                    <img src="https://img.shields.io/github/stars/BaoXuebin/beancount-node-server?style=social" />
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
            </div>
          </footer>
        </div>
      </div>
    )
  }
}

PageWrapper.contextType = ThemeContext;

export default PageWrapper;