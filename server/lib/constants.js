const constants = {
  blockchainEvents: {
    REPLACE: 'blockchainReplaced',
    ADD: 'blockAdded'
  },
  socketMessages: {
    QUERY_LATEST: 'queryLatest',
    QUERY_ALL: 'queryAll',
    RESPONSE_BLOCKCHAIN: 'responseBlockchain'
  },
  initialPeers: process.env.PEERS ? process.env.PEERS.split(',') : [],
  p2p_port: process.env.P2P_PORT || 6001,
  httpPort: process.argv[2] || process.env.PORT || 3001
}

export default constants