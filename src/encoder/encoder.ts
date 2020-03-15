import { encode, decode } from 'varuint-bitcoin'
import { createHash } from 'crypto'

export type BufferState = {
    buffer: Buffer,
    offset: number,
}

export type VarStrEncoding = 'utf-8' | 'ascii' | 'hex'

export interface IEncodable {
    toBuffer: () => Buffer
    toJSON: () => Promise<object> | object
}

export function toUInt32LE(number: number): Buffer {
    const buffer = Buffer.alloc(8)
    return buffer.slice(0, buffer.writeUInt32LE(number, 0))
}

export function verifuint(value: number, max: number) {
    if (typeof value !== 'number') throw new Error('cannot write a non-number as a number')
    if (value < 0) throw new Error('specified a negative value for writing an unsigned value')
    if (value > max) throw new Error('RangeError: value out of range')
    if (Math.floor(value) !== value) throw new Error('value has a fractional component')
}

export function toUInt8(number: number): Buffer {
    const buffer = Buffer.alloc(8)
    return buffer.slice(0, buffer.writeUInt8(number, 0))
}

export function readInt64LE(bufferstate: { buffer: Buffer, offset: number }): number {
    const a = bufferstate.buffer.readUInt32LE(bufferstate.offset)
    let b = bufferstate.buffer.readUInt32LE(bufferstate.offset + 4)
    b *= 0x100000000
    bufferstate.offset += 8
    verifuint(b + a, 0x01ffffffffffffff)
    return b + a
}

export function toUInt64LE(value: number) {

    verifuint(Number(value), 0x01ffffffffffffff)

    const buffer = Buffer.allocUnsafe(8)
    buffer.writeInt32LE(Number(value) & -1, 0)
    buffer.writeUInt32LE(Math.floor(Number(value) / 0x100000000), 4)
    return buffer
}

export function toVarStr(str: string, encoding: VarStrEncoding = 'utf-8'): Buffer {
    const payload = Buffer.from(str, encoding)
    return Buffer.concat([
        toVarInt(payload.length),
        payload,
    ])
}

export function toVarInt(number: number): Buffer {
    return encode(number)
}

export function sha256FromBuffer(buffer: Buffer): Buffer {
    return createHash('sha256').update(buffer).digest()
}

export function hash256FromBuffer(buffer: Buffer): Buffer {
    return sha256FromBuffer(sha256FromBuffer(buffer))
}

export function readString(bufferstate: BufferState): Buffer {
    const length = readVarInt(bufferstate)
    return readSlice(bufferstate, length.number)
}

export function readSlice(bufferstate: BufferState, n: number): Buffer {
    bufferstate.offset += n
    return bufferstate.buffer.slice(bufferstate.offset - n, bufferstate.offset)
}

export function readInt8(bufferstate: BufferState) {
    bufferstate.offset++
    return bufferstate.buffer.readInt8(bufferstate.offset - 1)
}

export function readUInt32LE(bufferstate: BufferState) {
    bufferstate.offset += 4
    return bufferstate.buffer.readInt32LE(bufferstate.offset - 4)
}

export function readVarInt(bufferstate: BufferState): { number: number, size: number } {
    const result = decode(bufferstate.buffer, bufferstate.offset)
    const size = decode.bytes
    bufferstate.offset += size
    return {
        number: result,
        size,
    }
}