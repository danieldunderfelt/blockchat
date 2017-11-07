import { createGenesisBlock } from './lib/create'
import { validateChain, validateBlock } from './lib/validate'
import constants from './lib/constants'
import EventEmitter from 'events'

const { blockchainEvents } = constants

export default function(database) {
  const blockchain = database.get('Block')
  const emitter = new EventEmitter()

  if(blockchain.length === 0) {
    database
      .add('Block', createGenesisBlock())
      .then(() => emitter.emit(blockchainEvents.ADD))
      .catch(e => console.error('Genesis block write failed.', e))
  }

  function addBlock(block) {
    if(validateBlock(block, getLatestBlock())) {
      database
        .add('Block', block)
        .then(() => emitter.emit(blockchainEvents.ADD))
        .catch(e => console.error('Block add failed.', e))
    }
  }

  function getBlockchain() {
    let chain = Array.from(blockchain.sorted('index'))
    chain = chain.map(obj => database.normalizeObject(obj))
    return chain
  }

  function getLatestBlock() {
    const record = blockchain.sorted('index', true).slice(0, 1)[ 0 ]
    return database.normalizeObject(record)
  }

  function replace(newChain) {
    if(validateChain(newChain) && newChain.length > blockchain.length) {
      database.write(realm => {
        realm.delete(blockchain)
        newChain.forEach(block => realm.create('Block', block))
      }).then(() => {
        emitter.emit(blockchainEvents.REPLACE)
        console.log('Chain replaced.')
      }).catch(e => console.error(`Blockchain replace failed.`, e))
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