import express from 'express'
import bodyParser from 'body-parser'
import constants from './lib/constants'

const { httpPort: port } = constants

export default function( blockchain, p2p, node ) {
  const app = express()
  app.use(bodyParser.json())

  app.get('/blocks', ( req, res ) => res.json(blockchain.getBlockchain()))

  app.get('/peers', ( req, res ) => {
    res.send(p2p.getPeers().map(s => s._socket.remoteAddress + ':' + s._socket.remotePort))
  })

  app.post('/transaction', ( req, res ) => {
    const txion = node.createTransaction(req.body)
    res.json(txion)
    console.log('Transaction added.')
  })

  app.post('/message', ( req, res ) => {
    const newBlock = node.createMessage(req.body)
    res.json(newBlock)
    console.log('Message added to blockchain.', newBlock)
  })

  app.post('/addPeer', ( req, res ) => {
    p2p.connectToPeers([ req.body.peer ])

    res.send(`Connecting to peer ${ req.body.peer }`)
    console.log(`Connecting to peer ${ req.body.peer }`)
  })

  app.listen(port, () => console.log('Listening http on port: ' + port))
}