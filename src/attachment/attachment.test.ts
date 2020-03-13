import { expect, } from 'chai'
import { AttachmentETPTransfer, Attachment } from './attachment';

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


});