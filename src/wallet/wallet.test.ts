import { HDWallet } from './wallet'
import * as chai from "chai"
import chaiAsPromised from "chai-as-promised"
import { Transaction } from '../transaction/transaction'
import { Input } from '../input/input'
import { OutputETPTransfer } from '../output/output'

before(() => {
  chai.should()
  chai.use(chaiAsPromised)
})

describe('Wallet', function () {

  const mnemonic = 'lunar there win define minor shadow damage lounge bitter abstract sail alcohol yellow left lift vapor tourist rent gloom sustain gym dry congress zero'
  const wallet = HDWallet.fromMnemonic(mnemonic, 'mainnet')
  describe('Encoding', () => {
    it('Get root base58', () => {
      chai.expect(wallet.toBase58()).to.equal('xprv9s21ZrQH143K2nA5pap1jF84AHeh5tRRcGuCJc5X8k4FWELPo7QCdS85LjYXsn8EnFyQevdwagW3uVC3LHSpc9HQUBSWRDvqu8jDsvTEMDy')
    })
    it('Get path base58', () => {
      chai.expect(wallet.toBase58(0)).to.equal(wallet.toBase58('m/0'))
      chai.expect(wallet.toBase58('m/0/1')).to.equal('xprv9wietYDeSbFubirNXdjrz44qtHUkQUG9jxobeVLTfrAZQAoM1FwuRmPKyDSLBqtAXuuuPdqrGZjegx3Fwa9bD124VwfCZtDpvEJe4VmnPpB')
    })
    it('From base58', () => {
      chai.expect(HDWallet.fromBase58('xprv9s21ZrQH143K2nA5pap1jF84AHeh5tRRcGuCJc5X8k4FWELPo7QCdS85LjYXsn8EnFyQevdwagW3uVC3LHSpc9HQUBSWRDvqu8jDsvTEMDy').getWIF()).to.equal('KzdBb5qX6RGnFeaJ8Paf1R2wxJBVzqFmsLN21Xhf2KatQdiDeWUX')
      chai.expect(HDWallet.fromBase58('xprv9wietYDeSbFubirNXdjrz44qtHUkQUG9jxobeVLTfrAZQAoM1FwuRmPKyDSLBqtAXuuuPdqrGZjegx3Fwa9bD124VwfCZtDpvEJe4VmnPpB').getWIF()).to.equal('Kzv5iru4meCvWqcJ1MUh6Tsd2WmdooAEKxRTZqP4ENavWK8T79Vy')
    })
  })
  describe('WIF', () => {
    it('Get WIF', () => {
      chai.expect(wallet.getWIF()).to.equal('KzdBb5qX6RGnFeaJ8Paf1R2wxJBVzqFmsLN21Xhf2KatQdiDeWUX')
      chai.expect(wallet.getWIF('m/0/1')).to.equal('Kzv5iru4meCvWqcJ1MUh6Tsd2WmdooAEKxRTZqP4ENavWK8T79Vy')
    })
  })
  describe('Address', () => {
    it('Generate address from index', () => {
      chai.expect(wallet.getAddress(0)).to.equal('MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB')
    })
    it('Generate address from path', () => {
      chai.expect(wallet.getAddress('m/0/0')).to.equal('MPhbC3FB4RHHYX3ZEcFRhfzgfs7g9Z9Rjc')
    })
    it('get hd node', () => {
      const wallet = HDWallet.fromMnemonic('heavy blouse age awkward village report universe flee pizza praise allow drip carbon window cupboard honey quit october word settle ask echo legal perfect')
      chai.expect(wallet.getNode('m/1337\'/0').publicKey.toString('hex')).to.equal('0301467feda1be0d6550a4cb32cc13ceba6420d7cf58f9ebf747234a699e142f81')
    })
    it('find path for given address', () => {
      const wallet = HDWallet.fromMnemonic('heavy blouse age awkward village report universe flee pizza praise allow drip carbon window cupboard honey quit october word settle ask echo legal perfect')
      chai.expect(wallet.getAddressPath('MDsdkxkRtZGaQTdVerx6whQY3S4VWTSSpg')).equal('m/4')
      chai.expect(()=>wallet.getAddressPath('MPhbC3FB4RHHYX3ZEcFRhfzgfs7g9Z9Rjc', undefined, 10)).to.throw('Not found')
      chai.expect(()=>wallet.getAddressPath('MDsdkxkRtZGaQTdVerx6whQY3S4VWTSSpg', 'm/0', 10)).to.throw('Not found')
    })
  })
  describe('Mnemonic', () => {
    it('Generate', () => {
      const mnemonic = HDWallet.generateMnemonic()
      chai.expect(mnemonic.split(' ').length).to.equal(24)
      chai.expect(HDWallet.validateMnemonic(mnemonic)).to.be.true
    })
    it('Validate', () => {
      chai.expect(HDWallet.validateMnemonic('liberty high shrug defy inject file uphold purpose method science have plunge clap soon acquire opera siege kind erosion much jaguar room knee divide')).to.be.true
      chai.expect(HDWallet.validateMnemonic('lunar there win define minor shadow damage lounge bitter abstract sail alcohol yellow left lift vapor tourist rent gloom sustain gym dry congress zero')).to.be.true
      chai.expect(HDWallet.validateMnemonic('test test test')).to.be.false
      chai.expect(HDWallet.validateMnemonic('there lunar win define minor shadow damage lounge bitter abstract sail alcohol yellow left lift vapor tourist rent gloom sustain gym dry congress zero')).to.be.false
      chai.expect(() => HDWallet.validateMnemonic('test test test', true)).to.throw('Invalid mnemonic')
    })
  })

  describe('Signing', () => {
    const wallet = HDWallet.fromMnemonic('lunar there win define minor shadow damage lounge bitter abstract sail alcohol yellow left lift vapor tourist rent gloom sustain gym dry congress zero')
    it('find address path', ()=>{
      chai.expect(wallet.getAddressPath('MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB')).to.equal('m/0')
      chai.expect(()=>wallet.getAddressPath('MVpxH8aAa3BAXvbdqUUJwEP6s2ajGKKtyd', undefined, 10)).to.throw('')
    })
    it('sign transaction', () => {
      // construct transaction
      // https://explorer.mvs.org/tx/d700c4518392419a689d0a4e516c4811fe72388893c6afe710a1f1145b4a3237
      const transaction = new Transaction(2)
      transaction.inputs.push(new Input('5554b27dbf657d008511df56e747ffb2173749fd933b03317cee3c1fde271aea', 1))
      transaction.outputs.push(new OutputETPTransfer('MVpxH8aAa3BAXvbdqUUJwEP6s2ajGKKtyd', 1))
      transaction.outputs.push(new OutputETPTransfer('MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB', 4939995))
      const signature = transaction.sign(0, wallet.getNode('m/0'), 'dup hash160 [ 7f8ac2a0179a4eb308c7ae837aed878b5ed25de2 ] equalverify checksig').toString('hex')
      chai.expect(signature).to.equal('3045022100f8fa56d4f3015689c01f4557351e858aec4a139d752bc19b322390093393efc3022077d706621c3e36c8b6a90c6d354e8a85dd81d39a4e2fb582c0fd28f3f1a9caec01')
    })
  })


})