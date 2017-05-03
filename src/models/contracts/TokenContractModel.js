import DAOFactory from '../../dao/DAOFactory'
import { abstractContractModel } from './AbstractContractModel'
import * as validation from '../../components/forms/validate'

class TokenContractModel extends abstractContractModel({
  proxy: null,
  symbol: null,
  totalSupply: null,
  isFetching: false
}) {
  proxy () {
    return DAOFactory.initProxyDAO(this.get('proxy'))
  }

  proxyAddress () {
    return this.get('proxy')
  }

  symbol () {
    return this.get('symbol')
  }

  totalSupply () {
    return this.get('totalSupply')
  }

  isFetching () {
    return this.get('isFetching')
  }

  fetching () {
    return this.set('isFetching', true)
  }
}

export const validate = values => {
  const errors = {}
  errors.address = validation.address(values.get('address'))
  return errors
}

export default TokenContractModel
