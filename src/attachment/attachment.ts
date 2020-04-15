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
export const ATTACHMENT_TYPE_MIT = 6

export const ATTACHMENT_VERSION_DEFAULT = 1
export const ATTACHMENT_VERSION_DID = 207

export const MST_STATUS_ISSUE = 1
export const MST_STATUS_TRANSFER = 2

export const MIT_STATUS_ISSUE = 1
export const MIT_STATUS_TRANSFER = 2

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
        return Buffer.concat(
            [
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

// 04000000011d8d1bffee00ddce6bd05ebb7bf4da58626dc77ebd2c3fe4eca01bd8202826ab000000006b483045022100c15a440c7fda757e6fea7b60c5f5b1e76f0755c9218fa43a951275be8235079a0220233a20bfe12644ad15a31ea4b18eed571374e5b44f9b0b683631569fcb191b77012102ed6134b78ef2a4a38bbf6d1c37878e16a58127ffe777012d93d5fa4ab20b54c8ffffffff0200000000000000001976a91448b6adc8508180d58d2efe4a6068e7934fdf8b3088accf000000060000000563616e67720563616e67720104544553542274445a35594d4c4a337a365662764173583163386f6539684a326e4e44346a737a7a047465737476e6440b000000001976a91448b6adc8508180d58d2efe4a6068e7934fdf8b3088ac010000000000000000000000

// 040000000174ef21af39b0ef7ffaaf9ad3eb2eb09aef870b65188c9ad5cbb686e35eeeb234030000006a473044022072f4a9559b251f2aeb2bedffb940665c9d76641dc8b4c16b0bc8675c8e0cf77c02201b8a8c735d6f3a8dde6f80c0c31cc5370ba25c510cc498cbed2a7f2d30b29e930121039fd0412581588e3b1cf80dba38ccca35fe60b7645cbbe30390b9e5903f692383ffffffff0200000000000000001976a9143af2ae30896bebafa32e338662b20e91061b225088accf0000000600000006446170686e6506446170686e650106444150484e45224d444772394866533872616d6f695851356a4a5565365448544a797062717774714c14446170686e652773204d49542061737365747320f0d992ba060000001976a9143af2ae30896bebafa32e338662b20e91061b225088ac010000000000000000000000