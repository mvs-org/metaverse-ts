import { toUInt8, toVarStr } from '../encoder/encoder'
const OPS = require('metaverse-ops')
const base58check = require('base58check')
const pushdata = require('pushdata-bitcoin')

var reverseOps: any = {};
for (var op in OPS) {
    var code = OPS[op];
    reverseOps[code] = op;
}

export type ScriptType = 'P2PKH' | 'P2SH' | 'CUSTROM'

export interface IScript {
    scriptType: ScriptType
}


function fullnodeFormat(script: string) {
    let level = 0
    script = script.split(' ').map(token => {
        if (token == '[') {
            level++
        } else if (token == ']') {
            level--
        } else if (level == 0) {
            return 'OP_' + token.toUpperCase()
        }
        return token;
    }).join(' ')
    return script
}

export abstract class Script implements IScript {
    scriptType: ScriptType
    constructor(scriptType: ScriptType) {
        this.scriptType = scriptType
    }
    toBuffer() {
        return Buffer.from('')
    }

    static fromFullnode(script: string) {
        return Script.toBuffer(fullnodeFormat(script))
    }

    static splitBuffer = function (buffer: Buffer) {
        var chunks: Buffer[] = [];
        var i = 0;

        while (i < buffer.length) {
            var opcode = buffer.readUInt8(i);
            // data chunk
            if ((opcode > OPS.OP_0) && (opcode <= OPS.OP_PUSHDATA4)) {
                var d = pushdata.decode(buffer, i);

                i += d.size;

                // attempt to read too much data?
                if (i + d.number > buffer.length) return []

                var data = buffer.slice(i, i + d.number);
                i += d.number;
                chunks.push(data);

                // opcode
            } else {
                chunks.push(reverseOps[opcode])
                i++;
            }
        }
        return chunks;
    }

    static toBuffer(asm: string) {
        if(asm.length==0) return Buffer.from('')
        let level = 0
        let chunks: Buffer[] = []
        asm.split(' ').forEach(chunkStr => {
            if (chunkStr == '[') level++
            else if (chunkStr == ']') level--
            else {
                if (level == 0) {
                    chunkStr = chunkStr.toUpperCase()
                    if (OPS[chunkStr]) chunks.push(OPS[chunkStr])
                    else if (OPS['OP_' + chunkStr]) chunks.push(OPS['OP_' + chunkStr])
                    else throw 'Unknown OP code'
                } else {
                    chunks.push(Buffer.from(chunkStr, 'hex'))
                }
            }
        })
        return Script.fromChunks(chunks)
    }

    static toString = function (buffer: Buffer) {
        return Script.splitBuffer(buffer).map((chunk) => {
            // data chunk
            if (Buffer.isBuffer(chunk)) {
                return '[ ' + chunk.toString('hex') + ' ]';
                // opcode
            } else {
                return chunk;
            }
        }).join(' ');
    }

    static fromChunks(chunks: Buffer[]) {

        var bufferSize = chunks.reduce(function (accum, chunk) {
            // data chunk
            if (Buffer.isBuffer(chunk)) {
                return accum + pushdata.encodingLength(chunk.length) + chunk.length;
            }
            // opcode
            return accum + 1;
        }, 0.0);

        var buffer = Buffer.alloc(bufferSize);
        var offset = 0;

        chunks.forEach(function (chunk) {
            // data chunk
            if (Buffer.isBuffer(chunk)) {
                offset += pushdata.encode(buffer, chunk.length, offset);

                chunk.copy(buffer, offset);
                offset += chunk.length;

                // opcode
            } else {
                buffer.writeUInt8(chunk, offset);
                offset += 1;
            }
        });
        return buffer;
    };
}

export class ScriptP2PKH extends Script {
    address: string

    constructor(address: string) {
        super('P2PKH')
        this.address = address
    }

    toBuffer() {
        return Buffer.concat([
            toUInt8(25),
            toUInt8(OPS.OP_DUP),
            toUInt8(OPS.OP_HASH160),
            toVarStr(base58check.decode(this.address, 'hex').data, 'hex'),
            toUInt8(OPS.OP_EQUALVERIFY),
            toUInt8(OPS.OP_CHECKSIG),
        ])
    }
}