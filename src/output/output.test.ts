import { expect, } from 'chai'
import { OutputETPTransfer, Output } from './output'
import { AttachmentETPTransfer } from '../attachment/attachment'

describe('Output', () => {

  describe('Encode', () => {
    const output = new OutputETPTransfer('MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve', 100000000)
    const outputBufferScript = new Output(100000000, new AttachmentETPTransfer(), Buffer.from('76a914e7da370944c15306b3809580110b0a6c653ac5a988ac', 'hex'))

    it('encode to buffer', () => {
      expect(output.toBuffer().toString('hex')).equal('00e1f505000000001a1976a91461fde3bd4e6955c99b16de2d71e2a369888a1c0b88ac0100000000000000');
    })

    it('encode to JSON', () => {
      expect(outputBufferScript.toJSON()).to.deep.equal({
        "attachment": {
          "type": 0,
          "version": 1,
        },
        "script": "OP_DUP OP_HASH160 [ e7da370944c15306b3809580110b0a6c653ac5a9 ] OP_EQUALVERIFY OP_CHECKSIG",
        "value": 100000000,
      })
    })
    it('output with script buffer', () => {
      expect(outputBufferScript.toBuffer().toString('hex')).equal('00e1f505000000001976a914e7da370944c15306b3809580110b0a6c653ac5a988ac0100000000000000');
    })
  })

})