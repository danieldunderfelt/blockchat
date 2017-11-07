import initP2P from './p2p'
import initHttp from './http'
import createBlockchain from './chain'
import createDatabase from './database'
import createNode from './node'
import constants from './lib/constants'

const { initialPeers } = constants

createDatabase(database => {
  const blockchain = createBlockchain(database)
  const p2p        = initP2P(blockchain, database)
  const node       = createNode(blockchain)
  const http       = initHttp(blockchain, p2p, node)

  //const peers = database.get('Node').map(nodeObj => nodeObj.p2puri).concat(initialPeers)
  p2p.connectToPeers(initialPeers)

  console.log('Blockchat node running.')
})