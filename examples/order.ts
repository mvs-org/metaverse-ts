import { HDWallet, Order } from '../src'

const wallet = HDWallet.fromMnemonic('lunar there win define minor shadow damage lounge bitter abstract sail alcohol yellow left lift vapor tourist rent gloom sustain gym dry congress zero', 'testnet')

const ask_quantity = 10 * 100000000
const ask_asset = 'ETP'
const receive_address = 'tCdbgEP2kNS9qAoSnRnoN6nDMhvCugNVgZ'
const bid_utxo_txid = '91f8430e52f3ee4f7b72b7e02b404a77836dca1aa8d4dc2b07d4209e49e3c11a'
const bid_utxo_index = 0
const bid_prev_out_script = 'dup hash160 [ 3e995f80739ecbfad8d92e3e523c540bd2847ffd ] equalverify checksig'
const bid_hd_wallet_path = 'm/2'

const order = new Order(bid_utxo_txid, bid_utxo_index, receive_address, ask_asset, ask_quantity)
console.log('order created:')
console.log(order.toString())
console.log('----------')
console.log('')

order.approve(wallet.getNode(bid_hd_wallet_path), bid_prev_out_script)
console.log('order approved (signed):')
console.log(order.toString())
console.log('----------')
console.log('')