const transactionSchema = require('../lib/schema/transaction')
const messageSchema = require('../lib/schema/message')
const message = require('../lib/message')
const { createNextBlock } = require('../lib/create')

module.exports = function(blockchain) {
 
  let transactions = []

  function createTransaction(transaction) {
    if(transactionSchema.validate(transaction)) {
      transactions.push(transaction)
      return transaction
    }

    return false
  }

  function clearTransactions() {
    transactions = []
  }

  function createMessage(messageData) {
    const blockMessage = message(messageData)

    if(!blockMessage) {
      return false
    }

    const previousBlock = blockchain.getLatestBlock();

    createTransaction({
      from: "network",
      to: blockMessage.from,
      amount: 1
    })

    const data = {
      message: blockMessage,
      transactions
    }

    clearTransactions()

    return createNextBlock(previousBlock, data)
  }

  return {
    createTransaction,
    createMessage
  }
}