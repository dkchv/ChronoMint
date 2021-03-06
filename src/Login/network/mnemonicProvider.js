import bip39 from 'bip39'
import bitcoin from 'bitcoinjs-lib'
import hdKey from 'ethereumjs-wallet/hdkey'
import * as NEM from './nem'
import { createBCCEngine, createBTCEngine } from './BitcoinUtils'
import { createNEMEngine } from './NemUtils'
import NemWallet from './NemWallet'
import Web3Utils from './Web3Utils'

class MnemonicProvider {
  getMnemonicProvider (mnemonic, { url, network } = {}) {
    const ethereum = this.createEthereumWallet(mnemonic)
    const btc = network && network.bitcoin && this.createBitcoinWallet(mnemonic, bitcoin.networks[ network.bitcoin ])
    const bcc = btc
    const nem = network && network.nem && NemWallet.fromMnemonic(mnemonic, NEM.Network.data[network.nem])

    return {
      ethereum: Web3Utils.createEngine(ethereum, url),
      btc: network && network.bitcoin && createBTCEngine(btc, bitcoin.networks[ network.bitcoin ]),
      bcc: network && network.bitcoin && createBCCEngine(bcc, bitcoin.networks[ network.bitcoin ]),
      nem: network && network.nem && createNEMEngine(nem, NEM.Network.data[network.nem]),
    }
  }

  createEthereumWallet (mnemonic) {
    const hdWallet = hdKey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic))
    // get the first account using the standard hd path
    const walletHDPath = `m/44'/60'/0'/0/0`
    return hdWallet.derivePath(walletHDPath).getWallet()
  }

  createBitcoinWallet (mnemonic, network) {
    return bitcoin.HDNode
      .fromSeedBuffer(bip39.mnemonicToSeed(mnemonic), network)
      .derivePath(`m/44'/${network === bitcoin.networks.testnet ? 1 : 0}'/0'/0/0`)
  }

  validateMnemonic (mnemonic) {
    return bip39.validateMnemonic(mnemonic)
  }

  generateMnemonic () {
    return bip39.generateMnemonic()
  }
}

export default new MnemonicProvider()
