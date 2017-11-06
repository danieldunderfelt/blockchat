import initP2P from './p2p';
import initHttp from './http';
import createBlockchain from './chain';
import createNode from './node';
import constants from './lib/constants';

const blockchain = createBlockchain()
const p2p = initP2P(blockchain)
const node = createNode(blockchain)
const http = initHttp(blockchain, p2p, node)

p2p.connectToPeers(constants.initialPeers)

console.log('Blockchat node running.')