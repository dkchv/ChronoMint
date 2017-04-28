import React from 'react'
import { render } from 'react-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import themeDefault from './themeDefault'
import './styles.scss'
import 'font-awesome/css/font-awesome.css'
import 'flexboxgrid/css/flexboxgrid.css'
import router from './router'
import { store } from './redux/configureStore'
import { bootstrap } from './redux/bootstrap/actions'

class App {
  start () {
    store.dispatch(bootstrap())

    render(
      <MuiThemeProvider muiTheme={themeDefault}>
        {router}
      </MuiThemeProvider>,
      document.getElementById('react-root')
    )
  }
}

export default new App()
