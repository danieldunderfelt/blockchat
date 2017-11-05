var crypto = require('crypto');

// Create a new random 32-byte private key.
function createPrivateKey(){
  return crypto.randomBytes(32);
}