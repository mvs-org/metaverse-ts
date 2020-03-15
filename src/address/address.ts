import { Network } from 'bitcoinjs-lib'
const base58check: {
    encode: (buffer: Buffer, version: string) => Buffer,
    decode: (address: string) => { data: Buffer, prefix: Buffer },
    // tslint:disable-next-line: no-unsafe-any
} = require('base58check')
import { DEFAULT_NETWORK } from '../network/network'
import { toUInt8 } from '../encoder/encoder'

export class Address {
    static toBase58(address: string | Buffer, config: number | Network = DEFAULT_NETWORK, format: 'hex' | 'buffer' = 'buffer'): string | Buffer {
        let version: number
        if (typeof config !== 'number') {
            version = config.pubKeyHash
        } else {
            version = config
        }
        const buffer: Buffer = base58check.encode(typeof address === 'string' ? Buffer.from(address, 'hex') : address, toUInt8(version).toString('hex'))
        return format === 'hex' ? buffer.toString('hex') : buffer
    }
    static fromBase58(address: string, format: 'hex' | 'buffer' = 'buffer') {
        const buffer = base58check.decode(address).data
        return format === 'hex' ? buffer.toString('hex') : buffer
    }
}