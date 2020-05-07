import { IEncodable, toVarInt, readSlice, readVarInt } from '../encoder/encoder'
import { Transaction, ITransaction } from '../transaction/transaction'
import { BlockHeader, BlockVersion, IBlockHeader } from './header'

export interface IBlock extends IBlockHeader {
    hash: string
    transactions: ITransaction[]
    blocksig?: string
}

export class Block implements IEncodable {

    constructor(
        public header: BlockHeader,
        public transactions: Transaction[],
        public blocksig?: string,
    ) { }

    /**
     * Serializes the block as a buffer.
     *
     * @returns buffer
     */
    toBuffer() {
        return Buffer.concat([
            this.header.toBuffer(),
            toVarInt(this.transactions.length),
            ...this.transactions.map(tx=>tx.toBuffer()),
            this.blocksig ? Buffer.from(this.blocksig, 'hex') : Buffer.from(''),
        ])
    }

    /**
     * Serializes the block into hex encoded string.
     *
     * @returns hex encoded string
     */
    toString() {
        return this.toBuffer().toString('hex')
    }

    /**
     * Get the block hash
     *
     * @param format hex or buffer format
     * @returns block hash as string or buffer depending on the chosen format
     */
    getHash(format: 'buffer' | 'hex' = 'hex') {
        const buffer = this.header.hash()
        return format === 'buffer' ? buffer : buffer.toString('hex')
    }

    toJSON(network?: string): IBlock {
        return {
            hash: this.getHash().toString('hex'),
            ...this.header.toJSON(),
            transactions: this.transactions.map(tx=>tx.toJSON(network)),
            ... ( this.blocksig && { blocksig: this.blocksig }),
        }
    }

    static decode(data: Buffer | string) {
        if (typeof data === 'string') {
            data = Buffer.from(data, 'hex')
        }
        const bufferstate = {buffer: data, offset: 0}
        const header = BlockHeader.decode(readSlice(bufferstate, BlockHeader.SIZE))
        const txCount = readVarInt(bufferstate).number
        const transactions = []
        for(let i=0; i<txCount; i++){
            transactions.push(Transaction.decode(bufferstate))
        }

        return new Block(
            header,
            transactions,
            header.version === BlockVersion.POS ? readSlice(bufferstate, 64).toString('hex') : undefined,
        )
    }

}

