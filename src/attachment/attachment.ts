import { IEncodable, toUInt32LE, readUInt32LE, readString } from '../encoder/encoder'

export const ATTACHMENT_TYPE_ETP_TRANSFER = 0
export const ATTACHMENT_TYPE_MST = 2
export const ATTACHMENT_TYPE_MESSAGE = 3

export const ATTACHMENT_VERSION_DEFAULT = 1
export const ATTACHMENT_VERSION_DID = 207

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
        }
        if(attachment===undefined) throw Error('Illegal attachment type')
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
    constructor() {
        super(ATTACHMENT_TYPE_MESSAGE)
    }
    toBuffer() {
        return Buffer.concat([
            toUInt32LE(this.version),
            toUInt32LE(this.type),
        ])
    }
}

export class AttachmentMST extends Attachment {
    constructor() {
        super(ATTACHMENT_TYPE_MST)
    }
    toBuffer() {
        return Buffer.concat([
            toUInt32LE(this.version),
            toUInt32LE(this.type),
        ])
    }
}