import { expect, } from 'chai'
import { Script } from './script'

describe('Script', () => {

  describe('ASM format', () => {
    
    it('fromASM', () => {
      expect(Script.fromASM('dup hash160 [ e7da370944c15306b3809580110b0a6c653ac5a9 ] equalverify checksig').toString('hex')).equal('76a914e7da370944c15306b3809580110b0a6c653ac5a988ac')
      expect(Script.fromASM('OP_DUP OP_HASH160 [ e7da370944c15306b3809580110b0a6c653ac5a9 ] OP_EQUALVERIFY OP_CHECKSIG').toString('hex')).equal('76a914e7da370944c15306b3809580110b0a6c653ac5a988ac')
    })
    it('toASM', () => {
      expect(Script.toASM(Buffer.from('76a914e7da370944c15306b3809580110b0a6c653ac5a988ac', 'hex'))).equal('OP_DUP OP_HASH160 [ e7da370944c15306b3809580110b0a6c653ac5a9 ] OP_EQUALVERIFY OP_CHECKSIG')
    })
  })

})