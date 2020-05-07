import { expect } from 'chai'
import { Block } from './block'

describe('Block', () => {
  const powBlockString = '01000000921e76e1a8a9ee32c026dd2dafa71c9cea9c653deee966fd78815f66f0120d97090eac8ad6cfc5e1aad41ec72c120af3853ebfa39d70d4d7ea369b9b64061503a3e3d15c0000000000000000000000000000000000000000000000000000096a069fad4f3440601f66682062e3a309cc023001e9d4f7f0247a0ea02513c83d587c8963fa9dcfd95f677b5982c09121000101000000010000000000000000000000000000000000000000000000000000000000000000ffffffff0403c0912100000000018383900e000000001976a9141ce4fdee49d444ec5ee28b4f417a18b7d4d5fc7988ac000000000000000000000000'
  const powBlockObject = {
      hash: '2c58a72a39649afd33debe893bb4fdfd886e2f2d7d0d109edf73786ac5a03bd8',
      "bits": "4fad9f066a090000000000000000000000000000000000000000000000000000",
      "merke_root": "031506649b9b36ead7d4709da3bf3e85f30a122cc71ed4aae1c5cfd68aac0e09",
      "mixhash": "82597b675fd9cf9dfa63897c583dc81325a00e7a24f0f7d4e9013002cc09a3e3",
      "nonce": '3440601f66682062',
      "number": 2200000,
      "previous_block": "970d12f0665f8178fd66e9ee3d659cea9c1ca7af2ddd26c032eea9a8e1761e92",
      "timestamp": 1557259171,
      "transactions": [
        {
          txid: '031506649b9b36ead7d4709da3bf3e85f30a122cc71ed4aae1c5cfd68aac0e09',
          "inputs": [
            {
              "prevOutId": "0000000000000000000000000000000000000000000000000000000000000000",
              "prevOutIndex": -1,
              "script": "[ c09121 ]",
              "sequence": 0,
            }
          ],
          "lock_time": 0,
          "outputs": [
            {
              "attachment": {
                "type": 0,
                "version": 0,
              },
              "script": "OP_DUP OP_HASH160 [ 1ce4fdee49d444ec5ee28b4f417a18b7d4d5fc79 ] OP_EQUALVERIFY OP_CHECKSIG",
              "value": 244351875,
            }
          ],
          "version": 1,
        }
      ],
      "version": 1,
    }

    const posBlockString = '02000000b7e935b501ea03f2a4d1e841e3056fe6a798f220a16faf029dfd88e204d9f482ca25333f941473c33c4665698bb1615bdd27269166772196147223ed2501025be53d995e00000000000000000000000000000000000000000000000000000001626345820000000000000000000000000000000000000000000000000000000000000000000000000000000098c136000201000000010000000000000000000000000000000000000000000000000000000000000000ffffffff040398c136000000000167ac3f01000000001976a914b647fe80c145b24f2bb82ef4cc9bec264116bc5f88ac0000000000000000000000000200000001ea3e9d7aab07e8b410846466c87112963e78c7af562de13411d6b5b0a1c359ac010000006b483045022100b8b5fff6b21be18cc57458cf25c0f3a78815a8b301c66ac95e3db87c6c6b82c402206c438d45eb93b8687701463c3104b1c4d43a07565e7ef45f56fb5e0ae4ee7a410121033a3de166218712ea5739febc926c7744464792e6c89b132e296eaaf25c598562ffffffff0200000000000000000000000000fffffffff9814c76170000001976a914b647fe80c145b24f2bb82ef4cc9bec264116bc5f88ac010000000000000000000000a3ce585a2d547e2f7597147be630f5eab1583517d411a956e5976f603374666c7dc57ab00571ad146c4839d603b2670f2ebdd46c7c81f42f6f33ea6ce47f526a'

    describe('hash', () => {
      it('pow block #2200000', () => {      
        expect(Block.decode(powBlockString).getHash()).to.equal('2c58a72a39649afd33debe893bb4fdfd886e2f2d7d0d109edf73786ac5a03bd8')
        expect(Block.decode(powBlockString).getHash('buffer').toString('hex')).to.equal('2c58a72a39649afd33debe893bb4fdfd886e2f2d7d0d109edf73786ac5a03bd8')
      })
      it('pos block #3588504', () => {      
        expect(Block.decode(posBlockString).getHash('buffer').toString('hex')).to.equal('b7766b58e183c59662156392fa7e49d8c4465adf690fbf7d5ee22c41d5839b56')
      })
    })

    describe('serialize', () => {
      it('pow block #2200000', () => {      
        expect(Block.decode(powBlockString).toBuffer().toString('hex')).to.equal(powBlockString)
      })
      it('pos block #3588504', () => {      
        expect(Block.decode(posBlockString).toString()).to.equal(posBlockString)
      })
    })


    describe('deserialize', () => {
      it('pow block #2200000', () => {      
        expect(Block.decode(powBlockString).toJSON()).to.deep.equal(powBlockObject)
        expect(Block.decode(Buffer.from(powBlockString, 'hex')).toJSON()).to.deep.equal(powBlockObject)
      })
      it('pos block #3588504 blocksig', () => {      
        expect(Block.decode(posBlockString).toJSON().blocksig).to.equal('a3ce585a2d547e2f7597147be630f5eab1583517d411a956e5976f603374666c7dc57ab00571ad146c4839d603b2670f2ebdd46c7c81f42f6f33ea6ce47f526a')
      })
    })

})