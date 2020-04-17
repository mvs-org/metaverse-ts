import { Script, ScriptP2PKH } from '../script/script'
import { IAttachment, AttachmentETPTransfer, Attachment, AttachmentMessage, AttachmentMSTTransfer, AttachmentMSTIssue } from '../attachment/attachment'
import { readString, toUInt64LE, readInt64LE, toVarInt, IEncodable } from '../encoder/encoder'

export interface IOutput {
    value: number
    script: string
    attachment: object
}

export class Output implements IEncodable {
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

    toJSON(): IOutput {
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

export class OutputMessage extends Output {
    constructor(data: string, address: string) {
        super(0, new AttachmentMessage(data), new ScriptP2PKH(address))
    }
}

export class OutputETPTransfer extends Output {
    constructor(address: string, value: number) {
        super(value, new AttachmentETPTransfer(), new ScriptP2PKH(address))
    }
}

export class OutputMSTTransfer extends Output {
    constructor(address: string, symbol: string, quantity: number, value = 0) {
        super(value, new AttachmentMSTTransfer(symbol, quantity), new ScriptP2PKH(address))
    }
}

export class OutputMSTIssue extends Output {
    constructor(address: string, issuer: string, symbol: string, maxSupply: number, precision = 0, description: string, etpValue: number, secondaryIssueThreshold: number) {
        super(etpValue, new AttachmentMSTIssue(symbol, maxSupply, precision, secondaryIssueThreshold, issuer, address, description), new ScriptP2PKH(address))
    }
}