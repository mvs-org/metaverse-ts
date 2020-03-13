import { toUInt32LE, toVarInt, readUInt32LE, readSlice, readString } from '../encoder/encoder'
import { Script } from '../script/script'

export const INPUT_DEFAULT_SEQUENCE = -1

export interface IInput {
    prevOutId: string
    prevOutIndex: number
    script: Buffer
    sequence: number
    clearScript: () => IInput
}

export class Input implements IInput {

    script: Buffer

    constructor(public prevOutId: string, public prevOutIndex: number, script: Buffer | string = Buffer.from(''), public sequence = INPUT_DEFAULT_SEQUENCE) {
        this.prevOutId = prevOutId
        this.prevOutIndex = prevOutIndex
        if (typeof script === 'string') {
            this.script = Script.fromASM(script)
        } else {
            this.script = script
        }
    }

    static fromBuffer(buffer: Buffer){
        return Input.decode({buffer, offset: 0})
    }

    static decode(bufferstate: { buffer: Buffer, offset: number }) {
        const prevId = readSlice(bufferstate, 32).reverse().toString('hex')
        const prevIndex = readUInt32LE(bufferstate)
        const script = readString(bufferstate)
        let sequence = readUInt32LE(bufferstate)
        return new Input(prevId, prevIndex, script, sequence)
    }

    toJSON() {
        return {
            prevOutId: this.prevOutId,
            prevOutIndex: this.prevOutIndex,
            script: Script.toASM(this.script),
            sequence: this.sequence,
        }
    }

    clearScript() {
        this.script = Buffer.from('')
        return this
    }

    toBuffer() {
        return Buffer.concat([
            Buffer.from(this.prevOutId, 'hex').reverse(),
            toUInt32LE(this.prevOutIndex),
            toVarInt(this.script.length),
            this.script,
            this.sequence > 0 ? toUInt32LE(this.sequence) : toUInt32LE(0xffffffff)
        ])
    }
}