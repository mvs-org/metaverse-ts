import { expect } from 'chai'
import { verifuint, toUInt8, readInt64LE, toUInt64LE } from './encoder'


describe('Encoder', () => {

  describe('verifuint', () => {
    it('nonnumber', () => {
      // @ts-ignore
      expect(() => verifuint('dfs', 10)).to.throw('cannot write a non-number as a number')
      expect(() => verifuint(5, 10)).not.to.throw()
    })
    it('negative', ()=>{
      expect(() => verifuint(-1, 10)).to.throw('specified a negative value for writing an unsigned value')
    })
    it('range error', ()=>{
      expect(() => verifuint(11, 10)).to.throw('RangeError: value out of range')
    })
    it('integer', ()=>{
      expect(() => verifuint(11.5, 100)).to.throw('value has a fractional component')
    })
  })

  describe('toUInt8', ()=>{
    it('valid range', ()=>{
      expect(toUInt8(1).toString('hex')).equal('01')
      expect(()=>toUInt8(1000)).to.throw(RangeError)
    })
  })

  describe('fromInt64LE', ()=>{
    it('valid range', ()=>{
      expect(readInt64LE({buffer: Buffer.from('0100000000000000', 'hex'), offset: 0})).equal(1)
      expect(()=>readInt64LE({buffer: Buffer.from('01000000', 'hex'), offset: 0})).to.throw(RangeError)
    })
  })

  describe('toInt64LE', ()=>{
    it('valid range', ()=>{
      expect(toUInt64LE(1).toString('hex')).equal('0100000000000000')
      expect(()=>toUInt64LE(-1)).to.throw('specified a negative value for writing an unsigned value')
    })
  })

})