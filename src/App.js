import React, { Component } from 'react';
import { HashRouter as Router } from "react-router-dom";
import './App.less';
import ThemeContext from './context/ThemeContext';
import PageWrapper from './pages/base/PageWrapper';
import RouteMap from './pages/base/RouteMap';



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
          <Router>
            <PageWrapper>
              <RouteMap />
            </PageWrapper>
          </Router>
        </ThemeContext.Provider>
      </div>
    );
  }
}

export default App;
