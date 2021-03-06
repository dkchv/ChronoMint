import BigNumber from 'bignumber.js'
import contractManager from 'dao/ContractsManagerDAO'
import web3Provider from 'Login/network/Web3Provider'
import TxModel from 'models/TxModel'
import Web3Converter from 'utils/Web3Converter'
import { AssetsManagerABI, MultiEventsHistoryABI } from './abi'
import AbstractContractDAO from './AbstractContractDAO'
import { TX_ISSUE, TX_OWNERSHIP_CHANGE, TX_REVOKE } from './ChronoBankPlatformDAO'
import { TX_PLATFORM_ATTACHED, TX_PLATFORM_REQUESTED } from './PlatformsManagerDAO'

const TX_ASSET_CREATED = 'AssetCreated'
const TXS_PER_PAGE = 10

export default class AssetsManagerDAO extends AbstractContractDAO {
  constructor (at = null) {
    super(AssetsManagerABI, at, MultiEventsHistoryABI)
  }

  getTokenExtension (platform) {
    return this._call('getTokenExtension', [platform])
  }

  async getParticipatingPlatformsForUser (account) {
    const platformsList = await this._call('getParticipatingPlatformsForUser', [account])
    let formatPlatformsList = {}
    if (platformsList.length) {
      for (let platform of platformsList) {
        formatPlatformsList[platform] = {
          address: platform,
          name: null,
        }
      }
    }
    return Object.values(formatPlatformsList)
  }

  async getSystemAssetsForOwner (owner) {
    const assets = await this._call('getSystemAssetsForOwner', [owner])

    let assetsList = {}
    let currentPlatform
    for (let i = 0; i < assets[0].length; i++) {

      if (!this.isEmptyAddress(assets[1][i])) currentPlatform = assets[1][i]

      assetsList[assets[0][i]] = {
        address: assets[0][i],
        platform: currentPlatform,
        totalSupply: assets[2][i],
      }
    }
    return assetsList
  }

  async getManagers (owner) {
    const managersList = await this._call('getManagers', [owner])
    let formatManagersList = {}
    managersList.map((manager) => {
      if (!this.isEmptyAddress(manager) && !formatManagersList[manager]) {
        formatManagersList[manager] = manager
      }
    })

    return Object.keys(formatManagersList)
  }

  async getManagersForAssetSymbol (symbol) {
    const managersListForSymbol = await this._call('getManagersForAssetSymbol', [symbol])

    let formatManagersList = {}
    managersListForSymbol.map((manager) => {
      if (!this.isEmptyAddress(manager) && !formatManagersList[manager]) {
        formatManagersList[manager] = manager
      }
    })
    return Object.keys(formatManagersList)
  }

  createTxModel (tx, account, block, time): TxModel {
    const gasPrice = new BigNumber(tx.gasPrice)
    return new TxModel({
      txHash: tx.transactionHash,
      type: tx.event,
      blockHash: tx.blockHash,
      blockNumber: block,
      transactionIndex: tx.transactionIndex,
      from: tx.args.from,
      by: tx.args.by,
      to: tx.args.to,
      value: tx.args.value,
      gas: tx.gas,
      gasPrice,
      time,
      symbol: tx.args.symbol && Web3Converter.bytesToString(tx.args.symbol),
      args: tx.args,
    })
  }

  async getTxModel (tx, account, block = null, time = null): Promise<?TxModel> {
    const txDetails = await web3Provider.getTransaction(tx.transactionHash)
    tx.gasPrice = txDetails.gasPrice
    tx.gas = txDetails.gas

    if (block && time) {
      return this.createTxModel(tx, account, block, time)
    }
    block = await web3Provider.getBlock(tx.blockHash)
    return this.createTxModel(tx, account, tx.blockNumber, block.timestamp)
  }

  async getTransactions (account) {
    const transactionsPromises = []
    const platformManagerDao = await contractManager.getPlatformManagerDAO()
    const chronoBankPlatformDAO = await contractManager.getChronoBankPlatformDAO()
    const platformTokenExtensionGatewayManagerDAO = await contractManager.getPlatformTokenExtensionGatewayManagerEmitterDAO()

    transactionsPromises.push(platformTokenExtensionGatewayManagerDAO._get(TX_ASSET_CREATED, 0, 'latest', { by: account }, TXS_PER_PAGE))
    transactionsPromises.push(platformManagerDao._get(TX_PLATFORM_REQUESTED, 0, 'latest', { by: account }, TXS_PER_PAGE, 'test'))
    transactionsPromises.push(platformManagerDao._get(TX_PLATFORM_ATTACHED, 0, 'latest', { by: account }, TXS_PER_PAGE))
    transactionsPromises.push(chronoBankPlatformDAO._get(TX_ISSUE, 0, 'latest', { by: account }, TXS_PER_PAGE))
    transactionsPromises.push(chronoBankPlatformDAO._get(TX_REVOKE, 0, 'latest', { by: account }, TXS_PER_PAGE))
    transactionsPromises.push(chronoBankPlatformDAO._get(TX_OWNERSHIP_CHANGE, 0, 'latest', { to: account }))
    transactionsPromises.push(chronoBankPlatformDAO._get(TX_OWNERSHIP_CHANGE, 0, 'latest', { from: account }))
    const transactionsLists = await Promise.all(transactionsPromises)
    const promises = []
    transactionsLists.map((transactionsList) => transactionsList.map((tx) => promises.push(this.getTxModel(tx, account))))
    return Promise.all(promises)
  }
}
