import { checkMetaMask, checkTestRPC } from '../network/actions'
import LS from '../../utils/LocalStorage'

export const bootstrap = () => dispatch => {
  // avoid relogin
  LS.removeWeb3Provider()
  LS.removeNetworkId()
  LS.removeAccount()
  // checks
  dispatch(checkMetaMask())
  dispatch(checkTestRPC())

  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    window.location.protocol = 'https:'
    window.location.reload()
  }
}
