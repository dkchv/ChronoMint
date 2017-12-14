import { TOKEN_ICONS } from 'assets'
import classnames from 'classnames'
import IPFSImage from 'components/common/IPFSImage/IPFSImage'
import Points from 'components/common/Points/Points'
import WithLoader, { isFetching } from 'components/common/Preloader/WithLoader'
import TokenValue from 'components/common/TokenValue/TokenValue'
import Immutable from 'immutable'
import { Checkbox, FloatingActionButton, FontIcon, RaisedButton } from 'material-ui'
import TokensCollection from 'models/exchange/TokensCollection'
import TokenModel from 'models/tokens/TokenModel'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Translate } from 'react-redux-i18n'
import { modalsClose, modalsOpen } from 'redux/modals/actions'
import { DUCK_SESSION, updateUserProfile } from 'redux/session/actions'
import { DUCK_TOKENS } from 'redux/tokens/actions'
import './AddCurrencyDialog.scss'
import AddTokenDialog from './AddTokenDialog'
import ModalDialog from './ModalDialog'

class TokenRow extends PureComponent {
  static propTypes = {
    token: PropTypes.instanceOf(TokenModel),
    isSelected: PropTypes.bool,
    onClick: PropTypes.func,
  }

  handleClick = () => this.props.onClick(this.props.token.symbol(), !this.props.isSelected)

  renderCheckbox = ({ isSelected }) => this.props.token.isOptional() ? <Checkbox checked={isSelected} /> : null

  render () {
    const { isSelected, token } = this.props
    const symbol = token.symbol()

    return (
      <div
        key={token.id()}
        styleName={classnames('row', { rowSelected: isSelected })}
        onTouchTap={this.handleClick}
      >
        <div styleName='cell'>
          <div styleName='icon'>
            <IPFSImage styleName='iconContent' multihash={token.icon()} fallback={TOKEN_ICONS[symbol]} />
            <div styleName='label'>{symbol}</div>
          </div>
        </div>
        <div styleName='cell cellAuto'>
          <div styleName='symbol'>{symbol}</div>
          <div styleName='value'>
            <TokenValue
              value={token.balance()}
              symbol={token.symbol()}
              isLoading={!token.isFetched()}
            />
          </div>
        </div>
        <div styleName='cell'>
          <WithLoader showLoader={isFetching} payload={token} isSelected={this.props.isSelected}>
            {this.renderCheckbox}
          </WithLoader>
        </div>
      </div>
    )
  }
}

function prefix (token) {
  return `components.dialogs.AddCurrencyDialog.${token}`
}

function mapStateToProps (state) {
  return {
    profile: state.get(DUCK_SESSION),
    tokens: state.get(DUCK_TOKENS),
  }
}

function mapDispatchToProps (dispatch) {
  return {
    handleAddToken: () => dispatch(modalsOpen({
      component: AddTokenDialog,
    })),
    modalsClose: () => dispatch(modalsClose()),
    updateUserProfile: (profile) => dispatch(updateUserProfile(profile)),
  }
}

@connect(mapStateToProps, mapDispatchToProps)
export default class AddCurrencyDialog extends PureComponent {
  static propTypes = {
    profile: PropTypes.object,
    tokens: PropTypes.instanceOf(TokensCollection),
    handleAddToken: PropTypes.func,
    modalsClose: PropTypes.func,
    updateUserProfile: PropTypes.func,
  }

  constructor () {
    super(...arguments)

    this.handleSave = this.handleSave.bind(this)
    this.state = {
      selectedTokens: [],
    }
  }

  handleClose = () => {
    this.props.modalsClose()
  }

  handleCurrencyChecked = (symbol, isSelect) => {
    const { selectedTokens } = this.state

    this.setState({
      selectedTokens: isSelect
        ? selectedTokens.concat(symbol)
        : selectedTokens.filter((item) => item !== symbol),
    })
  }

  async handleSave () {
    const tokens = this.props.tokens.filter((item) => item.address() && !item.isOptional() || this.state.selectedTokens.includes(item.symbol()))
    const tokensAddresses = tokens.toArray().map((item) => item.address())
    const profile = this.props.profile.tokens(new Immutable.Set(tokensAddresses))

    this.props.modalsClose()
    await this.props.updateUserProfile(profile)
  }

  renderRow = (selectedTokens) => (token) => {
    const isSelected = selectedTokens.includes(token.symbol())

    return (
      <TokenRow
        key={token.id()}
        token={token}
        isSelected={isSelected}
        onClick={this.handleCurrencyChecked}
      />
    )
  }

  renderTokens = ({ tokens, selectedTokens }) => (
    <div styleName='table'>
      {tokens.items().map(this.renderRow(selectedTokens))}
    </div>
  )

  render () {
    return (
      <ModalDialog styleName='root'>
        <div styleName='content'>
          <div styleName='header'>
            <h3><Translate value={prefix('tokens')} /></h3>
            <div styleName='subtitle'><Translate value={prefix('addToken')} /></div>
          </div>
          <div styleName='actions'>
            <div styleName='items'>
              <div styleName='item'>
                <FloatingActionButton onTouchTap={this.props.handleAddToken}>
                  <FontIcon className='material-icons'>add</FontIcon>
                </FloatingActionButton>
              </div>
            </div>
          </div>
          <div styleName='body'>
            <div styleName='column'>
              <h5><Translate value={prefix('allTokens')} /></h5>
              <WithLoader
                showLoader={!this.props.tokens.isFetched()}
                selectedTokens={this.state.selectedTokens}
                tokens={this.props.tokens}
              >
                {this.renderTokens}
              </WithLoader>
            </div>
            <div styleName='column'>
              <h5><Translate value={prefix('howToAddYourToken')} /></h5>
              <div styleName='description'>
                <p>
                  <Translate value={prefix('youCanConnectToYourPersonalWallet')} />
                </p>
              </div>
              <Points>
                <span>
                  <Translate value={prefix('clickOnThePlusButtonAbove')} />
                </span>
                <span>
                  <Translate value={prefix('fillTheForm')} />
                </span>
                <span>
                  <Translate value={prefix('waitUntilYourToken')} />
                </span>
              </Points>
            </div>
          </div>
          <div styleName='footer'>
            <RaisedButton
              styleName='action'
              label={<Translate value={prefix('save')} />}
              primary
              onTouchTap={this.handleSave}
            />
            <RaisedButton
              styleName='action'
              label={<Translate value={prefix('close')} />}
              onTouchTap={this.handleClose}
            />
          </div>
        </div>
      </ModalDialog>
    )
  }
}
