import React, { Component } from 'react';

import Page from './base/Page';
import ThemeContext from '../context/ThemeContext';

import './styles/About.css'

class About extends Component {

  theme = this.context.theme

  render() {
    if (this.context.theme !== this.theme) {
      this.theme = this.context.theme
    }

    return (
      <div className="about-page">
        关于
      </div>
    );
  }
}

About.contextType = ThemeContext

export default Page(About);
