import { bip32, payments, Network, } from 'bitcoinjs-lib'
import { mnemonicToSeedSync, validateMnemonic, generateMnemonic, wordlists } from 'bip39'
import { getNetwork } from '../network/network'

export const DEFAULT_PATH = '0'

export class HDWallet {

    private network: Network

    constructor(public rootNode: bip32.BIP32Interface, network: Network | string = 'mainnet') {
        this.network = getNetwork(network)
        this.rootNode.network = this.network
    }

    getAddress(path: string | number) {
        const pubkey = typeof path === 'number' ? this.rootNode.derive(path).publicKey : this.rootNode.derivePath(path).publicKey
        return payments.p2pkh({ pubkey, network: this.network }).address
    }

    toBase58(path?: string | number) {
        if (typeof path === 'number') {
            path = String(path)
        }
        if (path === undefined) return this.rootNode.toBase58()
        return this.rootNode.derivePath(path).toBase58()
    }

    getWIF(path?: string) {
        if (path === undefined) return this.rootNode.toWIF()
        return this.rootNode.derivePath(path).toWIF()
    }

    static fromBase58(key: string, network?: Network | string) {
        return new HDWallet(bip32.fromBase58(key, getNetwork(network)), network)
    }

    static fromMnemonic(mnemonic: string, network?: string | Network) {
        HDWallet.validateMnemonic(mnemonic, true)
        return new HDWallet(bip32.fromSeed(mnemonicToSeedSync(mnemonic)), getNetwork(network))
    }

    static generateMnemonic(strength = 256, language = 'en', rng?: (size: number) => Buffer): string {
        return generateMnemonic(strength, rng, wordlists[language])
    }

    static validateMnemonic(mnemonic: string, throwOnError = false) {
        if (throwOnError && !validateMnemonic(mnemonic)) {
            throw Error('Invalid mnemonic')
        }
        return validateMnemonic(mnemonic)
    }

}