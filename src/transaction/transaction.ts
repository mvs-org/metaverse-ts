import { Output, IOutput } from '../output/output'
import { IInput, Input } from '../input/input'
import { IEncodable, toUInt32LE, hash256FromBuffer, toVarInt, readVarInt, BufferState } from '../encoder/encoder'
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
        public inputs: Input[] = [],
        public outputs: Output[] = [],
        public lock_time: number = 0,
    ) { }

    /**
     * Serializes the transaction as a buffer.
     *
     * @returns buffer
     */
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

    /**
     * Serializes the transaction into hex encoded string.
     *
     * @returns hex encoded string
     */
    toString() {
        return this.toBuffer().toString('hex')
    }

    /**
     * Get the transaction id
     *
     * @param format hex or buffer format
     * @returns txid as string or buffer depending on the chosen format
     */
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

    toJSON(): ITransaction {
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

    static decode(data: Buffer | string | BufferState) {
        if (typeof data === 'string') {
            data = { buffer: Buffer.from(data, 'hex'), offset: 0 }
        } else if (Buffer.isBuffer(data)) {
            data = { buffer: data, offset: 0 }
        }
        const tx = new Transaction()
        tx.version = Transaction.decodeVersion(data)
        const numberOfInputs = readVarInt(data).number
        for (let i = 0; i < numberOfInputs; i++) {
            tx.inputs.push(Input.decode(data))
        }

        const numberOfOutputs = readVarInt(data).number
        for (let i = 0; i < numberOfOutputs; i++) {
            tx.outputs.push(Output.decode(data))
        }

        tx.lock_time = Transaction.decodeLocktime(data)
        return tx
    }

}