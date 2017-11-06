import initP2P from './p2p'
import initHttp from './http'

import createBlockchain, {
  BlockSchema,
  DataSchema,
  TransactionSchema,
  MessageSchema
} from './chain'

import createNode from './node'
import constants from './lib/constants'
import Realm from 'realm'

const { hostname, httpPort } = constants

Realm.open({
    path: `realms/BlockChat_node_${ hostname }_${ httpPort }.realm`,
    schema: [ BlockSchema, DataSchema, TransactionSchema, MessageSchema ],
    schemaVersion: 2,
    deleteRealmIfMigrationNeeded: true
  })
  .then(realm => {
    const blockchain = createBlockchain(realm)
    const p2p        = initP2P(blockchain)
    const node       = createNode(blockchain)
    const http       = initHttp(blockchain, p2p, node)

    p2p.connectToPeers(constants.initialPeers)

    console.log('Blockchat node running.')
  })