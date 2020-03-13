import { encode, decode, } from 'varuint-bitcoin'
import { createHash } from 'crypto'

export type VarStrEncoding = 'utf-8' | 'ascii' | 'hex'

export interface IEncodable {
    toBuffer: () => Buffer
    toJSON: () => Promise<any> | any
}

export function toUInt32LE(number: number): Buffer {
    var buffer = Buffer.alloc(8);
    return buffer.slice(0, buffer.writeUInt32LE(number, 0));
}

export function verifuint(value: number, max: number) {
    if (typeof value !== 'number') throw new Error('cannot write a non-number as a number')
    if (value < 0) throw new Error('specified a negative value for writing an unsigned value')
    if (value > max) throw new Error('RangeError: value out of range')
    if (Math.floor(value) !== value) throw new Error('value has a fractional component')
}

export function toUInt8(number: number): Buffer {
    var buffer = Buffer.alloc(8);
    return buffer.slice(0, buffer.writeUInt8(number, 0));
}

export function fromInt64LE(bufferstate: {buffer: Buffer, offset: number}): number {
    var a = bufferstate.buffer.readUInt32LE(bufferstate.offset)
    var b = bufferstate.buffer.readUInt32LE(bufferstate.offset+4)
    b *= 0x100000000
    bufferstate.offset+=8
    verifuint(b + a, 0x01ffffffffffffff)
    return b + a
}

export function toUInt64LE (value: number) {

    verifuint( Number(value), 0x01ffffffffffffff)
  
    const buffer = Buffer.allocUnsafe(8)
    buffer.writeInt32LE(Number(value) & -1, 0)
    buffer.writeUInt32LE(Math.floor(Number(value) / 0x100000000), 4)
    return buffer
  }

export function toVarStr(str: string, encoding: VarStrEncoding = 'utf-8'): Buffer {
    var payload = Buffer.from(str, encoding);
    return Buffer.concat([
        toVarInt(payload.length),
        payload
    ])
}

export function toVarInt(number: number): Buffer {
    return encode(number)
}

export function sha256FromBuffer(buffer: Buffer): Buffer {
    return createHash('sha256').update(buffer).digest()
}

export function hash256FromBuffer(buffer: Buffer): Buffer {
    return sha256FromBuffer(sha256FromBuffer(buffer));
}

export function readString(bufferstate: {buffer: Buffer, offset: number}): Buffer {
    var length = readVarInt(bufferstate);
    return readSlice(bufferstate, length.number);
}

export function readSlice(bufferstate: {buffer: Buffer, offset: number}, n: number): Buffer {
    bufferstate.offset += n;
    return bufferstate.buffer.slice(bufferstate.offset - n, bufferstate.offset);
}

export function readInt8(bufferstate: {buffer: Buffer, offset: number}) {
    bufferstate.offset++
    return bufferstate.buffer.readInt8(bufferstate.offset - 1)
}

export function readUInt32LE(bufferstate: {buffer: Buffer, offset: number}) {
    bufferstate.offset += 4
    return bufferstate.buffer.readInt32LE(bufferstate.offset - 4)
}

export function readVarInt(bufferstate: {buffer: Buffer, offset: number}): { number: number, size: number } {
    var result = decode(bufferstate.buffer, bufferstate.offset)
    const size = decode.bytes
    bufferstate.offset+=size
    return {
        number: result,
        size,
    }
}