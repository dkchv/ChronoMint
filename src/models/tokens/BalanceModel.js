import Amount from 'models/Amount'
import BigNumber from 'bignumber.js'
import { abstractModel } from '../AbstractModel'

export default class BalanceModel extends abstractModel({
  id: null,
  amount: new Amount(0, null , false),
  // TODO @dkchv: add pendings here
}) {
  id () {
    return this.get('id')
  }

  amount (value) {
    return this._getSet('amount', value)
  }

  symbol () {
    return this.amount().symbol()
  }

  updateBalance (isCredited, value: BigNumber) {
    const newBalance = isCredited
      ? this.amount().plus(value)
      : this.amount().minus(value)
    return this.amount(newBalance)
  }
}
