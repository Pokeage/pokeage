/* pokeAge SDK: minimal little-endian Borsh codec.
   Just enough to serialize instruction args and decode the program's account
   structs without pulling in a full Borsh dependency. u64/i64 use bigint. The
   codec works on raw 32-byte keys so it stays free of any web3 dependency. */

/** anything that can hand back its 32 raw bytes (e.g. a web3 PublicKey). */
export interface BytesLike {
  toBytes(): Uint8Array;
}

export class BorshWriter {
  private parts: Buffer[] = [];

  u8(v: number): this {
    const b = Buffer.alloc(1);
    b.writeUInt8(v & 0xff, 0);
    this.parts.push(b);
    return this;
  }

  u16(v: number): this {
    const b = Buffer.alloc(2);
    b.writeUInt16LE(v & 0xffff, 0);
    this.parts.push(b);
    return this;
  }

  u32(v: number): this {
    const b = Buffer.alloc(4);
    b.writeUInt32LE(v >>> 0, 0);
    this.parts.push(b);
    return this;
  }

  u64(v: bigint | number): this {
    const b = Buffer.alloc(8);
    b.writeBigUInt64LE(BigInt(v), 0);
    this.parts.push(b);
    return this;
  }

  i64(v: bigint | number): this {
    const b = Buffer.alloc(8);
    b.writeBigInt64LE(BigInt(v), 0);
    this.parts.push(b);
    return this;
  }

  bool(v: boolean): this {
    return this.u8(v ? 1 : 0);
  }

  pubkey(v: BytesLike | Uint8Array): this {
    const bytes = v instanceof Uint8Array ? v : v.toBytes();
    this.parts.push(Buffer.from(bytes));
    return this;
  }

  /** prepend a raw 8-byte discriminator. */
  disc(d: readonly number[]): this {
