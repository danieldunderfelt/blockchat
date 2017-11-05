const express = require('express')
const bodyParser = require('body-parser')
const port = require('../lib/constants').httpPort

module.exports = function(blockchain, p2p, node) {
  const app = express()
  app.use(bodyParser.json())

  app.get('/blocks', (req, res) => res.json(blockchain.getBlockchain()))
  
  app.get('/peers', (req, res) => {
    res.send(p2p.getPeers().map(s => s._socket.remoteAddress + ':' + s._socket.remotePort))
})

  app.post('/transaction', (req, res) => {
    const txion = node.createTransaction(req.body)
    res.json(txion)
    console.log('Transaction added.')
  })
  
  app.post('/message', (req, res) => {
      const newBlock = node.createMessage(req.body)
      blockchain.addBlock(newBlock)
      p2p.broadcast(p2p.responseLatestMsg())
      res.json(newBlock)
      console.log('Message added to blockchain.')
  })

  app.post('/addPeer', (req, res) => {
      p2p.connectToPeers([ req.body.peer ])
      res.send()
      console.log('Connecting to peer ' + req.body.peer)
  })

  app.listen(port, () => console.log('Listening http on port: ' + port))
}