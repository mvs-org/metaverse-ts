import { expect, } from 'chai'
import { getNetwork, Networks } from './network'

describe('Networks', () => {

  describe('Get Network', () => {
    it('get network from string', () => {
      expect(getNetwork('testnet')).deep.equal(Networks.testnet);
      expect(getNetwork('mainnet')).deep.equal(Networks.mainnet);
    })
    it('get network from object', () => {
      expect(getNetwork(Networks.testnet)).deep.equal(Networks.testnet);
      expect(getNetwork(Networks.mainnet)).deep.equal(Networks.mainnet);
    })
  })

})