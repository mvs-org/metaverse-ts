import { Transaction } from './transaction'
import * as chai from "chai"
import chaiAsPromised from "chai-as-promised"

before(() => {
  chai.should()
  chai.use(chaiAsPromised)
})

describe('Transaction', function () {

  const etpTx = '0400000002b876d698a8b5c86d2008a0df4abce7d219b038307b8d0f18a5240461d7f8e52c010000006a473044022069b331762136a4be093d46869758e0c5ff352529ad68a1f90a4188e33e6004df0220667a8c18bb9800fecbfa6a6c7a21ac5677778b7729ae56e94c913b2312a43da9012103afa153f4c9ba1bd19ef2f1d765c51e30a4a0705cb61b4efee3c72fc3a11c0e5fffffffffb1b951f88475661a31df3b5879bb0920012bea4df914e42aeb7da0d579ab1563000000006a4730440220664e4deb69ba6de51269aa26ac83e22ad2bc132f28613fccd0c7a09130b1830102204129045f4788635e3eec6cdd324aa66f24db033a62927613d1f5bd1852a10410012103afa153f4c9ba1bd19ef2f1d765c51e30a4a0705cb61b4efee3c72fc3a11c0e5fffffffff02fc28090e000000001976a91486c84a82fd58727b4215e619215d4596325c69fb88ac010000000000000016bc4606000000001976a914e7da370944c15306b3809580110b0a6c653ac5a988ac010000000000000000000000'
  describe('Decoding', () => {
    it('Decode ETP Transfer', () => {
      chai.expect(Transaction.decode('0400000002c7aab7b74a3059a8452edaf9e076203650d74f899d5aa1e225b42d03bdc23889010000006b483045022100d95309298a8577a532755aa10106f48a5879970fdb1285d70d2278bff3e3b01c02202d3eb943e9dd147276ae3ffac280bacdeb69dc5372a1c65c184b81665c295d3c012103afa153f4c9ba1bd19ef2f1d765c51e30a4a0705cb61b4efee3c72fc3a11c0e5fffffffff5014aa36b5ad53b13575e9fc6e52b98651130e9134249fc4d590578b790037a1000000006b483045022100aae86a06bb315eccc6abb684cbc88814f89d6d48f1d083353f0d6832422f23c70220540c8b6226d99ac33ca0922307e76372e3ca12347311bc989a91fc5e80f68341012103afa153f4c9ba1bd19ef2f1d765c51e30a4a0705cb61b4efee3c72fc3a11c0e5fffffffff0226071c07000000001976a91482b8e0818e161f663cbb08c14fc4b68a072ac8d688ac0100000000000000f1cd5004000000001976a914e7da370944c15306b3809580110b0a6c653ac5a988ac010000000000000000000000').toString()).to.equal('0400000002c7aab7b74a3059a8452edaf9e076203650d74f899d5aa1e225b42d03bdc23889010000006b483045022100d95309298a8577a532755aa10106f48a5879970fdb1285d70d2278bff3e3b01c02202d3eb943e9dd147276ae3ffac280bacdeb69dc5372a1c65c184b81665c295d3c012103afa153f4c9ba1bd19ef2f1d765c51e30a4a0705cb61b4efee3c72fc3a11c0e5fffffffff5014aa36b5ad53b13575e9fc6e52b98651130e9134249fc4d590578b790037a1000000006b483045022100aae86a06bb315eccc6abb684cbc88814f89d6d48f1d083353f0d6832422f23c70220540c8b6226d99ac33ca0922307e76372e3ca12347311bc989a91fc5e80f68341012103afa153f4c9ba1bd19ef2f1d765c51e30a4a0705cb61b4efee3c72fc3a11c0e5fffffffff0226071c07000000001976a91482b8e0818e161f663cbb08c14fc4b68a072ac8d688ac0100000000000000f1cd5004000000001976a914e7da370944c15306b3809580110b0a6c653ac5a988ac010000000000000000000000')
      chai.expect(Transaction.decode(etpTx).getId('hex')).to.equal('edc0fcc62298971afcab5cba1531bec7ab077e3328316edc29d5c59eee59278a')
      chai.expect(Transaction.decode(Buffer.from(etpTx, 'hex')).getId('hex')).to.equal('edc0fcc62298971afcab5cba1531bec7ab077e3328316edc29d5c59eee59278a')
    })
  })

  describe('Encoding', () => {
    const transaction = Transaction.decode(Buffer.from(etpTx, 'hex'))
    it('Calculate txid', ()=>{
      chai.expect(transaction.getId('buffer').toString('hex')).to.equal('edc0fcc62298971afcab5cba1531bec7ab077e3328316edc29d5c59eee59278a')
      chai.expect(transaction.getId('buffer').toString('hex')).to.equal(transaction.getId())
    })
    it('Decode ETP Transfer', () => {
      const txObject = transaction.toJSON()
      chai.expect(txObject.inputs.length).to.equal(2)
      chai.expect(txObject.outputs.length).to.equal(2)
    })
    it('Endode ETP Transfer as string', () => {
      chai.expect(transaction.toString()).to.equal(etpTx)
    })

    it('Prepare signature hash', () => {
      chai.expect(transaction.getSigHash(0, 'dup hash160 [ e7da370944c15306b3809580110b0a6c653ac5a9 ] equalverify checksig').toString('hex')).to.equal('c066647af1e37908922c2bb30677df6ddd2f31d948bf1aa12e6089c5473e2baa')
      chai.expect(transaction.getSigHash(1, Buffer.from('76a914e7da370944c15306b3809580110b0a6c653ac5a988ac', 'hex')).toString('hex')).to.equal('a77d87bb00f6615bfd4b965a5bc3e18adf56f07ad8c8152ec83921432081d021')
      chai.expect(()=>transaction.getSigHash(0, '', 1000)).to.throw('Unsupported signature hash type')
    })
  })

})