import { expect, } from 'chai'
import { Input } from './input'

describe('Input', () => {

  describe('Encode', () => {
      const scriptInput = new Input('2ce5f8d7610424a5180f8d7b3038b019d2e7bc4adfa008206dc8b5a898d676b8', 0, '[ 3044022069b331762136a4be093d46869758e0c5ff352529ad68a1f90a4188e33e6004df0220667a8c18bb9800fecbfa6a6c7a21ac5677778b7729ae56e94c913b2312a43da901 ] [ 03afa153f4c9ba1bd19ef2f1d765c51e30a4a0705cb61b4efee3c72fc3a11c0e5f ]')
      const noscriptInput = new Input('2ce5f8d7610424a5180f8d7b3038b019d2e7bc4adfa008206dc8b5a898d676b8', 0)
    it('encode to buffer', () => {
      expect(scriptInput.toBuffer().toString('hex')).equal('b876d698a8b5c86d2008a0df4abce7d219b038307b8d0f18a5240461d7f8e52c000000006a473044022069b331762136a4be093d46869758e0c5ff352529ad68a1f90a4188e33e6004df0220667a8c18bb9800fecbfa6a6c7a21ac5677778b7729ae56e94c913b2312a43da9012103afa153f4c9ba1bd19ef2f1d765c51e30a4a0705cb61b4efee3c72fc3a11c0e5fffffffff');
      expect(noscriptInput.toBuffer().toString('hex')).equal('b876d698a8b5c86d2008a0df4abce7d219b038307b8d0f18a5240461d7f8e52c0000000000ffffffff');
    })
    it('clear script', ()=>{
      expect(scriptInput.clearScript().script.toString('hex')).to.equal('')
    })
  })

})