import crypto from 'crypto';

// Create a new random 32-byte private key.
export default function(){
  return crypto.randomBytes(32);
}