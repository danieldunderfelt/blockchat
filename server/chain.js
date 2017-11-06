import { createGenesisBlock } from './lib/create'
import { validateChain, validateBlock } from './lib/validate'
import constants from './lib/constants'
import EventEmitter from 'events'
import block from './lib/block'

export const BlockSchema = {
  name: 'Block',
  primaryKey: 'hash',
  properties: {
    index: { type: 'int', indexed: true },
    timestamp: 'date',
    data: 'BlockData',
    previousHash: { type: 'string', indexed: true },
    hash: 'string'
  }
}

export const DataSchema = {
  name: 'BlockData',
  properties: {
    message: 'BlockMessage',
    transactions: 'Transaction[]'
  }
}

export const TransactionSchema = {
  name: 'Transaction',
  properties: {
    from: 'string',
    to: 'string',
    amount: 'double'
  }
}

export const MessageSchema = {
  name: 'BlockMessage',
  properties: {
    from: 'string',
    to: 'string',
    body: 'string'
  }
}

const { blockchainEvents } = constants

export default function(realm) {
  const blockchain = realm.objects('Block')
  const emitter = new EventEmitter()

  if(blockchain.length === 0) {
    try {
      realm.write(() => {
        realm.create('Block', createGenesisBlock())
      })
    } catch(e) {
      console.error('Genesis block write failed.', e)
    }
  }

  function addBlock(block) {
    if(validateBlock(block, getLatestBlock())) {
      try {
        realm.write(() => {
          realm.create('Block', block)
        })
        emitter.emit(blockchainEvents.ADD)
      } catch(e) {
        console.error('Block add failed.', block)
      }
    }
  }

  function getBlockchain() {
    return Array.from(blockchain.sorted('index').values())
  }

  function getLatestBlock() {
    return blockchain.sorted('index', true).slice(0, 1)[0]
  }

  function replace(newChain) {
    if(validateChain(newChain) && newChain.length > blockchain.length) {
      realm.write(() => {
        // Replace chain
        realm.delete(blockchain)

        newChain.forEach(block => {
          realm.create('Block', block)
        })
      })

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