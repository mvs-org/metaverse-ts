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

export enum ATTACHMENT_TYPE {
    ETP_TRANSFER = 0,
    MST = 2,
    MESSAGE = 3,
    AVATAR = 4,
    CERTIFICATE = 5,
    MIT = 6,
    COINSTAKE = 4294967295,
}

export enum ATTACHMENT_VERSION {
    DEFAULT = 1,
    DID = 207,
}

export enum MIT_STATUS {
    REGISTER = 1,
    TRANSFER = 2,
}

export enum MST_STATUS {
    REGISTER = 1,
    TRANSFER = 2,
}

export enum AVATAR_STATUS {
    REGISTER = 1,
    TRANSFER = 2,
}

export enum CERTIFICATE_TYPE {
    ISSUE = 1,
    DOMAIN = 2,
    NAMING = 3,
    MINING = 0x60000000 + 4,
}

export enum CERTIFICATE_STATUS {
    DEFAULT = 0,
    ISSUE = 1,
    TRANSFER = 2,
    AUTOISSUE = 3,
}

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
        if (this.version === ATTACHMENT_VERSION.DID) {
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
        this.version = ATTACHMENT_VERSION.DID
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
        const did = (version === ATTACHMENT_VERSION.DID) ? {
            from_did: readString(bufferstate).toString(),
            to_did: readString(bufferstate).toString(),
        } : undefined
        let attachment
        switch (type) {
            case ATTACHMENT_TYPE.ETP_TRANSFER:
                attachment = new AttachmentETPTransfer()
                break
            case ATTACHMENT_TYPE.MESSAGE:
                const data = readString(bufferstate)
                attachment = new AttachmentMessage(data.toString())
                break
            case ATTACHMENT_TYPE.CERTIFICATE:
                const certSymbol = readString(bufferstate).toString()
                const certOwner = readString(bufferstate).toString()
                const certAddress = readString(bufferstate).toString()
                const certType = readUInt32LE(bufferstate)
                const certStatus = readInt8(bufferstate)
                switch (certType) {
                    case CERTIFICATE_TYPE.DOMAIN:
                        attachment = new AttachmentDomainCertificate(certSymbol, certOwner, certAddress, certStatus)
                        break
                    case CERTIFICATE_TYPE.ISSUE:
                        attachment = new AttachmentIssueCertificate(certSymbol, certOwner, certAddress, certStatus)
                        break
                    case CERTIFICATE_TYPE.NAMING:
                        attachment = new AttachmentNamingCertificate(certSymbol, certOwner, certAddress, certStatus)
                        break
                    case CERTIFICATE_TYPE.MINING:
                        const certContent = readString(bufferstate).toString()
                        attachment = new AttachmentMiningCertificate(certSymbol, certOwner, certAddress, certStatus, certContent)
                        break
                    default:
                        throw Error('Unsupported certificate type ' + certType)
                }
                break
            case ATTACHMENT_TYPE.MIT:
                const mitStatus = readInt8(bufferstate)
                const symbol = readString(bufferstate).toString()
                const address = readString(bufferstate).toString()
                if (mitStatus === MIT_STATUS.TRANSFER) {
                    attachment = new AttachmentMITTransfer(symbol, address)
                    break
                }
                const content = readString(bufferstate).toString()
                attachment = new AttachmentMITIssue(symbol, address, content)
                break
            case ATTACHMENT_TYPE.AVATAR:
                switch (readInt8(bufferstate)) {
                    case AVATAR_STATUS.REGISTER:
                        attachment = new AttachmentAvatarRegister(
                            readString(bufferstate).toString(),
                            readString(bufferstate).toString(),
                        )
                        break
                    case AVATAR_STATUS.TRANSFER:
                        attachment = new AttachmentAvatarTransfer(
                            readString(bufferstate).toString(),
                            readString(bufferstate).toString(),
                        )
                        break
                    default:
                        throw Error('Invalid avatar attachment status')
                }
                break
            case ATTACHMENT_TYPE.MST:
                const mstStatus = readUInt32LE(bufferstate)
                switch (mstStatus) {
                    case MST_STATUS.REGISTER:
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
                    case MST_STATUS.TRANSFER:
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
    constructor() {
        super(ATTACHMENT_TYPE.ETP_TRANSFER)
    }
}

export class AttachmentCoinstake extends Attachment implements IAttachment {
    constructor() {
        super(ATTACHMENT_TYPE.COINSTAKE)
    }
}

export class AttachmentMessage extends Attachment {
    constructor(private data: string, version = ATTACHMENT_VERSION.DEFAULT) {
        super(ATTACHMENT_TYPE.MESSAGE, version)
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            toVarStr(this.data),
        ])
    }
}

