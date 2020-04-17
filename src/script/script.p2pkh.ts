import { toUInt8, toVarStr } from '../encoder/encoder'
import { Script } from '.'
const OPS = require('metaverse-ops')
const base58check: {
    encode: (buffer: Buffer, version: string) => Buffer,
    decode: (address: string) => { data: Buffer, prefix: Buffer },
    // tslint:disable-next-line: no-unsafe-any
} = require('base58check')

export class ScriptP2PKH extends Script {
    address: string

    constructor(address: string) {
        super('P2PKH')
        this.address = address
    }

    toBuffer() {
        return Buffer.concat([
            toUInt8(OPS.OP_DUP),
            toUInt8(OPS.OP_HASH160),
            toVarStr(base58check.decode(this.address).data.toString('hex'), 'hex'),
            toUInt8(OPS.OP_EQUALVERIFY),
            toUInt8(OPS.OP_CHECKSIG),
        ])
    }
}