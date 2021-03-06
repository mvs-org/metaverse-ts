import { Network } from 'bitcoinjs-lib'

export const Networks = {
    mainnet: {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'bc',
        bip32: {
            public: 0x0488b21e,
            private: 0x0488ade4,
        },
        pubKeyHash: 0x32,
        scriptHash: 0x05,
        locktimes: [25200, 108000, 331200, 655200, 1314000],
        wif: 0x80,
    },
    testnet: {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'bc',
        bip32: {
            public: 0x0488b21e,
            private: 0x0488ade4,
        },
        pubKeyHash: 0x7f,
        scriptHash: 0xc4,
        locktimes: [10, 20, 30, 40, 50],
        wif: 0xef,
    },
}

export const DEFAULT_NETWORK = Networks.mainnet

export function getNetwork(network?: Network | string) {
    if (typeof network === 'string') return network === 'testnet' ? Networks[network] : Networks['mainnet']
    else if(network === undefined) return DEFAULT_NETWORK
    return network
}