import { Script } from '../script'
import { Input } from '../input/input'
import { OutputETPTransfer, OutputMSTTransfer } from '../output/output'
import { SIGHASH_ANYONECANPAY, SIGHASH_SINGLE } from '../signature/signature'
import { Transaction } from '../transaction/transaction'
import { BIP32Interface } from 'bitcoinjs-lib'

export class Order {

    tx: Transaction

    constructor(bid_utxo_txid: string, bid_utxo_index: number, receive_address: string, ask_asset: string, ask_quantity: number) {
        this.tx = new Transaction(
            undefined,
            [new Input(bid_utxo_txid, bid_utxo_index)],
        )

        // add ask asset
        if (ask_asset === 'ETP') {
            this.tx.outputs.push(new OutputETPTransfer(receive_address, ask_quantity))
        } else {
            this.tx.outputs.push(new OutputMSTTransfer(receive_address, ask_asset, ask_quantity))
        }
    }

    approve(node: BIP32Interface, bid_prev_out_script: string, sighash = SIGHASH_SINGLE + SIGHASH_ANYONECANPAY) {
        if (this.tx.inputs.length !== 1) {
            throw Error('Illegal number of inputs')
        }
        const signature = this.tx.sign(0, node, bid_prev_out_script, sighash)
        this.tx.inputs[0].script = Script.fromChunks([signature, node.publicKey])
        return this
    }

    toString(){
        return this.tx.toString()
    }

}