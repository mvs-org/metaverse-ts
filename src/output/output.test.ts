import { expect } from 'chai'
import { OutputETPTransfer, Output, OutputMSTTransfer, OutputMessage } from './output'
import { AttachmentETPTransfer, AttachmentMSTTransfer } from '../attachment/attachment'

describe('Output', () => {

  describe('Message', () => {
    const messageOutput = new OutputMessage('some message', 'MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve')
    const serialized = '00000000000000001976a91461fde3bd4e6955c99b16de2d71e2a369888a1c0b88ac01000000030000000c736f6d65206d657373616765'
    const object = {
      value: 0,
      script: 'OP_DUP OP_HASH160 [ 61fde3bd4e6955c99b16de2d71e2a369888a1c0b ] OP_EQUALVERIFY OP_CHECKSIG',
      attachment: {
        type: 3,
        version: 1,
        data: 'some message',
      },
    }
    it('encode', ()=>{
      expect(messageOutput.toString()).deep.equal(serialized)
    })
    it('decode', ()=>{
      expect(Output.fromBuffer(Buffer.from(serialized, 'hex')).toJSON()).deep.equal(object)
    })
  })

  describe('MST transfer', () => {
    const mstOutput = new OutputMSTTransfer('MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve', 'MVS.HUG', 2)
    const mstOutputObject = {
      value: 0,
      script: 'OP_DUP OP_HASH160 [ 61fde3bd4e6955c99b16de2d71e2a369888a1c0b ] OP_EQUALVERIFY OP_CHECKSIG',
      attachment: {
        symbol: 'MVS.HUG',
        quantity: 2,
        type: 2,
        version: 1,
      },
    }
    const mstOutputString = '00000000000000001976a91461fde3bd4e6955c99b16de2d71e2a369888a1c0b88ac010000000200000002000000074d56532e4855470200000000000000'
    it('decode', () => {
      expect(Output.fromBuffer(Buffer.from(mstOutputString, 'hex')).toJSON()).deep.equal(mstOutputObject)
    })
    describe('encode', () => {
      it('encode to buffer', () => {
        expect(mstOutput.toBuffer().toString('hex')).equal(mstOutputString)
      })
      it('encode to JSON', () => {
        expect(mstOutput.toJSON()).to.deep.equal(mstOutputObject)
      })
      it('output with script buffer', () => {
        const output = new Output(mstOutput.value, new AttachmentMSTTransfer('MVS.HUG', 2), Buffer.from('76a91461fde3bd4e6955c99b16de2d71e2a369888a1c0b88ac', 'hex'))
        expect(mstOutput.toString()).equal(output.toString())
        expect(output.toBuffer().toString('hex')).equal(mstOutputString)
      })
    })
  })

  describe('ETP transfer', () => {
    const etpOutput = new OutputETPTransfer('MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve', 100000000)
    const etpOutputObject = {
      address: 'MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve',
      value: 100000000,
      script: 'OP_DUP OP_HASH160 [ 61fde3bd4e6955c99b16de2d71e2a369888a1c0b ] OP_EQUALVERIFY OP_CHECKSIG',
      attachment: {
        type: 0,
        version: 1,
      },
    }
    const etpOutputString = '00e1f505000000001976a91461fde3bd4e6955c99b16de2d71e2a369888a1c0b88ac0100000000000000'
    it('decode', () => {
      expect(Output.fromBuffer(Buffer.from(etpOutputString, 'hex')).toJSON('mainnet')).deep.equal(etpOutputObject)
    })
    describe('encode', () => {
      it('encode to buffer', () => {
        expect(etpOutput.toBuffer().toString('hex')).equal(etpOutputString)
      })
      it('encode to JSON', () => {
        expect(etpOutput.toJSON('mainnet')).to.deep.equal(etpOutputObject)
      })
      it('output with script buffer', () => {
        const output = new Output(etpOutput.value, new AttachmentETPTransfer(), Buffer.from('76a91461fde3bd4e6955c99b16de2d71e2a369888a1c0b88ac', 'hex'))
        expect(etpOutput.toString()).equal(output.toString())
        expect(output.toBuffer().toString('hex')).equal(etpOutputString)
      })
    })
  })
})