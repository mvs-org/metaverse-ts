import { HDWallet } from './wallet'
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";

before(() => {
  chai.should();
  chai.use(chaiAsPromised);
});

describe('Wallet', function () {

  const mnemonic = 'lunar there win define minor shadow damage lounge bitter abstract sail alcohol yellow left lift vapor tourist rent gloom sustain gym dry congress zero'
  const wallet = HDWallet.fromMnemonic(mnemonic, 'mainnet')
  describe('base58', () => {
    it('Get root base58', () => {
      chai.expect(wallet.toBase58()).to.equal('xprv9s21ZrQH143K2nA5pap1jF84AHeh5tRRcGuCJc5X8k4FWELPo7QCdS85LjYXsn8EnFyQevdwagW3uVC3LHSpc9HQUBSWRDvqu8jDsvTEMDy')
    })
    it('Get path base58', () => {
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
    })
  })


});