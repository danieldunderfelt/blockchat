import { calculateHash } from './blockHash'

export default function( index, data, previousHash, timestamp = new Date().valueOf() ) {
  let timeStr = timestamp instanceof Date ? timestamp.valueOf() : timestamp
  const hash = calculateHash(index, previousHash, timeStr, data)

  return {
    index,
    timestamp: timeStr,
    data,
    previousHash,
    hash
  }
}