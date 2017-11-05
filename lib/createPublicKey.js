
var eccrypto = require('eccrypto');

// Uncompressed (65-byte) public key
// that corresponds to the given private key
function getPublicKey(privateKey){
  return eccrypto.getPublic(privateKey);
}