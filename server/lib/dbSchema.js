export const BlockSchema = {
  name: 'Block',
  primaryKey: 'hash',
  properties: {
    index: { type: 'int', indexed: true },
    timestamp: 'int',
    data: 'BlockData',
    previousHash: { type: 'string', indexed: true },
    hash: 'string'
  }
}

export const DataSchema = {
  name: 'BlockData',
  properties: {
    message: 'BlockMessage',
    transactions: 'Transaction[]'
  }
}

export const TransactionSchema = {
  name: 'Transaction',
  properties: {
    from: 'string',
    to: 'string',
    amount: 'double'
  }
}

export const MessageSchema = {
  name: 'BlockMessage',
  properties: {
    from: 'string',
    to: 'string',
    body: 'string'
  }
}

export const NodeSchema = {
  name: 'Node',
  properties: {
    p2puri: 'string?',
    httpuri: 'string?'
  }
}