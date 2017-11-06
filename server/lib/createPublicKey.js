import eccrypto from 'eccrypto'

// Uncompressed (65-byte) public key
// that corresponds to the given private key
export default function( privateKey ) {
  return eccrypto.getPublic(privateKey)
}