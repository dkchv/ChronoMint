import React from 'react'
import {render} from 'react-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import themeDefault from './themeDefault'
import injectTapEventPlugin from 'react-tap-event-plugin'
import './styles.scss'
import 'font-awesome/css/font-awesome.css'
import 'flexboxgrid/css/flexboxgrid.css'
import ChronoMintDAO from './dao/ChronoMintDAO'

class App {
  start () {
    injectTapEventPlugin()
    return ChronoMintDAO.getAddress().then((r) => {
      if (!r) {
        throw new Error('Couldn\'t connect. Contracts has not been deployed to detected network. Local ethereum node, mist browser or google chrome with metamask plugin should be used')
      }
      window.resolveWeb3.then(() => {
        render(
          <MuiThemeProvider muiTheme={themeDefault}>{require('./router.js')}</MuiThemeProvider>,
          document.getElementById('react-root')
        )
      })
    })
  }
}

export default new App()
