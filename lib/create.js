const Block = require("./block");
const message = require("./message");

const createGenesisBlock = function() {
    const data = {
        message: message({ body: "Welcome to  Blockchat!", from: "genesis", to: "general" })
    }

    return new Block(0, data, "0")
}

const createNextBlock = function(previousBlock, data = {}) {
    return new Block(previousBlock.index + 1, data, previousBlock.hash)
}

module.exports = {
  createGenesisBlock,
  createNextBlock
}
