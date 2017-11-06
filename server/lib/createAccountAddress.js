import crypto from 'crypto';

export default function(publicKey) {
  let sha256 = crypto.createHash("sha256")
  sha256.update(publicKey)
  return sha256.digest('hex')
}