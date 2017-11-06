import WebSocket from 'ws'
import constants from './lib/constants'

const { p2p_port, blockchainEvents, socketMessages } = constants

export default function( blockchain ) {
  const sockets = []
  const server  = new WebSocket.Server({ port: p2p_port })
  server.on('connection', ws => initConnection(ws))

  /* Messages */

  const queryChainLengthMsg = () => ({ 'type': socketMessages.QUERY_LATEST })
  const queryAllMsg         = () => ({ 'type': socketMessages.QUERY_ALL })
  const responseChainMsg    = () => ({
    'type': socketMessages.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(blockchain.getBlockchain())
  })
  const responseLatestMsg   = () => ({
    'type': socketMessages.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify([ blockchain.getLatestBlock() ])
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

    return data => {
      const message = JSON.parse(data)

      switch( message.type ) {
        case socketMessages.QUERY_LATEST:
          send(ws, responseLatestMsg())
          break
        case socketMessages.QUERY_ALL:
          send(ws, responseChainMsg())
          break
        case socketMessages.RESPONSE_BLOCKCHAIN:
          const result = handleBlockchainResponse(message, ws)
          break
      }
    }
  }

  function handleBlockchainResponse( message, ws ) {
    const newChain            = JSON.parse(message.data).sort(( b1, b2 ) => (b1.index - b2.index))
    const latestBlockReceived = newChain[ newChain.length - 1 ]
    const latestBlockHeld     = blockchain.getLatestBlock()

    if( latestBlockReceived.index > latestBlockHeld.index ) {
      if( latestBlockHeld.hash === latestBlockReceived.previousHash ) {
        // Append received block to our chain
        blockchain.addBlock(latestBlockReceived)
      } else if( newChain.length === 1 ) {
        // We need to get the whole chain to proceed
        broadcast(queryAllMsg())
      } else {
        // Replace with longer chain
        blockchain.replace(newChain)
      }
    } else if( latestBlockReceived.index < latestBlockHeld.index ) {
      // New chain is shorter than our chain. Send our chain back.
      send(ws, responseChainMsg())
    } else {
      console.log('Chain synced, nothing to update.')
    }
  }

  function closeConnection( ws ) {
    console.log('connection failed to peer: ' + ws.url)
    sockets.splice(sockets.indexOf(ws), 1)
  }

  function send( ws, message ) {
    ws.send(JSON.stringify(message))
  }

  function broadcast( message ) {
    sockets.forEach(socket => send(socket, message))
  }

  function connectToPeers( peers = [] ) {
    peers.forEach(peer => {
      const ws = new WebSocket(peer)

      ws.on('open', () => initConnection(ws))
      ws.on('error', () => {
        console.log('connection failed')
      })
    })
  }

  function getPeers() {
    return sockets
  }

  /* Blockchain events */

  blockchain.events.on(blockchainEvents.REPLACE, () => {
    broadcast(responseLatestMsg())
  })

  blockchain.events.on(blockchainEvents.ADD, () => {
    broadcast(responseLatestMsg())
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