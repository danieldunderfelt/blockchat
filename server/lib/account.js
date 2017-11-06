import createAddress from './createAccountAddress'
import createPrivateKey from './createAccountPrivateKey'
import createPublicKey from './createAccountPublicKey'

export default function() {

  function create( name ) {
    const privateKey = createPrivateKey()
    const publicKey  = createPublicKey(privateKey)
    const address    = createAddress(publicKey)

    return {
      name,
      privateKey,
      publicKey,
      address
    }
  }

  function createMessage() {

  }

  function sendKarma( amount, receiver ) {

  }

  return {
    create,
    createMessage,
    sendKarma
  }
}