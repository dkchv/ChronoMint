import ledgerProvider from '../../network/LedgerProvider'
import web3Provider from '../../network/Web3Provider'
import networkService, { NETWORK_SET_ACCOUNTS } from '../../redux/network/actions'

export const LEDGER_SET_U2F = 'ledger/SET_U2F'
export const LEDGER_SET_ETH_APP_OPENED = 'ledger/SET_ETH_APP_OPENED'
export const LEDGER_FETCHING = 'ledger/FETCHING'
export const LEDGER_FETCHED = 'ledger/FETCHED'

export const initLedger = () => async (dispatch) => {
  const isInited = await ledgerProvider.init()
  dispatch({ type: LEDGER_SET_U2F, isU2F: ledgerProvider.isU2F() })
  dispatch({ type: LEDGER_SET_ETH_APP_OPENED, isETHAppOpened: ledgerProvider.isETHAppOpened() })
  return isInited
}

export const startLedgerSync = () => async (dispatch) => {
  await dispatch(initLedger())
  ledgerProvider.on('connection', (isETHAppOpened) => dispatch({ type: LEDGER_SET_ETH_APP_OPENED, isETHAppOpened }))
  return ledgerProvider.sync()
}

export const stopLedgerSync = (isReset = false) => (dispatch) => {
  ledgerProvider.stop()
  if (!isReset) {
    return
  }
  // reset state if we do not intent to login
  dispatch({ type: NETWORK_SET_ACCOUNTS, accounts: [] })
  networkService.selectAccount(null)
  dispatch({ type: LEDGER_FETCHED, isFetched: false })
}

export const fetchAccount = () => async (dispatch) => {
  dispatch({ type: LEDGER_FETCHING })
  const accounts = await ledgerProvider.fetchAccount()
  if (!accounts) {
    dispatch({ type: LEDGER_FETCHED, isFetched: false })
    return
  }
  dispatch({ type: NETWORK_SET_ACCOUNTS, accounts })
  networkService.selectAccount(accounts[ 0 ])
  dispatch({ type: LEDGER_FETCHED, isFetched: true })
  // we do not need to watching eth app on login
  dispatch(stopLedgerSync())
}

export const loginLedger = () => {
  const providerURL = networkService.getProviderURL()
  ledgerProvider.setupAndStart(providerURL)
  web3Provider.setWeb3(ledgerProvider.getWeb3())
  web3Provider.setProvider(ledgerProvider.getProvider())
}
