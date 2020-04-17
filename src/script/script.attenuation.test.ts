import { expect } from 'chai'
import { Script, ScriptAttenuation } from '.'
import { OutputMSTTransfer } from '../output/output'

describe('Attenuation', () => {
  describe('attenuation model detection', () => {
    it('has model', () => {
      expect(ScriptAttenuation.hasAttenuationModel('[ 504e3d303b4c483d32303b545950453d313b4c513d31303030303b4c503d3130303b554e3d35 ] [ 0000000000000000000000000000000000000000000000000000000000000000ffffffff ] checkattenuationverify dup hash160 [ a9b2822a622a3cc796339e5c1c6a6c1b9d7ac082 ] equalverify checksig')).is.true
    })
    it('no model', () => {
      expect(ScriptAttenuation.hasAttenuationModel('dup hash160 [ e7da370944c15306b3809580110b0a6c653ac5a9 ] equalverify checksig')).is.false
    })
  })
  describe('get attenuation model from asm script', () => {
    it('type 1', () => {
      expect(ScriptAttenuation.getAttenuationModel('[ 504e3d303b4c483d32303b545950453d313b4c513d31303030303b4c503d3130303b554e3d35 ] [ 0000000000000000000000000000000000000000000000000000000000000000ffffffff ] checkattenuationverify dup hash160 [ a9b2822a622a3cc796339e5c1c6a6c1b9d7ac082 ] equalverify checksig')).equals('PN=0;LH=20;TYPE=1;LQ=10000;LP=100;UN=5')
    })
  })
  describe('get parameters', () => {
    it('type 1', () => {
      expect(ScriptAttenuation.getParameters('PN=0;LH=20000;TYPE=1;LQ=9000;LP=60000;UN=3')).to.deep.equal({ PN: 0, LH: 20000, TYPE: 1, LQ: 9000, LP: 60000, UN: 3 })
    })
    it('type 2', () => {
      expect(ScriptAttenuation.getParameters('PN=0;LH=20000;TYPE=2;LQ=9001;LP=60001;UN=3;UC=20000,20000,20001;UQ=3000,3000,3001')).to.deep.equal({ PN: 0, UC: [20000,20000,20001], UQ: [3000,3000,3001], TYPE: 2, LQ: 9001, LP: 60001, UN: 3, LH: 20000 })
    })
  })
  describe('get parameters', () => {
    it('type 1', () => {
      const output = new OutputMSTTransfer('MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve', 'MVS.HUG', 100000, 0)
      output.script = Script.fromFullnode('[ 504e3d303b4c483d32303b545950453d313b4c513d31303030303b4c503d3130303b554e3d35 ] [ 0000000000000000000000000000000000000000000000000000000000000000ffffffff ] checkattenuationverify dup hash160 [ a9b2822a622a3cc796339e5c1c6a6c1b9d7ac082 ] equalverify checksig')
      expect(ScriptAttenuation.assetSpendable(output, 100, 110)).equals(90000)
    })
  })
  describe('encode', () => {
    it('toBuffer', () => {
      expect(new ScriptAttenuation('MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve', 'PN=0;LH=10;TYPE=1;LQ=10000000000;LP=10;UN=1', '0000000000000000000000000000000000000000000000000000000000000000', -1).toBuffer().toString('hex')).equal('2b504e3d303b4c483d31303b545950453d313b4c513d31303030303030303030303b4c503d31303b554e3d31240000000000000000000000000000000000000000000000000000000000000000ffffffffb276a91461fde3bd4e6955c99b16de2d71e2a369888a1c0b88ac')
    })
  })
  describe('asm format', () => {
    it('to asm', () => {
      expect(new ScriptAttenuation('MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve', 'PN=0;LH=10;TYPE=1;LQ=10000000000;LP=10;UN=1', '0000000000000000000000000000000000000000000000000000000000000000', -1).toASM()).equal('[ 504e3d303b4c483d31303b545950453d313b4c513d31303030303030303030303b4c503d31303b554e3d31 ] [ 0000000000000000000000000000000000000000000000000000000000000000ffffffff ] OP_CHECKATTENUATIONVERIFY OP_DUP OP_HASH160 [ 61fde3bd4e6955c99b16de2d71e2a369888a1c0b ] OP_EQUALVERIFY OP_CHECKSIG')
    })
  })
})