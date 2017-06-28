import Immutable from 'immutable'

import AbstractTokenDAO, { TXS_PER_PAGE } from '../../dao/AbstractTokenDAO'
import TransferNoticeModel from '../../models/notices/TransferNoticeModel'
import TokenModel from '../../models/TokenModel'

import { showAlertModal } from '../ui/modal'
import { notify } from '../notifier/notifier'

import contractsManagerDAO from '../../dao/ContractsManagerDAO'
import ls from '../../utils/LocalStorage'

export const WALLET_TOKENS_FETCH = 'wallet/TOKENS_FETCH'
export const WALLET_TOKENS = 'wallet/TOKENS'
export const WALLET_BALANCE_FETCH = 'wallet/BALANCE_FETCH'
export const WALLET_BALANCE = 'wallet/BALANCE'
export const WALLET_TIME_DEPOSIT_FETCH = 'wallet/TIME_DEPOSIT_FETCH'
export const WALLET_TIME_DEPOSIT = 'wallet/TIME_DEPOSIT'
export const WALLET_TRANSACTIONS_FETCH = 'wallet/TRANSACTIONS_FETCH'
export const WALLET_TRANSACTION = 'wallet/TRANSACTION'
export const WALLET_TRANSACTIONS = 'wallet/TRANSACTIONS'

export const balanceFetch = (symbol) => ({type: WALLET_BALANCE_FETCH, symbol})

export const TIME = 'TIME'

export const watchTransfer = (notice: TransferNoticeModel, token: AbstractTokenDAO) => (dispatch) => {
  dispatch(updateBalance(token))
  dispatch(notify(notice))
  dispatch({type: WALLET_TRANSACTION, tx: notice.tx()})
}

export const watchInitWallet = () => async (dispatch) => {
  dispatch({type: WALLET_TOKENS_FETCH})
  const dao = await contractsManagerDAO.getERC20ManagerDAO()
  let tokens = await dao.getUserTokens() // TODO @bshevchenko: put here user tokens addresses
  dispatch({type: WALLET_TOKENS, tokens})

  dispatch(getAccountTransactions(tokens))

  tokens = tokens.valueSeq().toArray()
  for (let token of tokens) {
    const dao = token.dao()
    await dao.watchTransfer((notice) => dispatch(watchTransfer(notice, dao)))
  }
}

export const updateBalance = (tokenDAO: AbstractTokenDAO) => async (dispatch) => {
  const symbol = tokenDAO.getSymbol()
  dispatch(balanceFetch(symbol))
  const balance = await tokenDAO.getAccountBalance(ls.getAccount())
  dispatch({type: WALLET_BALANCE, symbol, balance})
}

export const transfer = (token: TokenModel, amount: string, recipient) => async (dispatch) => {
  const symbol = token.symbol()
  try {
    const tokenDAO = await token.dao()
    await tokenDAO.transfer(amount, recipient)
    dispatch(updateBalance(tokenDAO))
  } catch (e) {
    dispatch(showAlertModal({title: symbol + ' transfer error', message: e.message}))
  }
}

export const updateTIMEBalance = () => async (dispatch) => {
  dispatch(balanceFetch(TIME))
  const tokenDAO = await contractsManagerDAO.getTIMEDAO()
  return dispatch(updateBalance(tokenDAO))
}

export const updateTIMEDeposit = () => async (dispatch) => {
  dispatch({type: WALLET_TIME_DEPOSIT_FETCH})
  const dao = await contractsManagerDAO.getTIMEHolderDAO()
  const deposit = await dao.getAccountDepositBalance(ls.getAccount())
  dispatch({type: WALLET_TIME_DEPOSIT, deposit})
}

export const depositTIME = (amount) => async (dispatch) => {
  try {
    const dao = await contractsManagerDAO.getTIMEHolderDAO()
    const result = await dao.deposit(amount)
    if (!result) {
      dispatch(showAlertModal({title: 'Deposit TIME error', message: 'Insufficient funds.'}))
    }
  } catch (e) {
    dispatch(showAlertModal({title: 'Deposit TIME error', message: e.message}))
  }
  dispatch(updateTIMEBalance())
  dispatch(updateTIMEDeposit())
}

export const withdrawTIME = (amount) => async (dispatch) => {
  try {
    const dao = await contractsManagerDAO.getTIMEHolderDAO()
    const result = await dao.withdraw(amount)
    if (!result) {
      dispatch(showAlertModal({title: 'Withdraw TIME error', message: 'Insufficient funds.'}))
    }
  } catch (e) {
    dispatch(showAlertModal({title: 'Withdraw TIME error', message: e.message}))
  }
  dispatch(updateTIMEBalance())
  dispatch(updateTIMEDeposit())
}

const getTransferId = 'wallet'
let lastCacheId
let txsCache = []

export const getAccountTransactions = (tokens) => async (dispatch) => {
  dispatch({type: WALLET_TRANSACTIONS_FETCH})

  tokens = tokens.valueSeq().toArray()

  const cacheId = Object.values(tokens).map((v: TokenModel) => v.symbol()).join(',')

  const reset = lastCacheId && cacheId !== lastCacheId
  lastCacheId = cacheId
  if (reset) {
    txsCache = []
  }

  let txs = txsCache.slice(0, TXS_PER_PAGE)
  txsCache = txsCache.slice(TXS_PER_PAGE)

  if (txs.length < TXS_PER_PAGE) { // so cache is empty
    const promises = []
    for (let token of tokens) {
      if (reset) {
        token.dao().resetFilterCache(getTransferId)
      }
      promises.push(token.dao().getTransfer(ls.getAccount(), getTransferId))
    }
    const result = await Promise.all(promises)

    let newTxs = []
    for (let pack of result) {
      newTxs = [...newTxs, ...pack]
    }

    newTxs.sort((a, b) => b.get('time') - a.get('time'))

    txs = [...txs, ...newTxs]
    txsCache = txs.slice(TXS_PER_PAGE)
    txs = txs.slice(0, TXS_PER_PAGE)
  }

  let map = new Immutable.Map()
  for (let tx: TransactionModel of txs) {
    map = map.set(tx.id(), tx)
  }

  dispatch({type: WALLET_TRANSACTIONS, map})
}
