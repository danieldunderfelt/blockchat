import { calculateHashForBlock } from './blockHash'

export function validateBlock( block, previousBlock = { index: 0, hash: '0' } ) {
  if( previousBlock.index + 1 !== block.index ) {
    console.log('Blocks are not consecutive.', block, previousBlock)
    return false
  } else if( previousBlock.hash !== block.previousHash ) {
    console.log('Block hashes do not match.', block, previousBlock)
    return false
  } else if( calculateHashForBlock(block) !== block.hash ) {
    console.log('Calculated hash for block does not match.')
    return false
  }
  return true
}

export function validateChain( blockchainToValidate ) {
  return blockchainToValidate.every(( block, idx, chain ) => {
    return validateBlock(block, chain[ idx - 1 ])
  })
}