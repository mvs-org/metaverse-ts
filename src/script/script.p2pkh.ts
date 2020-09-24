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

    static getPubkey(script: string): Buffer {
        if (!this.isP2PKH(this.fromFullnode(script))) {
            throw Error('illegal script type')
        }
        return this.fromFullnode(script).slice(3, 23)
    }

    static isP2PKH(script: Buffer) {
        return script.length === 25
            && script[0] === OPS.OP_DUP
            && script[1] === OPS.OP_HASH160
            && script[23] === OPS.OP_EQUALVERIFY
            && script[24] === OPS.OP_CHECKSIG
    }
}