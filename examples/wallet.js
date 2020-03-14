const { HDWallet } = require('../lib')

const mnemonic = HDWallet.generateMnemonic()

const wallet = HDWallet.fromMnemonic(mnemonic)

const addresses = []
for(let i=0; i<10; i++) addresses.push(wallet.getAddress('m/0/'+i))

console.log({
    mnemonic,
    addresses,
})