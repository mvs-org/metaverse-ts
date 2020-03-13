import { IEncodable, toUInt32LE, readUInt32LE, readString, toVarStr, readInt64LE, readInt8, toUInt64LE, toUInt8, } from '../encoder/encoder'

export const ATTACHMENT_TYPE_ETP_TRANSFER = 0
export const ATTACHMENT_TYPE_MST = 2
export const ATTACHMENT_TYPE_MESSAGE = 3

export const ATTACHMENT_VERSION_DEFAULT = 1
export const ATTACHMENT_VERSION_DID = 207

export const MST_STATUS_ISSUE = 1
export const MST_STATUS_TRANSFER = 2

export interface IAttachment extends IEncodable {
    type: number
    version: number
    from_did?: string
    to_did?: string
    setDid(from: string, to: string): IAttachment
}

export abstract class Attachment implements IAttachment {
    type: number
    version: number
    from_did?: string
    to_did?: string
    constructor(type: number, version = 1) {
        this.type = type
        this.version = version
    }
    toBuffer() {
        return Buffer.from('')
    }
    toJSON() {
        return this
    }
    setDid(from: string, to: string) {
        this.from_did = from
        this.to_did = to
        return this
    }
    static fromBuffer(buffer: Buffer){
        return Attachment.decode({buffer, offset: 0})
    }
    static decode(bufferstate: { buffer: Buffer, offset: number }) {
        const version = readUInt32LE(bufferstate)
        const type = readUInt32LE(bufferstate)

        let attachment

        switch (type) {
            case ATTACHMENT_TYPE_ETP_TRANSFER:
                attachment = new AttachmentETPTransfer(version)
                if (version === ATTACHMENT_VERSION_DID) {
                    attachment.setDid(readString(bufferstate).toString(), readString(bufferstate).toString())
                }
                break
            case ATTACHMENT_TYPE_MESSAGE:
                const data = readString(bufferstate)
                attachment = new AttachmentMessage(data.toString(), version)
                if (version === ATTACHMENT_VERSION_DID) {
                    attachment.setDid(readString(bufferstate).toString(), readString(bufferstate).toString())
                }
                break
            case ATTACHMENT_TYPE_MST:
                const mstStatus = readUInt32LE(bufferstate)
                switch (mstStatus) {
                    case MST_STATUS_ISSUE:
                        const symbol = readString(bufferstate).toString()
                        const maxSupply = readInt64LE(bufferstate)
                        const precision = readInt8(bufferstate)
                        const secondaryIssueThreshold = readInt8(bufferstate)
                        bufferstate.offset += 2
                        const issuer = readString(bufferstate).toString()
                        const address = readString(bufferstate).toString()
                        const description = readString(bufferstate).toString()
                        attachment = new AttachmentMSTIssue(
                            symbol,
                            maxSupply,
                            precision,
                            secondaryIssueThreshold,
                            issuer,
                            address,
                            description,
                        )
                        break
                    case MST_STATUS_TRANSFER:
                        attachment = new AttachmentMSTTransfer(
                            readString(bufferstate).toString(),
                            readInt64LE(bufferstate),
                        )
                }
        }
        if (attachment === undefined) throw Error('Unsupported attachment type')
        return attachment
    }
}

export class AttachmentETPTransfer extends Attachment implements IAttachment {
    constructor(version = ATTACHMENT_VERSION_DEFAULT) {
        super(ATTACHMENT_TYPE_ETP_TRANSFER, version)
    }
    toJSON() {
        return this
    }
    toBuffer() {
        return Buffer.concat([
            toUInt32LE(this.version),
            toUInt32LE(this.type),
        ])
    }
}

export class AttachmentMessage extends Attachment {
    constructor(private data: string, version = ATTACHMENT_VERSION_DEFAULT) {
        super(ATTACHMENT_TYPE_MESSAGE, version)
    }
    toBuffer() {
        return Buffer.concat([
            toUInt32LE(this.version),
            toUInt32LE(this.type),
            toVarStr(this.data)
        ])
    }
}

export class AttachmentMSTIssue extends Attachment {
    constructor(private symbol: string, private maxSupply: number, private precision: number, private secondaryIssueThreshold: number, private issuer: string, private address: string, private description: string, version = ATTACHMENT_VERSION_DEFAULT) {
        super(ATTACHMENT_TYPE_MST, version)
    }
    toBuffer() {
        return Buffer.concat([
            toUInt32LE(this.version),
            toUInt32LE(this.type),
            toUInt32LE(MST_STATUS_ISSUE),
            toVarStr(this.symbol),
            toUInt64LE(this.maxSupply),
            toUInt8(this.precision),
            toUInt8(this.secondaryIssueThreshold),
            Buffer.from('0000', 'hex'),
            toVarStr(this.issuer),
            toVarStr(this.address),
            toVarStr(this.description),
        ])
    }
}

export class AttachmentMSTTransfer extends Attachment {
    constructor(private symbol: string, private quantity: number, version = ATTACHMENT_VERSION_DEFAULT) {
        super(ATTACHMENT_TYPE_MST, version)
    }
    toBuffer() {
        return Buffer.concat([
            toUInt32LE(this.version),
            toUInt32LE(this.type),
            toUInt32LE(MST_STATUS_TRANSFER),
            toVarStr(this.symbol),
            toUInt64LE(this.quantity),
        ])
    }
}