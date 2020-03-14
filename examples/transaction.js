const { Transaction } = require('../lib')

const transaction = Transaction.decode('0400000002b876d698a8b5c86d2008a0df4abce7d219b038307b8d0f18a5240461d7f8e52c010000006a473044022069b331762136a4be093d46869758e0c5ff352529ad68a1f90a4188e33e6004df0220667a8c18bb9800fecbfa6a6c7a21ac5677778b7729ae56e94c913b2312a43da9012103afa153f4c9ba1bd19ef2f1d765c51e30a4a0705cb61b4efee3c72fc3a11c0e5fffffffffb1b951f88475661a31df3b5879bb0920012bea4df914e42aeb7da0d579ab1563000000006a4730440220664e4deb69ba6de51269aa26ac83e22ad2bc132f28613fccd0c7a09130b1830102204129045f4788635e3eec6cdd324aa66f24db033a62927613d1f5bd1852a10410012103afa153f4c9ba1bd19ef2f1d765c51e30a4a0705cb61b4efee3c72fc3a11c0e5fffffffff02fc28090e000000001976a91486c84a82fd58727b4215e619215d4596325c69fb88ac010000000000000016bc4606000000001976a914e7da370944c15306b3809580110b0a6c653ac5a988ac010000000000000000000000')

console.log(JSON.stringify(transaction.toJSON(), null, 2))