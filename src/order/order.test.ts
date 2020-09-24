import { expect } from 'chai'
import { HDWallet } from '../wallet/wallet'
import { Order } from './order'

describe('Order', () => {

  describe('Create order', () => {
    const order = new Order(
      '91f8430e52f3ee4f7b72b7e02b404a77836dca1aa8d4dc2b07d4209e49e3c11a',
      0,
      'tCdbgEP2kNS9qAoSnRnoN6nDMhvCugNVgZ',
      'ETP',
      10 * 100000000,
    )
    it('create MIT to ETP order', () => {
      expect(order.toString()).to.equal('04000000011ac1e3499e20d4072bdcd4a81aca6d83774a402be0b7727b4feef3520e43f8910000000000ffffffff0100ca9a3b000000001976a9143e995f80739ecbfad8d92e3e523c540bd2847ffd88ac010000000000000000000000')
    })
  })
  describe('Approve order', () => {
    const wallet = HDWallet.fromMnemonic('lunar there win define minor shadow damage lounge bitter abstract sail alcohol yellow left lift vapor tourist rent gloom sustain gym dry congress zero', 'testnet')
    const order = new Order(
      '91f8430e52f3ee4f7b72b7e02b404a77836dca1aa8d4dc2b07d4209e49e3c11a',
      0,
      'tCdbgEP2kNS9qAoSnRnoN6nDMhvCugNVgZ',
      'ETP',
      10 * 100000000,
    )
    const bid_prev_out_script = 'dup hash160 [ 3e995f80739ecbfad8d92e3e523c540bd2847ffd ] equalverify checksig'
    const bid_hd_wallet_path = 'm/2'
    it('approve MIT to ETP order', () => {
      expect(order.approve(wallet.getNode(bid_hd_wallet_path), bid_prev_out_script).toString()).to.equal('04000000011ac1e3499e20d4072bdcd4a81aca6d83774a402be0b7727b4feef3520e43f891000000005e483045022100f139de09db96e9bcf6a5f35aa0f84ce8e74ab5e2670f0e0999dab70538b16d1b022049a0210f59452ef293d16c8249278d2798190c60a6ec3825c60b4af7a3e6799c83143e995f80739ecbfad8d92e3e523c540bd2847ffdffffffff0100ca9a3b000000001976a9143e995f80739ecbfad8d92e3e523c540bd2847ffd88ac010000000000000000000000')
    })
  })
})