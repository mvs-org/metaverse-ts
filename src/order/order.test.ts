import { expect } from 'chai'
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
})