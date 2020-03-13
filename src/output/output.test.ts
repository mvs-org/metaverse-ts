import { expect, } from 'chai'
import { OutputETPTransfer } from './output'

describe('Output', () => {

  describe('Encode', () => {
    const output = new OutputETPTransfer('MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve', 100000000)
    it('encode to buffer', () => {
      expect(output.toBuffer().toString('hex')).equal('00e1f505000000001a1976a91461fde3bd4e6955c99b16de2d71e2a369888a1c0b88ac0100000000000000');
    })
  })

})