<p align="center">
  <a href="https://mvs.org/">
    <img width="200" src="https://raw.githubusercontent.com/mvs-org/lightwallet/master/src/assets/logo.png" alt="">
  </a>
  <br>
  <a href='https://coveralls.io/github/mvs-org/metaverse-ts?branch=master'><img src='https://coveralls.io/repos/github/mvs-org/metaverse-ts/badge.svg?branch=master' alt='Coverage Status' /></a>
  <a href='https://github.com/mvs-org/metaverse-ts/actions?query=workflow%3Atest'><img src='https://github.com/mvs-org/metaverse-ts/workflows/test/badge.svg' alt='Test Status' /></a>
  <br>
  JavaScript library for the Metaverse Blockchain
</p>

## Usage

### Wallet

Generate new backup words
```
const { HDWallet } = require('./lib')

console.log(HDWallet.generateMnemonic()) // default english
// fold tail simple strike dress salt away satisfy sorry relief silent beyond route olympic carpet motor liquid together knife hollow original jelly antenna project

console.log(HDWallet.generateMnemonic('chinese_simplified'))
// 碍 掩 涉 礼 思 杂 舞 谷 部 们 鼻 翻 行 杯 江 副 双 机 龙 幼 印 压 桥 浆

console.log(HDWallet.generateMnemonic('chinese_traditional'))
// 酷 飲 無 敏 陪 充 齒 紳 烏 腦 晶 抹 逮 濱 布 乘 概 層 沫 飾 籠 蓄 陶 騙

console.log(HDWallet.generateMnemonic('french'))
// cascade oiseau moelleux flocon vision farouche blanchir abyssal ligoter défensif malaxer fiole corniche miette aquarium torpille cachette opaque chose extensif gratuit méditer respect étoffer

console.log(HDWallet.generateMnemonic('spanish'))
// maldad pulpo lástima pálido típico aprender agitar enorme pintor pesca tapete náusea envío pezuña avance flujo forma agonía sodio botín juzgar orca espuma óptica

console.log(HDWallet.generateMnemonic('japanese'))
// いれもの　たわむれる　ねんちゃく　らくだ　うくれれ　ひほう　しゃうん　きさい　ひれい　まぬけ　みかた　ぐこう　じどう　くしょう　ばいばい　つごう　よろしい　うせつ　ざっそう　ねんきん　すべる　こぐま　えきたい　ずっと

console.log(HDWallet.generateMnemonic('korean'))
// 기침 암시 남산 공통 독일 통로 영웅 정장 그룹 옷차림 전세 출판 강남 수컷 아시아 명의 수건 법적 냉면 집안 정지 꽃잎 병아리 공통
```

Validate backup words
```
console.log(HDWallet.validateMnemonic('fold tail simple strike dress salt away satisfy sorry relief silent beyond route olympic carpet motor liquid together knife hollow original jelly antenna project'))
// true
```

## Attachments

Encode attachments
```
const { AttachmentMSTTransfer } = require('./lib')

const attachment = new AttachmentMSTTransfer(
      'MVS.HUG',
      1,
    )

console.log(attachment.toBuffer())
// <Buffer 01 00 00 00 02 00 00 00 02 00 00 00 07 4d 56 53 2e 48 55 47 01 00 00 00 00 00 00 00>
```

Decode attachments
```
console.log(Attachment.fromBuffer(Buffer.from('010000000200000002000000074d56532e4855470100000000000000', 'hex')))
// AttachmentMSTTransfer { type: 2, version: 1, symbol: 'MVS.HUG', quantity: 1 }

console.log(Attachment.fromBuffer(Buffer.from('01000000000000000', 'hex')))
// AttachmentETPTransfer { type: 0, version: 1 }
```

## Outputs

```
// decode from buffer
const output = Output.fromBuffer(Buffer.from('00e1f505000000001976a914e7da370944c15306b3809580110b0a6c653ac5a988ac0100000000000000', 'hex'))

// create ETP outputs
const etpOutput = new OutputETPTransfer('MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve', 100000000)

// get json format
console.log(output.toJSON())
// { 
//    value: 100000000,
//    script: 'OP_DUP OP_HASH160 [ e7da370944c15306b3809580110b0a6c653ac5a9 ] OP_EQUALVERIFY OP_CHECKSIG',
//    attachment: AttachmentETPTransfer { type: 0, version: 1 } 
// }

// encode output
console.log(etpOutput.toBuffer())
// <Buffer 00 e1 f5 05 00 00 00 00 1a 19 76 a9 14 61 fd e3 bd 4e 69 55 c9 9b 16 de 2d 71 e2 a3 69 88 8a 1c 0b 88 ac 01 00 00 00 00 00 00 00>
console.log(etpOutput.toString())
// 00e1f505000000001a1976a91461fde3bd4e6955c99b16de2d71e2a369888a1c0b88ac0100000000000000
```
