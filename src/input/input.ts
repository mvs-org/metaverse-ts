import { toUInt32LE, toVarInt, readUInt32LE, readSlice, readString, IEncodable, BufferState } from '../encoder/encoder'
import { Script } from '../script/script'

export const INPUT_DEFAULT_SEQUENCE = -1

export interface IInput {
    prevOutId: string
    prevOutIndex: number
    script: string
    sequence: number
}

export class Input implements IEncodable {

    script: Buffer
    prevOutId: Buffer

    constructor(prevOutId: string | Buffer, public prevOutIndex: number, script: Buffer | string = Buffer.from(''), public sequence = INPUT_DEFAULT_SEQUENCE) {
        if (typeof prevOutId === 'string') {
            this.prevOutId = Buffer.from(prevOutId, 'hex')
            this.prevOutId.reverse()
        } else {
            this.prevOutId = prevOutId
        }
        this.prevOutIndex = prevOutIndex
        if (typeof script === 'string') {
            this.script = Script.toBuffer(script)
        } else {
            this.script = script
        }
    }

    static fromBuffer(buffer: Buffer) {
        return Input.decode({ buffer, offset: 0 })
    }

    static decode(bufferstate: BufferState) {
        return new Input(
            readSlice(bufferstate, 32),
            readUInt32LE(bufferstate),
            readString(bufferstate),
            readUInt32LE(bufferstate),
        )
    }

    toJSON(): IInput {
        return {
            prevOutId: Buffer.concat([this.prevOutId]).reverse().toString('hex'),
            prevOutIndex: this.prevOutIndex,
            script: Script.toString(this.script),
            sequence: this.sequence,
        }
    }

    clearScript() {
        this.script = Buffer.from('')
        return this
    }

    toString() {
        return this.toBuffer().toString('hex')
    }

    toBuffer() {
        return Buffer.concat([
            this.prevOutId,
            toUInt32LE(this.prevOutIndex >= 0 ? this.prevOutIndex : 0xffffffff),
            toVarInt(this.script.length),
            this.script,
            this.sequence >= 0 ? toUInt32LE(this.sequence) : toUInt32LE(0xffffffff),
        ])
    }
}