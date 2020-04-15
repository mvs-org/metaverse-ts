import { expect } from 'chai'
import { AttachmentETPTransfer, Attachment, AttachmentMessage, AttachmentMSTIssue, AttachmentMSTTransfer, AttachmentMITIssue, AttachmentMITTransfer, AttachmentAvatarTransfer, AttachmentAvatarRegister, ATTACHMENT_TYPE, ATTACHMENT_VERSION, AVATAR_STATUS, AttachmentDomainCertificate, AttachmentMiningCertificate , CERTIFICATE_STATUS, CERTIFICATE_TYPE } from './attachment'

describe('Attachment', () => {

  describe('Attachment Super Class', () => {
    class TestAttachment extends Attachment { }
    const attachment = new TestAttachment(100, 5)
    it('transform to buffer', () => {
      expect(attachment.toBuffer().toString('hex')).equal('0500000064000000')
    })
    it('transform to json', () => {
      expect(attachment.toJSON()).equal(attachment)
    })
    it('set digital identity', () => {
      attachment.setDid('testfrom', 'testto')
      expect(attachment.from_did).equal('testfrom')
    })
    it('detect illegal attachment type', () => {
      expect(() => Attachment.fromBuffer(Buffer.from('0100000099000000', 'hex'))).to.throw('Unsupported attachment type')
    })

  })

  describe('ETP Attachment', () => {
    const attachment = new AttachmentETPTransfer()
    it('transform to buffer', () => {
      expect(attachment.toBuffer().toString('hex')).equal('0100000000000000')
    })
    it('transform to json', () => {
      expect(attachment.toJSON()).to.deep.equal({ type: 0, version: 1 })
    })
  })

  describe('MIT Issue Attachment', () => {
    const serialized = 'cf0000000600000006446170686e6506446170686e650106444150484e45224d444772394866533872616d6f695851356a4a5565365448544a797062717774714c14446170686e652773204d49542061737365747320'
    const object = {
      type: ATTACHMENT_TYPE.MIT,
      version: ATTACHMENT_VERSION.DID,
      to_did: 'Daphne',
      from_did: 'Daphne',
      symbol: 'DAPHNE',
      content: 'Daphne\'s MIT assets ',
      address: 'MDGr9HfS8ramoiXQ5jJUe6THTJypbqwtqL',
    }
    const attachment = new AttachmentMITIssue('DAPHNE', 'MDGr9HfS8ramoiXQ5jJUe6THTJypbqwtqL', "Daphne's MIT assets ")
    attachment.setDid('Daphne', 'Daphne')
    it('serialize to buffer', () => {
      expect(attachment.toBuffer().toString('hex')).equal(serialized)
    })
    it('transform to json', () => {
      expect(attachment.toJSON()).to.deep.equal(object)
    })
    it('decode from buffer', ()=>{
      expect(Attachment.fromBuffer(Buffer.from(serialized, 'hex'))).to.deep.equal(object)
    })
  })

  describe('MIT Transfer Attachment', () => {
    const attachment = new AttachmentMITTransfer('DAPHNE', 'MDGr9HfS8ramoiXQ5jJUe6THTJypbqwtqL')
    const serialized = '01000000060000000206444150484e45224d444772394866533872616d6f695851356a4a5565365448544a797062717774714c'
    const object = {
      type: ATTACHMENT_TYPE.MIT,
      version: ATTACHMENT_VERSION.DEFAULT,
      symbol: 'DAPHNE',
      address: 'MDGr9HfS8ramoiXQ5jJUe6THTJypbqwtqL',
    }
    it('serialize to buffer', () => {
      expect(attachment.toBuffer().toString('hex')).equal(serialized)
    })
    it('decode from buffer', ()=>{
      expect(Attachment.fromBuffer(Buffer.from(serialized, 'hex'))).to.deep.equal(object)
    })
    it('transform to json', () => {
      expect(attachment.toJSON()).to.deep.equal(object)
    })
  })

  describe('Avatar Register Attachment', () => {
    const attachment = new AttachmentAvatarRegister('cangr', 'MQWyTasDiEsAUqHy6fHuvzA2vozcVCVizQ')
    const serialized = '0100000004000000010563616e6772224d51577954617344694573415571487936664875767a4132766f7a63564356697a51'
    const object = {
      type: ATTACHMENT_TYPE.AVATAR,
      version: ATTACHMENT_VERSION.DEFAULT,
      symbol: 'cangr',
      address: 'MQWyTasDiEsAUqHy6fHuvzA2vozcVCVizQ',
      status: AVATAR_STATUS.REGISTER,
    }
    it('serialize to buffer', () => {
      expect(attachment.toBuffer().toString('hex')).equal(serialized)
    })
    it('decode from buffer', ()=>{
      expect(Attachment.fromBuffer(Buffer.from(serialized, 'hex'))).to.deep.equal(object)
    })
    it('transform to json', () => {
      expect(attachment.toJSON()).to.deep.equal(object)
    })
  })

  describe('Avatar Transfer Attachment', () => {
    const attachment = new AttachmentAvatarTransfer('cangr', 'MQWyTasDiEsAUqHy6fHuvzA2vozcVCVizQ')
    const serialized = '0100000004000000020563616e6772224d51577954617344694573415571487936664875767a4132766f7a63564356697a51'
    const object = {
      type: ATTACHMENT_TYPE.AVATAR,
      version: ATTACHMENT_VERSION.DEFAULT,
      symbol: 'cangr',
      address: 'MQWyTasDiEsAUqHy6fHuvzA2vozcVCVizQ',
      status: AVATAR_STATUS.TRANSFER,
    }
    it('serialize to buffer', () => {
      expect(attachment.toBuffer().toString('hex')).equal(serialized)
    })
    it('decode from buffer', ()=>{
      expect(Attachment.fromBuffer(Buffer.from(serialized, 'hex'))).to.deep.equal(object)
    })
    it('transform to json', () => {
      expect(attachment.toJSON()).to.deep.equal(object)
    })
  })

  describe('Message Attachment', () => {
    const attachment = new AttachmentMessage('hello')
    it('serialize to buffer', () => {
      expect(attachment.toBuffer().toString('hex')).equal('01000000030000000568656c6c6f')
    })
    it('transform to json', () => {
      expect(attachment.toJSON()).to.deep.equal({ type: 3, version: 1, data: 'hello' })
    })
    it('decode from buffer', () => {
      expect(Attachment.fromBuffer(Buffer.from('01000000030000000568656c6c6f', 'hex'))).to.deep.equal({ type: 3, version: 1, data: 'hello' })
    })
  })

  describe('MST Transfer Attachment', () => {
    const hug = {
      "symbol": "MVS.HUG",
      "quantity": 2,
      "type": 2,
      "version": 1,
    }
    const attachment = new AttachmentMSTTransfer(
      hug.symbol,
      hug.quantity,
    )

    it('transform to buffer', () => {
      expect(attachment.toBuffer().toString('hex')).equal('010000000200000002000000074d56532e4855470200000000000000')
    })
    it('transform to json', () => {
      expect(attachment.toJSON()).to.deep.equal(hug)
    })
    it('decode from buffer', () => {
      expect(Attachment.fromBuffer(Buffer.from('010000000200000002000000074d56532e4855470200000000000000', 'hex'))).to.deep.equal(hug)
    })
  })

  describe('Domain Certificate Attachment', () => {
    const object = {
      "symbol": "MVS",
      "owner": 'cangr',
      "address": 'MQWyTasDiEsAUqHy6fHuvzA2vozcVCVizQ',
      "version": 1,
      certType: CERTIFICATE_TYPE.DOMAIN,
      status: CERTIFICATE_STATUS.ISSUE,
      type: ATTACHMENT_TYPE.CERTIFICATE,
      content: undefined,
    }
    const serialized = '0100000005000000034d56530563616e6772224d51577954617344694573415571487936664875767a4132766f7a63564356697a510200000001'
    const attachment = new AttachmentDomainCertificate(
      object.symbol,
      object.owner,
      object.address,
      CERTIFICATE_STATUS.ISSUE,
    )
    it('transform to buffer', () => {
      expect(attachment.toBuffer().toString('hex')).equal(serialized)
    })
    it('transform to json', () => {
      expect(attachment.toJSON()).to.deep.equal(object)
    })
    it('decode from buffer', () => {
      expect(Attachment.fromBuffer(Buffer.from(serialized, 'hex'))).to.deep.equal(object)
    })
  })

  describe('Mining Certificate Attachment', () => {
    const object = {
      symbol: 'MVS',
      owner: 'cangr',
      address: 'MQWyTasDiEsAUqHy6fHuvzA2vozcVCVizQ',
      version: 1,
      certType: CERTIFICATE_TYPE.MINING,
      status: CERTIFICATE_STATUS.DEFAULT,
      type: ATTACHMENT_TYPE.CERTIFICATE,
      content: 'abc',
    }
    const serialized = '0100000005000000034d56530563616e6772224d51577954617344694573415571487936664875767a4132766f7a63564356697a51040000600003616263'
    const attachment = new AttachmentMiningCertificate(
      object.symbol,
      object.owner,
      object.address,
      CERTIFICATE_STATUS.DEFAULT,
      object.content,
    )
    it('transform to buffer', () => {
      expect(attachment.toBuffer().toString('hex')).equal(serialized)
    })
    it('transform to json', () => {
      expect(attachment.toJSON()).to.deep.equal(object)
    })
    it('decode from buffer', () => {
      expect(Attachment.fromBuffer(Buffer.from(serialized, 'hex'))).to.deep.equal(object)
    })
  })

  describe('Did Attachment', () => {
    it('encode did', () => {
      class TestAttachment extends Attachment { }

      expect(new TestAttachment(1).setDid('foo').encodeDid().toString('hex')).equal('0003666f6f')
      expect(new TestAttachment(1, 1).setDid('foo', 'bar').encodeDid().toString('hex')).equal('0362617203666f6f')
      expect(new TestAttachment(1, 1).setDid(undefined, 'foo').encodeDid().toString('hex')).equal('03666f6f00')
      expect(new TestAttachment(1, 1).encodeDid().toString('hex')).equal('')
    })
    it('did enabled etp transfer', () => {
      const attachment = new AttachmentETPTransfer(
        2,
      ).setDid('foo', 'bar')
      expect(attachment.toBuffer().toString('hex')).equal('cf000000000000000362617203666f6f')
      expect(Attachment.fromBuffer(Buffer.from('cf000000000000000362617203666f6f', 'hex')).toJSON()).deep.equal({
        to_did: 'foo',
        from_did: 'bar',
        type: ATTACHMENT_TYPE.ETP_TRANSFER,
        version: ATTACHMENT_VERSION.DID,
      })
      expect(Attachment.fromBuffer(Buffer.from('cf000000000000000003626172', 'hex')).toJSON()).deep.equal({
        from_did: '',
        to_did: 'bar',
        type: ATTACHMENT_TYPE.ETP_TRANSFER,
        version: ATTACHMENT_VERSION.DID,
      })
      expect(Attachment.fromBuffer(Buffer.from('cf000000000000000362617200', 'hex')).toJSON()).deep.equal({
        from_did: 'bar',
        to_did: '',
        type: ATTACHMENT_TYPE.ETP_TRANSFER,
        version: ATTACHMENT_VERSION.DID,
      })
    })
  })

  describe('MST Issue Attachment', () => {
    const smile = {
      "address": "MMV11MYH7rv6x7zSnESUzYrbFiEAPDe3VC",
      "description": "try this smile",
      "issuer": "adelachen",
      "maxSupply": 100,
      "precision": 0,
      "secondaryIssueThreshold": 0,
      "symbol": "SMILE",
      "type": 2,
      "version": 1,
    }
    const attachment = new AttachmentMSTIssue(
      smile.symbol,
      smile.maxSupply,
      smile.precision,
      smile.secondaryIssueThreshold,
      smile.issuer,
      smile.address,
      smile.description,
    )
    it('encode as strig', () => {
      expect(attachment.toString()).equal('01000000020000000100000005534d494c45640000000000000000000000096164656c616368656e224d4d5631314d59483772763678377a536e4553557a597262466945415044653356430e747279207468697320736d696c65')
    })
    it('encode as buffer', () => {
      expect(attachment.toBuffer().toString('hex')).equal('01000000020000000100000005534d494c45640000000000000000000000096164656c616368656e224d4d5631314d59483772763678377a536e4553557a597262466945415044653356430e747279207468697320736d696c65')
    })
    it('transform to json', () => {
      expect(attachment.toJSON()).to.deep.equal({ type: 3, version: 1, ...smile })
    })
    it('decode from buffer', () => {
      expect(Attachment.fromBuffer(Buffer.from('01000000020000000100000005534d494c45640000000000000000000000096164656c616368656e224d4d5631314d59483772763678377a536e4553557a597262466945415044653356430e747279207468697320736d696c65', 'hex'))).to.deep.equal(smile)
    })
  })

})