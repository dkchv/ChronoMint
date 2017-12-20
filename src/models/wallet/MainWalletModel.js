import AllowanceCollection from '@/models/wallet/AllowanceCollection'
import Immutable from 'immutable'
import Amount from 'models/Amount'
import BalanceModel from 'models/tokens/BalanceModel'
import BalancesCollection from 'models/tokens/BalancesCollection'
import ls from 'utils/LocalStorage'
import { abstractFetchingModel } from '../AbstractFetchingModel'
import TransactionsCollection from './TransactionsCollection'

export default class MainWallet extends abstractFetchingModel({
  address: null,
  tokens: new Immutable.Map(),
  transactions: new TransactionsCollection(),
  btcAddress: null,
  bccAddress: null,
  btgAddress: null,
  ltcAddress: null,
  nemAddress: null,
  timeDeposit: new Amount(0, null, false),
  timeAddress: null,
  isMultisig: false,
  isMainWallet: true,
  // TODO @dkchv: is a part of wallet ?
  isTIMERequired: true,
  balances: new BalancesCollection(),
  allowances: new AllowanceCollection(),
}) {

  address () {
    return ls.getAccount()
  }

  /**
   * @deprecated
   */
  tokens (value) {
    return this._getSet('tokens', value)
  }

  btcAddress (value) {
    return this._getSet('btcAddress', value)
  }

  bccAddress (value) {
    return this._getSet('bccAddress', value)
  }

  btgAddress (value) {
    return this._getSet('btgAddress', value)
  }

  ltcAddress (value) {
    return this._getSet('ltcAddress', value)
  }

  nemAddress (value) {
    return this._getSet('nemAddress', value)
  }

  transactions (value) {
    return this._getSet('transactions', value)
  }

  isTIMERequired (value) {
    return this._getSet('isTIMERequired', value)
  }

  isMultisig () {
    return this.get('isMultisig')
  }

  balances (value) {
    return this._getSet('balances', value)
  }

  balance (balance: BalanceModel) {
    return this.balances(this.balances().update(balance))
  }

  allowances (value) {
    return this._getSet('allowances', value)
  }
}
