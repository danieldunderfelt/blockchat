const crypto = require('crypto')
const { calculateHash } = require('./blockHash')

module.exports = function(index, data, previousHash) {
    const timestamp = new Date().getTime() / 1000
    const hash = calculateHash(index, previousHash, timestamp, data)

    return {
        index,
        timestamp,
        data,
        previousHash,
        hash
    }
}