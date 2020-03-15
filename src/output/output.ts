import { Script, ScriptP2PKH } from '../script/script'
import { IAttachment, AttachmentETPTransfer, Attachment } from '../attachment/attachment'
import { readString, toUInt64LE, readInt64LE, toVarInt, IEncodable } from '../encoder/encoder'

export interface IOutput extends IEncodable {
    value: number
    script: Buffer
}

export class Output implements IOutput {
    value: number
    attachment: IAttachment
    script: Buffer

    constructor(value: number, attachment: IAttachment, script: Script | string | Buffer) {
        this.value = value
        this.attachment = attachment
        if (typeof script === 'string') {
            this.script = Script.toBuffer(script)
        } else if (Buffer.isBuffer(script)) {
            this.script = script
        } else {
            this.script = script.toBuffer()
        }
    }

    toJSON() {
        return {
            value: this.value,
            script: Script.toString(this.script),
            attachment: this.attachment.toJSON(),
        }
    }

    toString(){
        return this.toBuffer().toString('hex')
    }

    toBuffer() {
        return Buffer.concat([
            toUInt64LE(this.value),
            toVarInt(this.script.length),
            this.script,
            this.attachment.toBuffer(),
        ])
    }

    static fromBuffer(buffer: Buffer){
        return Output.decode({buffer, offset: 0})
    }

    static decode(bufferstate: { buffer: Buffer, offset: number }) {
        const value = readInt64LE(bufferstate)
        const script = Script.toString(readString(bufferstate))
        const attachment = Attachment.decode(bufferstate)
        return new Output(value, attachment, script)
    }

}

export class OutputETPTransfer extends Output {
    constructor(address: string, value: number) {
        super(value, new AttachmentETPTransfer(), new ScriptP2PKH(address))
    }
}