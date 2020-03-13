import { expect, } from 'chai'
import { AttachmentETPTransfer, Attachment, AttachmentMessage, AttachmentMSTIssue, AttachmentMSTTransfer } from './attachment';

describe('Attachment', () => {

  describe('Attachment Super Class', () => {
    class TestAttachment extends Attachment { }
    const attachment = new TestAttachment(100, 5)
    it('transform to buffer', () => {
      expect(attachment.toBuffer().toString('hex')).equal('');
    })
    it('transform to json', () => {
      expect(attachment.toJSON()).equal(attachment);
    })
    it('set digital identity', () => {
      attachment.setDid('testfrom', 'testto')
      expect(attachment.from_did).equal('testfrom');
    })
    it('detect illegal attachment type', () => {
      expect(()=>Attachment.fromBuffer(Buffer.from('0100000099000000', 'hex'))).to.throw('Unsupported attachment type');
    })

  })

  describe('ETP Attachment', () => {
    const attachment = new AttachmentETPTransfer()
    it('transform to buffer', () => {
      expect(attachment.toBuffer().toString('hex')).equal('0100000000000000');
    })
    it('transform to json', () => {
      expect(attachment.toJSON()).to.deep.equal({ type: 0, version: 1 });
    })
  })

  describe('Message Attachment', () => {
    const attachment = new AttachmentMessage('hello')
    it('transform to buffer', () => {
      expect(attachment.toBuffer().toString('hex')).equal('01000000030000000568656c6c6f');
    })
    it('transform to json', () => {
      expect(attachment.toJSON()).to.deep.equal({ type: 3, version: 1, data: 'hello' });
    })
    it('decode from buffer', ()=>{
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
      expect(attachment.toBuffer().toString('hex')).equal('010000000200000002000000074d56532e4855470200000000000000');
    })
    it('transform to json', () => {
      expect(attachment.toJSON()).to.deep.equal(hug);
    })
    it('decode from buffer', () => {
      expect(Attachment.fromBuffer(Buffer.from('010000000200000002000000074d56532e4855470200000000000000', 'hex'))).to.deep.equal(hug)
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
    it('transform to buffer', () => {
      expect(attachment.toBuffer().toString('hex')).equal('01000000020000000100000005534d494c45640000000000000000000000096164656c616368656e224d4d5631314d59483772763678377a536e4553557a597262466945415044653356430e747279207468697320736d696c65');
    })
    it('transform to json', () => {
      expect(attachment.toJSON()).to.deep.equal({ type: 3, version: 1, ...smile });
    })
    it('decode from buffer', () => {
      expect(Attachment.fromBuffer(Buffer.from('01000000020000000100000005534d494c45640000000000000000000000096164656c616368656e224d4d5631314d59483772763678377a536e4553557a597262466945415044653356430e747279207468697320736d696c65', 'hex'))).to.deep.equal(smile)
    })
  })

});