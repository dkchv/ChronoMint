import { Map } from 'immutable'
import * as a from '../../../src/redux/wallet/actions'
import reducer from '../../../src/redux/wallet/reducer'
import TokenModel from '../../../src/models/TokenModel'
import TransactionModel from '../../../src/models/TransactionModel'

const dao1Mock = {
  getSymbol: () => 'TK1',
  getName: () => 'token1'
}
const dao2Mock = {
  getSymbol: () => 'TK2',
  getName: () => 'token2'
}
const token1 = new TokenModel(dao1Mock)
const token2 = new TokenModel(dao2Mock)

const tx1 = new TransactionModel({txHash: 'hash1', from: 1, to: 2})
const tx2 = new TransactionModel({txHash: 'hash2', from: 3, to: 4})

describe('settings cbe reducer', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {})
    ).toEqual({
      tokensFetching: true,
      tokens: new Map(), /** @see TokenModel */
      transactions: {
        list: new Map(),
        isFetching: false,
        endOfList: false
      },
      timeDeposit: null,
      isTimeDepositFetching: false
    })
  })

  it('should handle WALLET_TOKENS_FETCH', () => {
    expect(
      reducer({tokensFetching: false}, {type: a.WALLET_TOKENS_FETCH})
    ).toEqual({
      tokensFetching: true
    })
  })

  it('should handle WALLET_TOKENS_FETCH', () => {
    const tokens = new Map({
      token1,
      token2
    })
    expect(
      reducer({}, {type: a.WALLET_TOKENS, tokens})
    ).toEqual({
      tokensFetching: false,
      tokens
    })
  })

  it('should handle WALLET_BALANCE_FETCH', () => {
    expect(
      reducer({tokens: new Map({'TK1': token1})}, {type: a.WALLET_BALANCE_FETCH, symbol: 'TK1'})
    ).toEqual({
      tokens: new Map({
        TK1: new TokenModel(dao1Mock).fetching()
      })
    })
  })

  it('should handle WALLET_BALANCE', () => {
    expect(
      reducer({tokens: new Map({'TK1': token1})}, {type: a.WALLET_BALANCE, symbol: 'TK1', balance: 5})
    ).toEqual({
      tokens: new Map({
        TK1: new TokenModel(dao1Mock, 5).fetching().notFetching()
      })
    })
  })

  it('should handle WALLET_TIME_DEPOSIT_FETCH', () => {
    expect(
      reducer({isTimeDepositFetching: false}, {type: a.WALLET_TIME_DEPOSIT_FETCH})
    ).toEqual({
      isTimeDepositFetching: true
    })
  })

  it('should handle WALLET_TIME_DEPOSIT', () => {
    expect(
      reducer({timeDeposit: 5, isTimeDepositFetching: true}, {type: a.WALLET_TIME_DEPOSIT, deposit: 10})
    ).toEqual({
      isTimeDepositFetching: false,
      timeDeposit: 10
    })
  })

  it('should handle WALLET_TRANSACTIONS_FETCH', () => {
    const initial = {
      transactions: {
        list: new Map({a: 1}),
        isFetching: false
      }
    }
    expect(
      reducer(initial, {type: a.WALLET_TRANSACTIONS_FETCH})
    ).toEqual({
      transactions: {
        list: new Map({a: 1}),
        isFetching: true
      }
    })
  })

  it('should handle WALLET_TRANSACTION', () => {
    const initial = {
      transactions: {
        list: new Map({
          [tx1.id()]: tx1
        })
      }
    }
    const updatedTx = new TransactionModel({txHash: 'hash1', from: 1, to: 2, blockNumber: 10})

    expect(
      reducer(initial, {type: a.WALLET_TRANSACTION, tx: updatedTx})
    ).toEqual({
      transactions: {
        list: new Map({
          'hash1 - 1 - 2': updatedTx
        })
      }
    })
  })

  it('should handle WALLET_TRANSACTIONS', () => {
    const initial = {
      transactions: {
        list: new Map({
          tx1
        }),
        endOfList: true,
        isFetching: true
      }
    }
    expect(
      reducer(initial, {type: a.WALLET_TRANSACTIONS, map: {tx2}})
    ).toEqual({
      transactions: {
        list: new Map({tx1, tx2}),
        endOfList: false,
        isFetching: false
      }
    })
  })
})
