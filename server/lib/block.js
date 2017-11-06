import crypto from 'crypto';
import { calculateHash } from './blockHash';

export default function(index, data, previousHash) {
    const timestamp = new Date().getTime() / 1000
    const hash = calculateHash(index, previousHash, timestamp, data)

    return {
        index,
        timestamp,
        data,
        previousHash,
        hash
    }
};