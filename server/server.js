import initP2P from './p2p'
import initHttp from './http'
import createBlockchain from './chain'
import createDatabase from './database'
import createNode from './node'
import constants from './lib/constants'

const { initialPeers } = constants

createDatabase(async database => {
  const blockchain = await createBlockchain(database)
  const p2p        = initP2P(blockchain, database)
  const node       = createNode(blockchain)
  const http       = initHttp(blockchain, p2p, node)

  let savedPeers = await database.getOption('peers')
  savedPeers = Array.isArray(savedPeers) && savedPeers.length > 0 ? savedPeers : []
  p2p.connectToPeers(savedPeers.concat(initialPeers))

  console.log('Blockchat node running.')
})