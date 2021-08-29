import React, { Fragment } from 'react'

import ThemeContext from '../context/ThemeContext'

import './styles/ThemeToggle.css'

const ThemeToggle = () => (
  <ThemeContext.Consumer>
    {
      ({ theme, toggleTheme }) =>
        <Fragment>
          <input id="switch_default" type="checkbox" defaultChecked={theme === 'dark'} className="switch_default" onChange={(e) => {
            e.persist()
            const theme = e.target.checked ? 'dark' : 'light'
            localStorage.setItem('theme', theme)
            toggleTheme(theme)
          }}></input>
          <label htmlFor="switch_default" className="toggleBtn"></label>
        </Fragment>
    }
  </ThemeContext.Consumer>
)

export default ThemeToggle