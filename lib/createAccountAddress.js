var crypto = require('crypto');

function createAddress(publicKey){
  let sha256 = crypto.createHash("sha256")
  sha256.update(publicKey)
  return sha256.digest('hex')
}