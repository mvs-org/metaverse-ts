import { Output, IOutput } from '../output/output'
import { IInput, Input } from '../input/input'
import { IEncodable, toUInt32LE, hash256FromBuffer, toVarInt, readVarInt } from '../encoder/encoder'
import { Signature } from '../signature/signature'
import { BIP32Interface } from 'bitcoinjs-lib'

export interface ITransaction {
    version: number
    inputs: IInput[]
    outputs: IOutput[]
    lock_time: number
}
export class Transaction implements IEncodable {

    constructor(
        public version = 4,
        public inputs: IInput[] = [],
        public outputs: IOutput[] = [],
        public lock_time: number = 0,
    ) { }

    toBuffer() {
        return Buffer.concat([
            this.encodeVersion(),
            toVarInt(this.inputs.length),
            this.encodeInputs(),
            toVarInt(this.outputs.length),
            this.encodeOutputs(),
            this.encodeLockTime(),
        ])
    }

    toString() {
        return this.toBuffer().toString('hex')
    }

    getId(format: 'buffer' | 'hex' = 'hex') {
        const buffer = hash256FromBuffer(this.toBuffer()).reverse()
        return format === 'buffer' ? buffer : buffer.toString('hex')
    }

    sign(inputIndex: number, node: BIP32Interface, prevOutScript: Buffer | string, hashType?: number) {
        const preparedHash = Signature.hash(this.clone(), inputIndex, prevOutScript, hashType)
        return new Signature(node.sign(preparedHash), hashType).toBuffer()
    }

    clone() {
        return new Transaction(this.version, this.inputs, this.outputs, this.lock_time)
    }

    encodeVersion() {
        return toUInt32LE(this.version)
    }

    static decodeVersion(bufferstate: { buffer: Buffer, offset: number }) {
        bufferstate.offset += 4
        return bufferstate.buffer.readInt32LE(bufferstate.offset - 4)
    }

    static decodeLocktime(bufferstate: { buffer: Buffer, offset: number }) {
        bufferstate.offset += 4
        return bufferstate.buffer.readInt32LE(bufferstate.offset - 4)
    }

    encodeInputs() {
        return Buffer.concat(this.inputs.map(input => input.toBuffer()))
    }

    encodeOutputs() {
        return Buffer.concat(this.outputs.map(output => output.toBuffer()))
    }

    toJSON() {
        return {
            version: this.version,
            inputs: this.inputs.map(input => input.toJSON()),
            outputs: this.outputs.map(output => output.toJSON()),
            lock_time: this.lock_time,
        }
    }

    encodeLockTime() {
        return toUInt32LE(this.lock_time)
    }

    static decode(data: Buffer | string) {
        if (typeof data === 'string') {
            data = Buffer.from(data, 'hex')
        }
        let offset = 0
        const tx = new Transaction()
        const bufferstate = { buffer: data, offset }
        tx.version = Transaction.decodeVersion(bufferstate)
        const numberOfInputs = readVarInt(bufferstate).number
        for (let i = 0; i < numberOfInputs; i++) {
            tx.inputs.push(Input.decode(bufferstate))
        }

        const numberOfOutputs = readVarInt(bufferstate).number
        for (let i = 0; i < numberOfOutputs; i++) {
            tx.outputs.push(Output.decode(bufferstate))
        }

        tx.lock_time = Transaction.decodeLocktime(bufferstate)
        return tx
    }

}