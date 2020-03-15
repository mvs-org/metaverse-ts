import { expect } from 'chai'
import { Address } from './address'
import { Networks } from '../network/network'

describe('Address', () => {

  describe('encode to base58', () => {
    it('testnet', () => {
      expect(Address.toBase58('61fde3bd4e6955c99b16de2d71e2a369888a1c0b', Networks.testnet, 'hex')).to.equal('tFrjjxXTpqg6pUY96ZdbmfFQMadx7wGWdn')
      expect(Address.toBase58(Buffer.from('61fde3bd4e6955c99b16de2d71e2a369888a1c0b', 'hex'), Networks.testnet, 'hex')).to.equal('tFrjjxXTpqg6pUY96ZdbmfFQMadx7wGWdn')
    })
    it('mainnet', () => {
      expect(Address.toBase58('61fde3bd4e6955c99b16de2d71e2a369888a1c0b', undefined).toString()).to.equal('MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve')
      expect(Address.toBase58('61fde3bd4e6955c99b16de2d71e2a369888a1c0b', undefined, 'hex')).to.equal('MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve')
      expect(Address.toBase58(Buffer.from('61fde3bd4e6955c99b16de2d71e2a369888a1c0b', 'hex'), undefined, 'hex')).to.equal('MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve')
    })
    it('custom version', () => {
      expect(Address.toBase58('61fde3bd4e6955c99b16de2d71e2a369888a1c0b', 5, 'hex')).to.equal('3Ad9ciAKCq9D3bXa7NzicN3Ra3CsUTihXH')
    })
  })
  describe('decode from base58', () => {
    it('testnet string', () => {
      expect(Address.fromBase58('tFrjjxXTpqg6pUY96ZdbmfFQMadx7wGWdn', 'hex')).to.equal('61fde3bd4e6955c99b16de2d71e2a369888a1c0b')
    })
    it('testnet buffer', () => {
      expect(Address.fromBase58('tFrjjxXTpqg6pUY96ZdbmfFQMadx7wGWdn').toString('hex')).to.equal('61fde3bd4e6955c99b16de2d71e2a369888a1c0b')
    })
    it('mainnet hex', () => {
      expect(Address.fromBase58('MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve', 'hex')).to.equal('61fde3bd4e6955c99b16de2d71e2a369888a1c0b')
    })
    it('mainnet buffer', () => {
      expect(Address.fromBase58('MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve').toString('hex')).to.equal(Address.fromBase58('MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve', 'hex'))
      expect(Address.fromBase58('MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve').toString('hex')).to.equal('61fde3bd4e6955c99b16de2d71e2a369888a1c0b')
    })
  })

})