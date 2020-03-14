const { HDWallet } = require('../lib')

console.info(`

--------------------------------------
  Generate a new wallet
--------------------------------------`)
const basePath = 'm'
// Generate new mnemonic
const mnemonic = HDWallet.generateMnemonic()
// Import generated mnemonic
const newWallet = HDWallet.fromMnemonic(mnemonic)
// Generate new addresses
const newAddresses = []
for(let i=0; i<10; i++) newAddresses.push(newWallet.getAddress(basePath+'/'+i))
console.log({
    mnemonic,
    addresses: newAddresses,
})

console.info(`

--------------------------------------
  Find a hd node for a given address 
--------------------------------------`)
console.info(`/**
 * 
 */`)
const targetAddress = 'MDsdkxkRtZGaQTdVerx6whQY3S4VWTSSpg'
// Import existing wallet
const wallet = HDWallet.fromMnemonic('heavy blouse age awkward village report universe flee pizza praise allow drip carbon window cupboard honey quit october word settle ask echo legal perfect')
// Search for address
const reconstructedPath = wallet.getAddressPath(targetAddress)
// Contruct some addresses (to see that the address was found)
const addresses = []
for(let i=0; i<10; i++) addresses.push(wallet.getAddress('m/'+i))

console.log({
    addresses,
    targetAddress,
    reconstructedPath,
})

const w = HDWallet.fromMnemonic('lunar there win define minor shadow damage lounge bitter abstract sail alcohol yellow left lift vapor tourist rent gloom sustain gym dry congress zero')
const addr = []
for(let i=0; i<10; i++) addr.push(w.getAddress('m/'+i))
console.log(addr)
