import { expect, } from 'chai'
import { Script, ScriptP2PKH } from './script'

describe('Script', () => {

  describe('ASM format', () => {
    
    it('from fullnode format', ()=>{
      expect(Script.fromFullnode('dup hash160 [ e7da370944c15306b3809580110b0a6c653ac5a9 ] equalverify checksig').toString('hex')).equal('76a914e7da370944c15306b3809580110b0a6c653ac5a988ac')
    })

    it('fromASM', () => {
      expect(Script.fromASM('dup hash160 [ e7da370944c15306b3809580110b0a6c653ac5a9 ] equalverify checksig').toString('hex')).equal('76a914e7da370944c15306b3809580110b0a6c653ac5a988ac')
      expect(Script.fromASM('OP_DUP OP_HASH160 [ e7da370944c15306b3809580110b0a6c653ac5a9 ] OP_EQUALVERIFY OP_CHECKSIG').toString('hex')).equal('76a914e7da370944c15306b3809580110b0a6c653ac5a988ac')
    })

    it('Unknown OP code detection', () => {
      expect(()=>Script.fromASM('dup hash166 [ e7da370944c15306b3809580110b0a6c653ac5a9 ] equalverify checksig').toString('hex')).to.throw('Unknown OP code')
    })

    it('toASM', () => {
      expect(Script.toASM(Buffer.from('76a914e7da370944c15306b3809580110b0a6c653ac5a988ac', 'hex'))).equal('OP_DUP OP_HASH160 [ e7da370944c15306b3809580110b0a6c653ac5a9 ] OP_EQUALVERIFY OP_CHECKSIG')
    })

  })

  describe('General Script abstraction', () => {
    class TestScript extends Script {}
    it('toBuffer', () => {
      expect(new TestScript('P2PKH').toBuffer().toString('hex')).equal('')
    })
  })

  describe('P2PKH', () => {
    it('toBuffer', () => {
      expect(new ScriptP2PKH('MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve').toBuffer().toString('hex')).equal('1976a91461fde3bd4e6955c99b16de2d71e2a369888a1c0b88ac')
    })
  })

})