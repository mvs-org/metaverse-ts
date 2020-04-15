import {
    IEncodable,
    toUInt32LE,
    readUInt32LE,
    readString,
    toVarStr,
    readInt64LE,
    readInt8,
    toUInt64LE,
    toUInt8,
} from '../encoder/encoder'

export const ATTACHMENT_TYPE_ETP_TRANSFER = 0
export const ATTACHMENT_TYPE_MST = 2
export const ATTACHMENT_TYPE_MESSAGE = 3
export const ATTACHMENT_TYPE_AVATAR = 4
export const ATTACHMENT_TYPE_MIT = 6

export const ATTACHMENT_VERSION_DEFAULT = 1
export const ATTACHMENT_VERSION_DID = 207

export const MST_STATUS_ISSUE = 1
export const MST_STATUS_TRANSFER = 2

export const MIT_STATUS_ISSUE = 1
export const MIT_STATUS_TRANSFER = 2

export const AVATAR_STATUS_REGISTER = 1
export const AVATAR_STATUS_TRANSFER = 2

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
        return Buffer.concat([
            toUInt32LE(this.version),
            toUInt32LE(this.type),
            this.encodeDid(),
        ])
    }
    toString() {
        return this.toBuffer().toString('hex')
    }
    encodeDid(): Buffer {
        if (this.version === ATTACHMENT_VERSION_DID) {
            return Buffer.concat([
                toVarStr(this.to_did || ''),
                toVarStr(this.from_did || ''),
            ])
        }
        return Buffer.from('')
    }
    toJSON() {
        return this
    }
    setDid(from?: string, to?: string) {
        this.version = ATTACHMENT_VERSION_DID
        this.from_did = from
        this.to_did = to
        return this
    }
    static fromBuffer(buffer: Buffer) {
        return Attachment.decode({ buffer, offset: 0 })
    }
    static decode(bufferstate: { buffer: Buffer, offset: number }) {
        const version = readUInt32LE(bufferstate)
        const type = readUInt32LE(bufferstate)
        const did = (version === ATTACHMENT_VERSION_DID) ? {
            from_did: readString(bufferstate).toString(),
            to_did: readString(bufferstate).toString(),
        } : undefined
        let attachment

        switch (type) {
            case ATTACHMENT_TYPE_ETP_TRANSFER:
                attachment = new AttachmentETPTransfer(version)
                break
            case ATTACHMENT_TYPE_MESSAGE:
                const data = readString(bufferstate)
                attachment = new AttachmentMessage(data.toString(), version)
                break
            case ATTACHMENT_TYPE_MIT:
                const mitStatus = readInt8(bufferstate)
                const symbol = readString(bufferstate).toString()
                const address = readString(bufferstate).toString()
                if (mitStatus === MIT_STATUS_TRANSFER) {
                    attachment = new AttachmentMITTransfer(symbol, address)
                    break
                }
                const content = readString(bufferstate).toString()
                attachment = new AttachmentMITIssue(symbol, address, content)
                break
            case ATTACHMENT_TYPE_AVATAR:
                switch (readInt8(bufferstate)) {
                    case AVATAR_STATUS_REGISTER:
                        attachment = new AttachmentAvatarRegister(
                            readString(bufferstate).toString(),
                            readString(bufferstate).toString(),
                        )
                        break
                    case AVATAR_STATUS_TRANSFER:
                        attachment = new AttachmentAvatarTransfer(
                            readString(bufferstate).toString(),
                            readString(bufferstate).toString(),
                        )
                        break
                    default:
                        throw Error('Invalid avatar attachment status')
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
        if (did !== undefined) {
            attachment.setDid(did.from_did, did.to_did)
        }
        return attachment
    }
}

export class AttachmentETPTransfer extends Attachment implements IAttachment {
    constructor(version = ATTACHMENT_VERSION_DEFAULT) {
        super(ATTACHMENT_TYPE_ETP_TRANSFER, version)
    }
}

export class AttachmentMessage extends Attachment {
    constructor(private data: string, version = ATTACHMENT_VERSION_DEFAULT) {
        super(ATTACHMENT_TYPE_MESSAGE, version)
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            toVarStr(this.data),
        ])
    }
}

export class AttachmentMSTIssue extends Attachment {
    constructor(private symbol: string, private maxSupply: number, private precision: number, private secondaryIssueThreshold: number, private issuer: string, private address: string, private description: string, version = ATTACHMENT_VERSION_DEFAULT) {
        super(ATTACHMENT_TYPE_MST, version)
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
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
            super.toBuffer(),
            toUInt32LE(MST_STATUS_TRANSFER),
            toVarStr(this.symbol),
            toUInt64LE(this.quantity),
        ])
    }
}

export class AttachmentMITIssue extends Attachment {
    constructor(private symbol: string, private address: string, private content: string) {
        super(ATTACHMENT_TYPE_MIT)
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            toUInt8(MIT_STATUS_ISSUE),
            toVarStr(this.symbol),
            toVarStr(this.address),
            toVarStr(this.content),
        ])
    }
}

export class AttachmentMITTransfer extends Attachment {
    constructor(private symbol: string, private address: string) {
        super(ATTACHMENT_TYPE_MIT)
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            toUInt8(MIT_STATUS_TRANSFER),
            toVarStr(this.symbol),
            toVarStr(this.address),
        ])
    }
}

export class AttachmentAvatarRegister extends Attachment {
    private status = AVATAR_STATUS_REGISTER
    constructor(private symbol: string, private address: string) {
        super(ATTACHMENT_TYPE_AVATAR)
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            toUInt8(this.status),
            toVarStr(this.symbol),
            toVarStr(this.address),
        ])
    }
}

export class AttachmentAvatarTransfer extends Attachment {
    private status = AVATAR_STATUS_TRANSFER
    constructor(private symbol: string, private address: string) {
        super(ATTACHMENT_TYPE_AVATAR)
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            toUInt8(this.status),
            toVarStr(this.symbol),
            toVarStr(this.address),
        ])
    }
}