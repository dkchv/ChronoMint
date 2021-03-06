import BigNumber from 'bignumber.js'
import resultCodes from 'chronobank-smart-contracts/common/errors'
import type ERC20DAO from 'dao/ERC20DAO'
import Immutable from 'immutable'
import RewardsModel from 'models/RewardsModel'
import RewardsPeriodModel from 'models/RewardsPeriodModel'
import AbstractContractDAO from './AbstractContractDAO'
import contractsManagerDAO from './ContractsManagerDAO'
import { RewardsABI, MultiEventsHistoryABI } from './abi'

export const TX_WITHDRAW_REWARD = 'withdrawReward'
export const TX_CLOSE_PERIOD = 'closePeriod'

export default class RewardsDAO extends AbstractContractDAO {
  constructor (at) {
    super(RewardsABI, at, MultiEventsHistoryABI)
    this._okCodes = [resultCodes.OK, resultCodes.REWARD_CALCULATION_FAILED]
  }

  async getAssetDAO (): Promise<ERC20DAO> {
    const addresses = await this._call('getAssets')
    return contractsManagerDAO.getERC20DAO(addresses[0])
  }

  getPeriodLength () {
    return this._callNum('getCloseInterval')
  }

  getLastPeriod () {
    return this._callNum('lastPeriod')
  }

  getLastClosedPeriod () {
    return this._callNum('lastClosedPeriod')
      .catch(() => 0) // no closed periods yet
  }

  async getDepositBalanceInPeriod (account, periodId: number): Promise<BigNumber> {
    const balance = await this._call('depositBalanceInPeriod', [account, periodId])
    const timeDAO = await contractsManagerDAO.getTIMEDAO()
    return timeDAO.removeDecimals(balance)
  }

  async getAssetBalanceInPeriod (periodId: number): Promise<BigNumber> {
    const assetDAO = await this.getAssetDAO()
    const assetAddress = await assetDAO.getAddress()
    const balance = await this._call('assetBalanceInPeriod', [assetAddress, periodId])
    return assetDAO.removeDecimals(balance)
  }

  async getPeriodClosedState (id: number): Promise<boolean> {
    try {
      return this._call('isClosed', [id])
    } catch (e) {
      // no closed periods yet
      return false
    }
  }

  async getTotalDepositInPeriod (id: number): Promise<BigNumber> {
    const deposit = await this._call('totalDepositInPeriod', [id])
    const timeDAO = await contractsManagerDAO.getTIMEDAO()
    return timeDAO.removeDecimals(deposit)
  }

  async getCurrentAccumulated (): Promise<BigNumber> {
    const address = await this.getAddress()
    const assetDAO = await this.getAssetDAO()
    const assetBalance = await assetDAO.getAccountBalance(address)
    const assetAddress = await assetDAO.getAddress()
    const rewardsLeft = await this._call('getRewardsLeft', [assetAddress])
    const r = assetBalance.minus(assetDAO.removeDecimals(rewardsLeft))
    return r.lt(0) ? new BigNumber(0) : r
  }

  async getSymbol (): Promise<string> {
    const assetDAO = await this.getAssetDAO()
    return assetDAO.getSymbol()
  }

  async getRewardsFor (account): Promise<BigNumber> {
    const assetDAO = await this.getAssetDAO()
    const assetAddress = await assetDAO.getAddress()
    const r = await this._call('rewardsFor', [assetAddress, account])
    return assetDAO.removeDecimals(r)
  }

  async getRewardsData (): Promise<RewardsModel> {
    const timeHolderDAO = await contractsManagerDAO.getTIMEHolderDAO()
    const timeDAO = await contractsManagerDAO.getTIMEDAO()
    const [
      address,
      symbol,
      periodLength,
      lastPeriod,
      lastClosedPeriod,
      accountDeposit,
      timeTotalSupply,
      periods,
      currentAccumulated,
      accountRewards,
    ] = await Promise.all([
      this.getAddress(),
      this.getSymbol(),
      this.getPeriodLength(),
      this.getLastPeriod(),
      this.getLastClosedPeriod(),
      timeHolderDAO.getAccountDepositBalance(),
      timeDAO.totalSupply(),
      this.getPeriods(),
      this.getCurrentAccumulated(),
      this.getRewardsFor(this.getAccount()),
    ])

    return new RewardsModel({
      address,
      symbol,
      periodLength,
      lastPeriod,
      lastClosedPeriod,
      accountDeposit,
      timeTotalSupply,
      periods,
      currentAccumulated,
      accountRewards,
    })
  }

  async getPeriods (account = this.getAccount()): Promise<Immutable.Map<RewardsPeriodModel>> {
    const length = await this._callNum('periodsLength')
    const promises = []
    for (let i = 0; i <= length; i++) {
      promises.push(this._getPeriod(i, account))
    }
    const values = await Promise.all(promises)

    let map = new Immutable.Map()
    for (let j = values.length - 1; j >= 0; j--) {
      const period: RewardsPeriodModel = values[j]
      map = map.set(period.id(), period)
    }
    return map
  }

  /** @private */
  async _getPeriod (id, account): Promise<RewardsPeriodModel> {
    const periodLength = await this.getPeriodLength()
    const values = await Promise.all([
      this.getTotalDepositInPeriod(id), // 0
      this.getDepositBalanceInPeriod(account, id), // 1
      this.getPeriodClosedState(id), // 2
      this.getAssetBalanceInPeriod(id), // 3
      this._callNum('periodUnique', [id]), // 4
      this._callNum('getPeriodStartDate', [id]), // 5
    ])
    return new RewardsPeriodModel({
      id,
      totalDeposit: values[0],
      userDeposit: values[1],
      isClosed: values[2],
      assetBalance: values[3],
      uniqueShareholders: values[4],
      startDate: values[5],
      periodLength,
    })
  }

  async withdraw () {
    const [amount, assetDAO] = await Promise.all([
      await this.getRewardsFor(this.getAccount()),
      await this.getAssetDAO(),
    ])
    const assetAddress = await assetDAO.getAddress()
    return this._tx(TX_WITHDRAW_REWARD, [assetAddress, assetDAO.addDecimals(amount)], { amount })
  }

  async closePeriod () {
    return this._tx(TX_CLOSE_PERIOD)
  }

  async watchPeriodClosed (callback) {
    await this._watch('Error', () => {
      callback()
    })
    return this._watch('PeriodClosed', () => {
      callback()
    })
  }
}
