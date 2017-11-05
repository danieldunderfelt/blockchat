const { createGenesisBlock } = require('../lib/create')
const { validateChain, validateBlock } = require('../lib/validate')
const { blockchainEvents: events } = require('../lib/constants')
const EventEmitter = require('events')

module.exports = function() {
  let blockchain = [ createGenesisBlock() ]
  const emitter = new EventEmitter()

  function addBlock(block) {
    if(validateBlock(block, getLatestBlock())) {
      blockchain.push(block)
      emitter.emit(events.ADD)
    }
  }

  function getBlockchain() {
    return blockchain
  }

  function getLatestBlock() {
    return blockchain[blockchain.length - 1]
  }

  function replace(newChain) {
    if(validateChain(newChain) && newChain.length > blockchain.length) {
      blockchain = newChain
      emitter.emit(events.REPLACE)
      console.log('Chain replaced.')
    } else {
      console.warn('New chain failed validation. Not replaced.')
    }
  }

  return {
    events: emitter,
    addBlock,
    getBlockchain,
    getLatestBlock,
    validateChain,
    replace
  }
}