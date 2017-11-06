import { createGenesisBlock } from './lib/create'
import { validateChain, validateBlock } from './lib/validate'
import constants from './lib/constants'
import EventEmitter from 'events'

const { blockchainEvents } = constants

export default function(initialChain = [ createGenesisBlock() ]) {
  let blockchain = initialChain
  const emitter = new EventEmitter()

  function addBlock(block) {
    if(validateBlock(block, getLatestBlock())) {
      blockchain.push(block)
      emitter.emit(blockchainEvents.ADD)
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
      emitter.emit(blockchainEvents.REPLACE)
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