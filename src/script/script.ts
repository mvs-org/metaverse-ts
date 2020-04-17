const OPS = require('metaverse-ops')
const pushdata = require('pushdata-bitcoin')

let reverseOps: any = {}
for (let op in OPS) {
    let code = OPS[op]
    reverseOps[code] = op
}

// export * from './script.attenuation'
// export * from './script.p2pkh'

export type ScriptType = 'P2PKH' | 'P2SH' | 'CUSTOM' | 'ATTENUATION'

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
        return token
    }).join(' ')
    return script
}

export abstract class Script implements IScript {
    scriptType: ScriptType
    constructor(scriptType: ScriptType) {
        this.scriptType = scriptType
    }
    toASM() {
        return Script.toString(this.toBuffer())
    }

    toBuffer() {
        return Buffer.from('')
    }

    static fromFullnode(script: string) {
        return Script.toBuffer(fullnodeFormat(script))
    }

    static splitBuffer = function (buffer: Buffer) {
        let chunks: Buffer[] = []
        let i = 0

        while (i < buffer.length) {
            let opcode = buffer.readUInt8(i)
            // data chunk
            if ((opcode > OPS.OP_0) && (opcode <= OPS.OP_PUSHDATA4)) {
                let d = pushdata.decode(buffer, i)

                i += d.size

                // attempt to read too much data?
                if (i + d.number > buffer.length) return []

                let data = buffer.slice(i, i + d.number)
                i += d.number
                chunks.push(data)

                // opcode
            } else {
                chunks.push(reverseOps[opcode])
                i++
            }
        }
        return chunks
    }

    static toBuffer(asm: string) {
        if (asm.length == 0) return Buffer.from('')
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
                return '[ ' + chunk.toString('hex') + ' ]'
                // opcode
            } else {
                return chunk
            }
        }).join(' ')
    }

    static fromChunks(chunks: Buffer[]) {

        let bufferSize = chunks.reduce(function (accum, chunk) {
            // data chunk
            if (Buffer.isBuffer(chunk)) {
                return accum + pushdata.encodingLength(chunk.length) + chunk.length
            }
            // opcode
            return accum + 1
        }, 0.0)

        let buffer = Buffer.alloc(bufferSize)
        let offset = 0

        chunks.forEach(function (chunk) {
            // data chunk
            if (Buffer.isBuffer(chunk)) {
                offset += pushdata.encode(buffer, chunk.length, offset)

                chunk.copy(buffer, offset)
                offset += chunk.length

                // opcode
            } else {
                buffer.writeUInt8(chunk, offset)
                offset += 1
            }
        })
        return buffer
    }
}