
export const SIGHASH_ANYONECANPAY = 0x80

export const SIGHASH_ALL = 0x01
export const SIGHASH_NONE = 0x02
export const SIGHASH_SINGLE = 0x03

export class Signature {

    constructor(public signature: Buffer, public hashType: number) {
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
        return Signature.toDER(this.signature)
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

    static decode(buffer: Buffer) {
        if (buffer.length < 8) throw new Error('DER sequence length is too short')
        if (buffer.length > 72) throw new Error('DER sequence length is too long')
        if (buffer[0] !== 0x30) throw new Error('Expected DER sequence')
        if (buffer[1] !== buffer.length - 2) throw new Error('DER sequence length is invalid')
        if (buffer[2] !== 0x02) throw new Error('Expected DER integer')

        let lenR = buffer[3]
        if (lenR === 0) throw new Error('R length is zero')
        if (5 + lenR >= buffer.length) throw new Error('R length is too long')
        if (buffer[4 + lenR] !== 0x02) throw new Error('Expected DER integer (2)')

        let lenS = buffer[5 + lenR]
        if (lenS === 0) throw new Error('S length is zero')
        if ((6 + lenR + lenS) !== buffer.length) throw new Error('S length is invalid')

        if (buffer[4] & 0x80) throw new Error('R value is negative')
        if (lenR > 1 && (buffer[4] === 0x00) && !(buffer[5] & 0x80)) throw new Error('R value excessively padded')

        if (buffer[lenR + 6] & 0x80) throw new Error('S value is negative')
        if (lenS > 1 && (buffer[lenR + 6] === 0x00) && !(buffer[lenR + 7] & 0x80)) throw new Error('S value excessively padded')

        // non-BIP66 - extract R, S values
        return {
            r: buffer.slice(4, 4 + lenR),
            s: buffer.slice(6 + lenR),
        }
    }

    static fromBuffer(buffer: Buffer) {
        const hashType = buffer.readUInt8(buffer.length - 1)
        const decoded = Signature.decode(buffer.slice(0, -1))
        const signature = Buffer.concat([
            Signature.fromDER(decoded.r),
            Signature.fromDER(decoded.s),
        ], 64)
        return new Signature(signature, hashType)
    }
}

