import {
  cardPriceSol,
  levelMultiplier,
  stageMultiplier,
  mintFeeLamports,
  instantSellQuote,
  tierFromCode,
  tierToCode,
} from '../src/pricing';

describe('price model', () => {
  it('scales by level band', () => {
    expect(levelMultiplier(10)).toBe(1);
    expect(levelMultiplier(50)).toBe(2.5);
    expect(levelMultiplier(100)).toBe(10);
  });

  it('scales by evolution stage', () => {
    expect(stageMultiplier(0)).toBe(1);
    expect(stageMultiplier(2)).toBe(4);
  });

  it('prices a holo final stage at max level higher than base', () => {
    const low = cardPriceSol('holo', 5, 0);
    const high = cardPriceSol('holo', 100, 2);
    expect(high).toBeGreaterThan(low);
  });

  it('does not apply stage multiplier to ultra and secret', () => {
    expect(cardPriceSol('ultra', 20, 0)).toBe(cardPriceSol('ultra', 20, 2));
  });
});

describe('fees and quotes', () => {
  it('mint fee climbs with tier', () => {
    expect(mintFeeLamports('common')).toBeLessThan(mintFeeLamports('secret'));
  });

  it('instant sell pays half the floor', () => {
    expect(instantSellQuote(1_000_000)).toBe(500_000);
  });

  it('round-trips tier codes', () => {
    expect(tierFromCode(tierToCode('rare'))).toBe('rare');
    expect(tierToCode('secret')).toBe(5);
  });
});