export class AttachmentMSTIssue extends Attachment {
    constructor(private symbol: string, private maxSupply: number, private precision: number, private secondaryIssueThreshold: number, private issuer: string, private address: string, private description: string, version = ATTACHMENT_VERSION.DEFAULT) {
        super(ATTACHMENT_TYPE.MST, version)
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            toUInt32LE(MST_STATUS.REGISTER),
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
    constructor(private symbol: string, private quantity: number, version = ATTACHMENT_VERSION.DEFAULT) {
        super(ATTACHMENT_TYPE.MST, version)
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            toUInt32LE(MST_STATUS.TRANSFER),
            toVarStr(this.symbol),
            toUInt64LE(this.quantity),
        ])
    }
}

export class AttachmentMITIssue extends Attachment {
    constructor(private symbol: string, private address: string, private content: string) {
        super(ATTACHMENT_TYPE.MIT)
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            toUInt8(MIT_STATUS.REGISTER),
            toVarStr(this.symbol),
            toVarStr(this.address),
            toVarStr(this.content),
        ])
    }
}

export class AttachmentMITTransfer extends Attachment {
    constructor(private symbol: string, private address: string) {
        super(ATTACHMENT_TYPE.MIT)
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            toUInt8(MIT_STATUS.TRANSFER),
            toVarStr(this.symbol),
            toVarStr(this.address),
        ])
    }
}

export class AttachmentAvatarRegister extends Attachment {
    private status = AVATAR_STATUS.REGISTER
    constructor(private symbol: string, private address: string) {
        super(ATTACHMENT_TYPE.AVATAR)
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

export abstract class AttachmentCertificate extends Attachment {
    constructor(private symbol: string, private owner: string, private address: string, private certType: CERTIFICATE_TYPE, private status: CERTIFICATE_STATUS, private content?: string) {
        super(ATTACHMENT_TYPE.CERTIFICATE)
        if(status < CERTIFICATE_STATUS.DEFAULT || status > CERTIFICATE_STATUS.AUTOISSUE){
            throw Error('Unsupported certificate status ' + status)
        }
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            toVarStr(this.symbol),
            toVarStr(this.owner),
            toVarStr(this.address),
            toUInt32LE(this.certType),
            toUInt8(this.status),
            this.content ? toVarStr(this.content) : Buffer.from(''),
        ])
    }
}

export class AttachmentDomainCertificate extends AttachmentCertificate {
    constructor(symbol: string, owner: string, address: string, status: CERTIFICATE_STATUS) {
        super(symbol, owner, address, CERTIFICATE_TYPE.DOMAIN, status)
    }
    toBuffer() {
        return super.toBuffer()
    }
}

export class AttachmentIssueCertificate extends AttachmentCertificate {
    constructor(symbol: string, owner: string, address: string, status: CERTIFICATE_STATUS) {
        super(symbol, owner, address, CERTIFICATE_TYPE.ISSUE, status)
    }
    toBuffer() {
        return super.toBuffer()
    }
}

export class AttachmentNamingCertificate extends AttachmentCertificate {
    constructor(symbol: string, owner: string, address: string, status: CERTIFICATE_STATUS) {
        super(symbol, owner, address, CERTIFICATE_TYPE.NAMING, status)
    }
    toBuffer() {
        return super.toBuffer()
    }
}

export class AttachmentMiningCertificate extends AttachmentCertificate {
    constructor(symbol: string, owner: string, address: string, status: CERTIFICATE_STATUS, content: string) {
        super(symbol, owner, address, CERTIFICATE_TYPE.MINING, status, content)
    }
    toBuffer() {
        return super.toBuffer()
    }
}

export class AttachmentAvatarTransfer extends Attachment {
    private status = AVATAR_STATUS.TRANSFER
    constructor(private symbol: string, private address: string) {
        super(ATTACHMENT_TYPE.AVATAR)
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