const createAddress = require('./createAccountAddress')
const createPrivateKey = require('./createAccountPrivateKey')
const createPublicKey = require('./createAccountPublicKey')

module.exports = function() {

    function create(name) {
        const privateKey = createPrivateKey()
        const publicKey = createPublicKey(privateKey)
        const address = createAccountAddress(publicKey)

        return {
            name,
            privateKey,
            publicKey,
            address
        }
    }

    function createMessage() {

    }

    function sendKarma(amount, receiver) {

    }

    return {
        create,
        createMessage,
        sendKarma
    }
}