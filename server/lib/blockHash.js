import crypto from 'crypto'

export function calculateHashForBlock( block ) {
  return calculateHash(block.index, block.previousHash, block.timestamp, block.data)
}

export function calculateHash( index, previousHash, timestamp, data ) {
  return crypto
    .createHash('sha256')
    .update(`${ index }${ previousHash }${ timestamp }${ JSON.stringify(data) }`)
    .digest('hex')
}