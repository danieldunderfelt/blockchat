import message from './lib/message'
import { createNextBlock } from './lib/create'
import yup from 'yup'

const transactionSchema = yup.object().shape({
  from: yup.string().required(),
  to: yup.string().required(),
  amount: yup.number().required().positive()
})

const messageSchema = yup.object().shape({
  from: yup.string().required(),
  to: yup.string().required(),
  body: yup.string().required()
})

function validate( schema, data ) {
  return schema.validateSync(data, { strict: true, abortEarly: true })
}

export default function( blockchain ) {
  let transactions = []

  function createTransaction( transaction ) {
    if( validate(transactionSchema, transaction) ) {
      transactions.push(transaction)
      return transaction
    }

    return false
  }

  function clearTransactions() {
    transactions = []
  }

  async function createMessage( messageData ) {
    const blockMessage = message(messageData)

    if( !validate(messageSchema, blockMessage) ) {
      return false
    }

    const previousBlock = await blockchain.getLatestBlock()

    createTransaction({
      from: 'network',
      to: blockMessage.from,
      amount: 1
    })

    const data = {
      message: blockMessage,
      transactions: transactions.slice()
    }

    clearTransactions()

    const newBlock = createNextBlock(previousBlock, data)
    await blockchain.addBlock(newBlock)

    return newBlock
  }

  return {
    createTransaction,
    createMessage
  }
}