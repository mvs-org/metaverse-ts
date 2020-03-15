import { Script } from '../script/script'
import { toUInt32LE, hash256FromBuffer } from '../encoder/encoder'
import { Transaction } from '../transaction/transaction'

const bip66: {
    decode: (buffer: Buffer) => { r: Buffer, s: Buffer },
    encode: (r: Buffer, s: Buffer) => Buffer,
    // tslint:disable-next-line: no-unsafe-any
} = require('bip66')


export const SIGHASH_ALL = 0x01
export const SIGHASH_NONE = 0x02
export const SIGHASH_SINGLE = 0x03
export const SIGHASH_ANYONECANPAY = 0x80

export class Signature {

    constructor(public signature: Buffer, public hashType = SIGHASH_ALL) {
        if ([SIGHASH_ALL, SIGHASH_NONE, SIGHASH_SINGLE].indexOf(this.getHashType()) === -1) {
            throw new Error('Invalid hashType ' + hashType)
        }
    }

    getHashType() {
        return this.hashType & ~SIGHASH_ANYONECANPAY
    }

    anyoneCanPay() {
        return (this.hashType & SIGHASH_ANYONECANPAY) > 0
    }

    toDER() {
        const r = Signature.toDER(this.signature.slice(0, 32))
        const s = Signature.toDER(this.signature.slice(32, 64))
        return bip66.encode(r, s)
    }

    toBuffer() {
        return Buffer.concat([this.toDER(), Buffer.of(this.hashType)])
    }

    static toDER(x: Buffer) {
        const ZERO = Buffer.alloc(1, 0)
        let i = 0
        while (x[i] === 0) ++i
        if (i === x.length) return ZERO
        x = x.slice(i)
        if (x[0] & 0x80) return Buffer.concat([ZERO, x], 1 + x.length)
        return x
    }

    static fromDER(x: Buffer) {
        if (x[0] === 0x00) x = x.slice(1)
        const buffer = Buffer.alloc(32, 0)
        const bstart = Math.max(0, 32 - x.length)
        x.copy(buffer, bstart)
        return buffer
    }

    static fromBuffer(buffer: Buffer) {
        const hashType = buffer.readUInt8(buffer.length - 1)
        const decoded = bip66.decode(buffer.slice(0, -1))
        const r = Signature.fromDER(decoded.r)
        const s = Signature.fromDER(decoded.s)
        const signature = Buffer.concat([r, s], 64)
        return new Signature(signature, hashType)
    }

    static hash(tx: Transaction, inputIndex: number, prevOutScript: string | Buffer, hashType = SIGHASH_ALL) {
        switch (hashType & ~SIGHASH_ANYONECANPAY) {
            case SIGHASH_ALL:
                break
            case SIGHASH_NONE:
                tx.outputs = []
                break
            case SIGHASH_SINGLE:
                if (inputIndex > tx.outputs.length - 1) {
                    throw Error('Matching output index not found')
                }
                tx.outputs = [tx.outputs[inputIndex]]
                break
            default:
                throw Error('Unsupported signature hash type')
        }
        if ((hashType & SIGHASH_ANYONECANPAY) === 0) {
            tx.inputs = tx.inputs.map((input) => input.clearScript())
        }
        tx.inputs[inputIndex].script = typeof prevOutScript === 'string' ? Script.toBuffer(prevOutScript) : prevOutScript
        return hash256FromBuffer(Buffer.concat([tx.toBuffer(), toUInt32LE(hashType)]))

    }

}
