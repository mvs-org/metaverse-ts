import { Input } from '../input/input';
import { Transaction } from '../transaction/transaction';
import { OutputMessage, OutputMSTTransfer, OutputETPTransfer } from '../output/output';

export interface TransactionTarget {
    [symbol: string]: number
}

export const FEE_DEFAULT = 10000

export interface AttenuationParams {

}

export interface UTXO {
    tx: string
    index: number
    value: number
}

export interface TransactionBuilderSendParams {
    inputs: UTXO[]
    recipient_address: string
    recipient_avatar?: string
    target: TransactionTarget
    etp_change_address: string
    change: TransactionTarget
    locked_asset_change: AttenuationParams[]
    fee?: number
    messages?: string[]
    asset_change_address?: string
}

export interface TransactionBuilderRecipient {
    target: TransactionTarget,
    address: string,
    avatar?: string,
    attenuation_model?: string,
}

export interface TransactionBuilderSendMoreParams {
    inputs: UTXO[]
    recipients: TransactionBuilderRecipient[]
    etp_change_address: string
    asset_change_address?: string
    change: TransactionTarget
    locked_asset_change?: AttenuationParams[]
    fee?: number
    messages?: string[]
}

export class TransactionBuilder {

    /**
     * Generates a send (etp and or asset) transaction with the given utxos as inputs, assets and the change.
     * @param inputs Inputs for the transaction
     * @param recipient_address Recipient address
     * @param target Definition of assets to send
     * @param etp_change_address ETP change address
     * @param change Definition of change assets
     * @param asset_change_address Asset change address
     */
    static send(params: TransactionBuilderSendParams) {

        if(params.fee === undefined) params.fee = FEE_DEFAULT
        if (params.messages == undefined) {
            params.messages = []
        }

        let etpcheck = 0
        //create new transaction
        let tx = new Transaction()
        //add inputs
        params.inputs.forEach((utxo) => {
            if (utxo.value) {
                etpcheck += utxo.value
            }
            tx.inputs.push(new Input(utxo.tx, utxo.index))
        })
        
        params.messages.forEach((message) => tx.outputs.push(new OutputMessage(message, params.recipient_address)))
        //add the target outputs to the recipient
        tx.outputs = Object.keys(params.target).map(symbol => {
            let output
            if (symbol.toLowerCase() === 'etp') {
                etpcheck -= params.target.ETP
                output = new OutputETPTransfer(params.recipient_address, params.target[symbol])
            } else {
                output = new OutputMSTTransfer(params.recipient_address, symbol, params.target[symbol])
            }
            if (params.recipient_avatar) {
                output.attachment.setDid("", params.recipient_avatar)
            }
            return output
        })
        //add the change outputs
        Object.keys(params.change).forEach((symbol) => {
            if (params.change[symbol] !== 0) {
                if (symbol.toLowerCase() === 'etp') {
                    tx.outputs.push(new OutputETPTransfer(params.etp_change_address, -params.change[symbol]))
                } else {
                    tx.outputs.push(new OutputMSTTransfer(params.asset_change_address || params.etp_change_address, symbol, -params.change[symbol]))
                }
            }
        })
        if (params.locked_asset_change != undefined && params.locked_asset_change.length) {
            throw Error('Attenuation models not supported')
            // locked_asset_change.forEach((change) => tx.outputs.push(new OutputMSTTransfer(asset_change_address, change.symbol, change.quantity, change.attenuation_model, change.delta, change.hash, change.index));
        }
        if (params.change.ETP){
            etpcheck += params.change.ETP
        }
        if (etpcheck !== params.fee) throw Error('ERR_FEE_CHECK_FAILED')
        return tx
    }

    static sendMore(params: TransactionBuilderSendMoreParams) {

        if(params.fee === undefined) params.fee = FEE_DEFAULT
        if (params.messages == undefined) {
            params.messages = []
        }

        let etpcheck = 0
        //create new transaction
        let tx = new Transaction()
        //add inputs
        params.inputs.forEach((utxo) => {
            if (utxo.value) {
                etpcheck += utxo.value
            }
            tx.inputs.push(new Input(utxo.tx, utxo.index))
        })
        
        params.messages.forEach((message) => tx.outputs.push(new OutputMessage(message, params.recipients[0].address)))
        //add the target outputs to the recipient
        params.recipients.forEach(recipient=>{
            Object.keys(recipient.target).forEach(symbol=>{
                let output
                if (symbol.toUpperCase() === 'ETP') {
                    etpcheck -= recipient.target.ETP
                    output = new OutputETPTransfer(recipient.address, recipient.target[symbol])
                } else {
                    output = new OutputMSTTransfer(recipient.address, symbol, recipient.target[symbol])
                }
                if (recipient.avatar) {
                    output.attachment.setDid("", recipient.avatar)
                }
                if(recipient.attenuation_model){
                    throw Error('Attenuation models not supported')
                }
                tx.outputs.push(output)
            })
        })
        //add the change outputs
        Object.keys(params.change).forEach((symbol) => {
            if (params.change[symbol] !== 0) {
                if (symbol.toUpperCase() === 'ETP') {
                    tx.outputs.push(new OutputETPTransfer(params.etp_change_address, -params.change[symbol]))
                } else {
                    tx.outputs.push(new OutputMSTTransfer(params.asset_change_address || params.etp_change_address, symbol, -params.change[symbol]))
                }
            }
        })
        if (params.locked_asset_change != undefined && params.locked_asset_change.length) {
            throw Error('Attenuation models not supported')
            // locked_asset_change.forEach((change) => tx.outputs.push(new OutputMSTTransfer(asset_change_address, change.symbol, change.quantity, change.attenuation_model, change.delta, change.hash, change.index));
        }
        if (params.change.ETP){
            etpcheck += params.change.ETP
        }
        if (etpcheck !== params.fee) throw Error('ERR_FEE_CHECK_FAILED')
        return tx
    }

}