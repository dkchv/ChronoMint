import { ModalStack, Snackbar } from 'components'
import { MuiThemeProvider } from 'material-ui'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { closeNotifier } from 'redux/notifier/actions'
import ModalContainer from 'components/modals/Modal'
import theme from 'styles/themes/default'
import { HeaderPartial, DrawerPartial } from './partials'

import './Markup.scss'

// import 'styles/globals/index.global.css'

class Markup extends PureComponent {
  static propTypes = {
    isCBE: PropTypes.bool,
    notice: PropTypes.instanceOf(Object),
    handleCloseNotifier: PropTypes.func,
    children: PropTypes.node,
  }

  render () {
    return (
      <MuiThemeProvider muiTheme={theme}>
        <div styleName='root'>
          <div styleName='drawer' className={this.props.isCBE ? 'drawer-cbe' : null}>
            <DrawerPartial />
          </div>
          <div styleName='middle'>
            <div styleName='middleTop'>
              <HeaderPartial />
            </div>
            <div styleName='middleSnackbar'>
              <div styleName='middleSnackbarPanel'>
                {this.props.notice
                  ? (
                    <Snackbar
                      notice={this.props.notice}
                      autoHideDuration={4000}
                      onRequestClose={this.props.handleCloseNotifier}
                    />)
                  : null
                }
              </div>
            </div>
            <div styleName='middleContent'>
              {this.props.children}
            </div>
          </div>
          <div styleName='middleBottom' />
          <ModalStack />
          <ModalContainer />
        </div>
      </MuiThemeProvider>
    )
  }
}

function mapStateToProps (state) {
  const session = state.get('session')
  const notifier = state.get('notifier')
  return {
    isCBE: session.isCBE,
    notice: notifier.notice, /** @see null | AbstractNoticeModel */
  }
}

function mapDispatchToProps (dispatch) {
  return {
    handleCloseNotifier: () => dispatch(closeNotifier()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Markup)
