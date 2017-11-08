import WebSocket from 'ws'
import constants from './lib/constants'
import difference from 'lodash/difference'

const { p2p_port, blockchainEvents, socketMessages } = constants

export default function( blockchain, database ) {
  const sockets = []
  const server  = new WebSocket.Server({ port: p2p_port })
  server.on('connection', ws => initConnection(ws))

  /* Messages */

  const queryChainLengthMsg = () => ({ 'type': socketMessages.QUERY_LATEST })
  const queryAllMsg         = () => ({ 'type': socketMessages.QUERY_ALL })
  const responseChainMsg    = async () => ({
    'type': socketMessages.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(await blockchain.getBlockchain())
  })
  const responseLatestMsg   = async () => ({
    'type': socketMessages.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify([ await blockchain.getLatestBlock() ])
  })

  /* Methods */

  function initConnection( ws ) {
    sockets.push(ws)

    ws.on('message', handleConnectionMessage(ws))
    ws.on('close', () => closeConnection(ws))
    ws.on('error', () => closeConnection(ws))

    send(ws, queryChainLengthMsg())
  }

  function handleConnectionMessage( ws ) {

    return async data => {
      const message = JSON.parse(data)

      switch( message.type ) {
        case socketMessages.QUERY_LATEST:
          send(ws, await responseLatestMsg())
          break
        case socketMessages.QUERY_ALL:
          send(ws, await responseChainMsg())
          break
        case socketMessages.RESPONSE_BLOCKCHAIN:
          await handleBlockchainResponse(message, ws)
          break
      }
    }
  }

  async function handleBlockchainResponse( message, ws ) {
    const newChain            = JSON.parse(message.data).sort(( b1, b2 ) => (b1.index - b2.index))
    const latestBlockReceived = newChain[ newChain.length - 1 ]
    const latestBlockHeld     = await blockchain.getLatestBlock()

    if( latestBlockReceived.index > latestBlockHeld.index ) {
      if( latestBlockHeld.hash === latestBlockReceived.previousHash ) {
        // Append received block to our chain
        await blockchain.addBlock(latestBlockReceived)
      } else if( newChain.length === 1 ) {
        // We need to get the whole chain to proceed
        broadcast(queryAllMsg())
      } else {
        // Replace with longer chain
        await blockchain.replace(newChain)
      }
    } else if( latestBlockReceived.index < latestBlockHeld.index ) {
      // New chain is shorter than our chain. Send our chain back.
      send(ws, await responseChainMsg())
    } else {
      console.log('Chain synced, nothing to update.')
    }
  }

  function closeConnection( ws ) {
    console.log('connection failed to peer: ' + ws.url)
    sockets.splice(sockets.indexOf(ws), 1)
    const peer = ws._socket.remoteAddress + ':' + ws._socket.remotePort
    database.setOption('peers', [ peer ], true)
  }

  function send( ws, message ) {
    ws.send(JSON.stringify(message))
  }

  function broadcast( message ) {
    sockets.forEach(socket => send(socket, message))
  }

  function connectToPeers( peers = [] ) {
    const newPeers = !Array.isArray(peers) ? [ peers ] : peers
    const connectedPeers = sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort)
    const unconnectedPeers = difference(newPeers, connectedPeers)

    unconnectedPeers.forEach(peer => {
      const ws = new WebSocket(peer)

      ws.on('open', () => {
        initConnection(ws)
        // Save the peer for the future
        database.setOption('peers', [ peer ])
      })
      ws.on('error', () => {
        console.log('connection failed')
      })
    })
  }

  function getPeers() {
    return sockets
  }

  /* Blockchain events */

  blockchain.events.on(blockchainEvents.REPLACE, async () => {
    broadcast(await responseLatestMsg())
  })

  blockchain.events.on(blockchainEvents.ADD, async () => {
    broadcast(await responseLatestMsg())
  })

  /* All done */

  console.log('listening websocket p2p port on: ' + p2p_port)

  return {
    initConnection,
    send,
    broadcast,
    connectToPeers,
    getPeers,
    responseLatestMsg,
    responseChainMsg
  }
};