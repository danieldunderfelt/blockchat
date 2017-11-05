const initP2P = require('./p2p')
const initHttp = require('./http')
const createBlockchain = require('./chain')
const createNode = require('./node')
const { initialPeers } = require('../lib/constants')

const blockchain = createBlockchain()
const p2p = initP2P(blockchain)
const node = createNode(blockchain)
const http = initHttp(blockchain, p2p, node)

p2p.connectToPeers(initialPeers)

console.log('Blockchat node running.')