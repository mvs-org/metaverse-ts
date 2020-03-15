import { Signature, SIGHASH_SINGLE, SIGHASH_ALL, SIGHASH_ANYONECANPAY, SIGHASH_NONE } from './signature'
import { Transaction } from '../transaction/transaction'
import { expect } from "chai"

describe('Signature', function () {

  describe('Basic', () => {
    it('Create signature', () => {
      expect(new Signature(Buffer.from(''), SIGHASH_SINGLE).hashType).to.equal(SIGHASH_SINGLE)
      expect(() => new Signature(Buffer.from(''), 100).hashType).to.throw('Invalid hashType 100')
    })
    it('anyonecanpay evaluation', () => {
      expect(new Signature(Buffer.from(''), SIGHASH_ALL | SIGHASH_ANYONECANPAY).anyoneCanPay()).to.be.true
      expect(new Signature(Buffer.from(''), SIGHASH_ALL).anyoneCanPay()).to.be.false
    })
  })

  describe('sighash', ()=>{
    const transaction = Transaction.decode('04000000023aa20d75b13cc93c0804115ecb0a91828a7c7ead0563d9513b2c1665bf1872cc010000006a473044022071c25c696c1639d8c476545142e4e033d29334f0412a25ee22fa68b6a1b39d09022018270e5634f8c9e737ac65134e8ea2b583cf9611dc12de26beee9ec032699f7d0121033a67f19bad4eab86ffade1bd050885e205562e07f8ebb50a114eb15b233a3b86ffffffffb30320f9392e9caf3fcc9162158e9bd576f03664ac1e1d70f39e83445e92afeb000000006a47304402203a40fcb0db0324d3ef83e75e6972f930d863f68939aa999189a0083e8be4f3060220519e0cb97ee81b064ec406ff3ab2b79e3c6ef1b3397fa0beb068209068b38aaa0121033a67f19bad4eab86ffade1bd050885e205562e07f8ebb50a114eb15b233a3b86ffffffff02a12a3306000000001976a914f0ad10f5e6c7a8e9b6cf0d1e580e3276625a684a88ac0100000000000000d3d4a105000000001976a91459d20a7a09e90eccd7e61f5866a30ef291f98f2288ac010000000000000000000000')
    it('SIGHASH_ALL', () => {
      expect(Signature.hash(transaction.clone(), 0, Buffer.from('76a91459d20a7a09e90eccd7e61f5866a30ef291f98f2288ac', 'hex'), SIGHASH_ALL).toString('hex')).to.equal('cd7a4d526483788540c09f4fd08f83f913a6f2aa454b1f1aa54ac49253a84274')
      expect(Signature.hash(transaction.clone(), 0, 'dup hash160 [ 59d20a7a09e90eccd7e61f5866a30ef291f98f22 ] equalverify checksig', SIGHASH_ALL).toString('hex')).to.equal('cd7a4d526483788540c09f4fd08f83f913a6f2aa454b1f1aa54ac49253a84274')
    })
    it('SIGHASH_NONE', () => {
      expect(Signature.hash(transaction.clone(), 0, 'dup hash160 [ 59d20a7a09e90eccd7e61f5866a30ef291f98f22 ] equalverify checksig', SIGHASH_NONE).toString('hex')).to.equal('d8eb0d053ab8119eed4d1b9373fa34e7e1597ee01f32c3137f109c6677acb81d')
    })
    it('SIGHASH_SINGLE', () => {
      expect(Signature.hash(transaction.clone(), 0, 'dup hash160 [ 59d20a7a09e90eccd7e61f5866a30ef291f98f22 ] equalverify checksig', SIGHASH_SINGLE).toString('hex')).to.equal('02704bc7be40f6c0a2fddb17016e35e9bbf0cbe495256b2ae20fc191871775a2')
      expect(()=>Signature.hash(transaction.clone(), 2, 'dup hash160 [ 59d20a7a09e90eccd7e61f5866a30ef291f98f22 ] equalverify checksig', SIGHASH_SINGLE).toString('hex')).to.throw('Matching output index not found')
    })
    it('SIGHASH_SINGLE|ANYONECAMPAY', () => {
      expect(Signature.hash(transaction.clone(), 0, 'dup hash160 [ 59d20a7a09e90eccd7e61f5866a30ef291f98f22 ] equalverify checksig', SIGHASH_SINGLE | SIGHASH_ANYONECANPAY).toString('hex')).to.equal('1b2ea6727d8ae6c40c2ef4e70464a1cfc343dc312a8dc8ad8a930c532257d3f9')
    })
    it('Unknown type', () => {
      expect(()=>Signature.hash(transaction.clone(), 0, 'dup hash160 [ 59d20a7a09e90eccd7e61f5866a30ef291f98f22 ] equalverify checksig', 4).toString('hex')).to.throw('Unsupported signature hash type')
    })

  })

  describe('Encoding', () => {
    it('to DER', () => {
      expect(Signature.toDER(Buffer.from('0000', 'hex')).toString('hex')).to.equal('00')
    })
    it('from DER', () => {
      expect(Signature.fromDER(Buffer.from('0000', 'hex')).toString('hex')).to.equal('0000000000000000000000000000000000000000000000000000000000000000')
      expect(Signature.fromDER(Buffer.from('30440220346236333933303234663966313736666464313439613061663537653062666202203034343565396661396336633264653234353739326662333135346664333936', 'hex')).toString('hex')).to.equal('3044022034623633393330323466396631373666646431343961306166353765')
    })
    it('to buffer', () => {
      expect(new Signature(Buffer.from('4b6393024f9f176fdd149a0af57e0bfb0445e9fa9c6c2de245792fb3154fd396'), SIGHASH_ALL).toBuffer().toString('hex')).to.equal('3044022034623633393330323466396631373666646431343961306166353765306266620220303434356539666139633663326465323435373932666233313534666433393601')
    })
    it('from buffer', () => {
      expect(Signature.fromBuffer(Buffer.from('3044022034623633393330323466396631373666646431343961306166353765306266620220303434356539666139633663326465323435373932666233313534666433393601', 'hex')).signature.toString('hex')).to.equal('34623633393330323466396631373666646431343961306166353765306266623034343565396661396336633264653234353739326662333135346664333936')
      expect(Signature.fromBuffer(Buffer.from('3044022034623633393330323466396631373666646431343961306166353765306266620220303434356539666139633663326465323435373932666233313534666433393603', 'hex')).hashType).to.equal(SIGHASH_SINGLE)
    })
  })

})