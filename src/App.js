import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import React, { Component } from 'react';
import { HashRouter as Router } from "react-router-dom";
import './App.less';
import ThemeContext from './context/ThemeContext';
import PageWrapper from './pages/base/PageWrapper';
import RouteMap from './pages/base/RouteMap';

moment.locale('zh-cn');

class App extends Component {

  state = {
    theme: localStorage.getItem('theme') || 'light'
  }

  toggleTheme = (theme) => {
    this.setState({ theme })
  };

  render() {
    return (
      <div className="App">
        <ThemeContext.Provider value={{ theme: this.state.theme, toggleTheme: this.toggleTheme }}>
          <ConfigProvider locale={zhCN}>
            <Router>
              <PageWrapper>
                <RouteMap />
              </PageWrapper>
            </Router>
          </ConfigProvider>
        </ThemeContext.Provider>
      </div>
    );
  }
}

export default App;
