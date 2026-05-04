import { BorshWriter, BorshReader } from '../src/borsh';

describe('borsh codec', () => {
  it('round-trips scalar values little-endian', () => {
    const key = new Uint8Array(32);
    for (let i = 0; i < 32; i++) key[i] = i + 1;

    const buf = new BorshWriter()
      .u8(7)
      .u16(513)
      .u32(70000)
      .u64(123456789012345n)
      .i64(-42n)
      .bool(true)
      .pubkey(key)
      .build();

    const r = new BorshReader(buf);
    expect(r.u8()).toBe(7);
    expect(r.u16()).toBe(513);
    expect(r.u32()).toBe(70000);
    expect(r.u64()).toBe(123456789012345n);
    expect(r.i64()).toBe(-42n);
    expect(r.bool()).toBe(true);
    expect(Array.from(r.pubkey())).toEqual(Array.from(key));
  });

  it('accepts a BytesLike key (toBytes)', () => {
    const bytes = new Uint8Array(32).fill(9);
    const buf = new BorshWriter().pubkey({ toBytes: () => bytes }).build();
    expect(buf.length).toBe(32);
    expect(buf[0]).toBe(9);
  });

  it('prepends a discriminator', () => {
    const buf = new BorshWriter().disc([1, 2, 3, 4, 5, 6, 7, 8]).u8(9).build();
    expect(Array.from(buf.subarray(0, 8))).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(buf[8]).toBe(9);
  });

  it('skips bytes on read', () => {
    const buf = new BorshWriter().u32(0).u8(99).build();
    expect(new BorshReader(buf).skip(4).u8()).toBe(99);
  });
});
