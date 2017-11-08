import { createGenesisBlock } from './lib/create'
import { validateChain, validateBlock } from './lib/validate'
import constants from './lib/constants'
import EventEmitter from 'events'

const { blockchainEvents } = constants

export default async function(database) {
  const blockchain = await database.get('Block')
  const emitter = new EventEmitter()

  if(blockchain.length === 0) {
    database
      .add('Block', createGenesisBlock())
      .then(() => {
        emitter.emit(blockchainEvents.ADD)
        console.log('Genesis block created')
      })
      .catch(e => console.error('Genesis block write failed.', e))
  }

  async function addBlock(block) {
    if(validateBlock(block, await getLatestBlock())) {
      try {
        await database.add('Block', block)
        emitter.emit(blockchainEvents.ADD)
      } catch(e) {
        console.error('Block add failed.', e)
      }
    }
  }

  async function getBlockchain() {
    return await database.get('Block')
  }

  async function getLatestBlock() {
    return await database.getLatest('Block')
  }

  async function replace(newChain) {
    if(validateChain(newChain) && newChain.length > blockchain.length) {
      try {
        await database.remove('Block')
        await database.add(newChain)

        emitter.emit(blockchainEvents.REPLACE)
        console.log('Chain replaced.')
      } catch(e) {
        console.error(`Blockchain replace failed.`, e)
      }
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