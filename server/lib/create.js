import Block from './block';
import message from './message';

export function createGenesisBlock() {
    const data = {
        message: message({ body: "Welcome to  Blockchat!", from: "genesis", to: "general" })
    }

    return new Block(0, data, "0")
}

export function createNextBlock(previousBlock, data = {}) {
    return new Block(previousBlock.index + 1, data, previousBlock.hash)
}
