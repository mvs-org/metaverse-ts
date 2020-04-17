import { toUInt8, toUInt32LE, toVarStr, toVarInt } from '../encoder/encoder'
import { Script } from './script'
import { Output } from '..'
import { AttachmentMSTTransfer, AttachmentMSTIssue } from '../attachment/attachment'
const OPS = require('metaverse-ops')
const base58check: {
    encode: (buffer: Buffer, version: string) => Buffer,
    decode: (address: string) => { data: Buffer, prefix: Buffer },
    // tslint:disable-next-line: no-unsafe-any
} = require('base58check')

export interface AttenuationModelParams {
    TYPE: number
    LP: number // total number of blocks
    UN: number // number of periods
    LQ: number // locked quantity
    LH: number
    PN: number
    UC?: number[] // locktime array
    UQ?: number[] // quantity array
}

export class ScriptAttenuation extends Script {
    address: string

    static readonly regex = /^\[\ ([a-f0-9]+)\ \]\ \[\ ([a-f0-9]+)\ \]\ (checkattenuationverify|op_checkattenuationverify)\ (dup|op_dup)\ (hash160|op_hash160)\ \[ [a-f0-9]+\ \]\ (equalverify|op_equalverify)\ (checksig|op_checksig)$/i

    constructor(address: string, public model: string, public txid: string = '0000000000000000000000000000000000000000000000000000000000000000', public index = -1) {
        super('ATTENUATION')
        this.address = address
    }

    static hasAttenuationModel(script: string) {
        return ScriptAttenuation.regex.test(script)
    }

    static getAttenuationModel(script: string): string {
        const match = script.match(ScriptAttenuation.regex)
        if (match && match.length > 1) {
            return Buffer.from(match[1], 'hex').toString()
        }
        throw Error('Script does not contain attenuation model')
    }

    static assetSpendable(output: Output, tx_height: number, current_height: number) {
        let quantity
        if (output.attachment instanceof AttachmentMSTTransfer) {
            quantity = output.attachment.quantity
        } else if (output.attachment instanceof AttachmentMSTIssue) {
            quantity = output.attachment.maxSupply
        } else {
            throw Error('Invalid attachment type for spendable asset detection')
        }
        const scriptASM = Script.toString(output.script)
        if (ScriptAttenuation.hasAttenuationModel(scriptASM)) {
            let model = ScriptAttenuation.getParameters(ScriptAttenuation.getAttenuationModel(scriptASM))
            let locked = 0
            let step_target = model.LH
            switch (model.TYPE) {
                case 1:
                    for (let period = model.PN; period < model.UN; period++) {
                        if (period != model.PN)
                            step_target += model.LP / model.UN
                        if (tx_height + step_target > current_height)
                            locked += model.LQ / model.UN
                    }
                    if (quantity < locked) {
                        throw Error('Invalid locked quantity')
                    }
                    return quantity - locked
                case 2:
                case 3:
                    if (!Array.isArray(model.UC)) {
                        throw Error('Invalid parameter value for attenuation param UC')
                    }
                    if (!Array.isArray(model.UQ)) {
                        throw Error('Invalid parameter value for attenuation param UQ')
                    }
                    for (let period = model.PN; period < model.UC.length; period++) {
                        if (period != model.PN)
                            step_target += model.UC[period]
                        if (tx_height + step_target > current_height)
                            locked += model.UQ[period]
                    }
                    if (quantity < locked) {
                        throw Error('Invalid locked quantity')
                    }
                    return quantity - locked
            }
            throw Error('Invalid attenuation model type')
        } else {
            return quantity
        }
    }

    static adjustAttenuationModel(model: AttenuationModelParams, height_delta: number) {
        if (!(height_delta > 0)) {
            return model
        }
        let blocks_left = null
        switch (model.TYPE) {
            case 1:
                let period_size = model.LP / model.UN
                blocks_left = model.LH
                for (let period = model.PN; period < model.UN; period++) {
                    if (blocks_left >= height_delta) {
                        model.LH = blocks_left - height_delta
                        model.PN = period
                        return model
                    }
                    blocks_left += period_size
                }
                throw Error('Error adjusting attenuation model')
                break
            case 2:
            case 3:
                if (!Array.isArray(model.UC)) {
                    throw Error('Attenuation model param UC invalid')
                }
                blocks_left = model.LH
                for (let period = model.PN; period < model.UC.length; period++) {
                    if (blocks_left >= height_delta) {
                        model.LH = blocks_left - height_delta
                        model.PN = period
                        return model
                    }
                    blocks_left += model.UC[period + 1]
                }
                throw Error('Error adjusting attenuation model')
                break
            default:
                throw Error('Unknown attenuation model type')
        }

    }

    static getParameters(model: string): AttenuationModelParams {
        const params: any = {}
        model.split(';').forEach(segment => {
            const [key, values] = segment.split('=')
            if (values.indexOf(',') !== -1) {
                params[key] = values.split(',').map(value => {
                    const v = parseInt(value)
                    if (Number.isNaN(v)) {
                        throw Error('Invalid attenuation parameter')
                    }
                    return v
                })
            } else {
                params[key] = parseInt(values)
                if (Number.isNaN(params[key])) {
                    throw Error('Invalid attenuation parameter')
                }
            }
        })
        // tslint:disable-next-line: no-unsafe-any
        return params
    }

    toBuffer() {
        return Buffer.concat([
            toVarStr(this.model),
            Buffer.concat([
                toVarInt(36),
                Buffer.from(this.txid, 'hex').reverse(),
                toUInt32LE(this.index),
            ]),
            toUInt8(OPS.OP_CHECKATTENUATIONVERIFY),
            toUInt8(OPS.OP_DUP),
            toUInt8(OPS.OP_HASH160),
            toVarStr(base58check.decode(this.address).data.toString('hex'), 'hex'),
            toUInt8(OPS.OP_EQUALVERIFY),
            toUInt8(OPS.OP_CHECKSIG),
        ])
    }
}
