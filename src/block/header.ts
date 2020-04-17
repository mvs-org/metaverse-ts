import { readUInt32LE, readSlice, hash256FromBuffer, toUInt32LE, IEncodable } from '../encoder/encoder'

export enum BlockVersion {
    POW = 1,
    POS = 2,
    DPOS = 3,
}

export interface IBlockHeader {
    version: BlockVersion
    previous_block: string
    merke_root: string,
    timestamp: number
    bits: string
    nonce: string
    mixhash: string
    number: number
}

export class BlockHeader implements IEncodable {
    static SIZE = 148
    constructor(
        public version: BlockVersion,
        public previous_block: string,
        public merke_root: string,
        public timestamp: number,
        public bits: string,
        public nonce: Buffer,
        public mixhash: string,
        public number: number,
    ) { }
    hash() {
        return hash256FromBuffer(this.toBuffer()).reverse()
    }
    toBuffer() {
        return Buffer.concat([
            toUInt32LE(this.version),
            Buffer.from(this.previous_block, 'hex').reverse(),
            Buffer.from(this.merke_root, 'hex').reverse(),
            toUInt32LE(this.timestamp),
            Buffer.from(this.bits, 'hex').reverse(),
            this.nonce,
            Buffer.from(this.mixhash, 'hex').reverse(),
            toUInt32LE(this.number),
        ], BlockHeader.SIZE)
    }
    toJSON(): IBlockHeader {
        return {
            version: this.version,
            previous_block: this.previous_block,
            merke_root: this.merke_root,
            timestamp: this.timestamp,
            bits: this.bits,
            nonce: this.nonce.toString('hex'),
            mixhash: this.mixhash,
            number: this.number,
        }
    }
    static decode(data: Buffer | string) {
        if (typeof data === 'string') {
            data = Buffer.from(data, 'hex')
        }
        const bufferstate = { buffer: data, offset: 0 }
        const version = readUInt32LE(bufferstate)
        return new BlockHeader(
            version,
            readSlice(bufferstate, 32).reverse().toString('hex'),
            readSlice(bufferstate, 32).reverse().toString('hex'),
            readUInt32LE(bufferstate),
            readSlice(bufferstate, 32).reverse().toString('hex'),
            readSlice(bufferstate, 8),
            readSlice(bufferstate, 32).reverse().toString('hex'),
            readUInt32LE(bufferstate),
        )
    }
}