import { getTypeMultiplier, effectivenessLabel } from '../src/typechart';

describe('type chart', () => {
  it('applies super-effective matchups at 2x', () => {
    expect(getTypeMultiplier('fire', 'grass')).toBe(2);
    expect(getTypeMultiplier('water', 'fire')).toBe(2);
    expect(getTypeMultiplier('electric', 'water')).toBe(2);
  });

  it('applies resisted matchups at 0.5x', () => {
    expect(getTypeMultiplier('fire', 'water')).toBe(0.5);
    expect(getTypeMultiplier('grass', 'fire')).toBe(0.5);
  });

  it('applies immunities at 0x', () => {
    expect(getTypeMultiplier('normal', 'ghost')).toBe(0);
    expect(getTypeMultiplier('ground', 'flying')).toBe(0);
    expect(getTypeMultiplier('psychic', 'dark')).toBe(0);
  });

  it('defaults to neutral 1x', () => {
    expect(getTypeMultiplier('normal', 'water')).toBe(1);
  });

  it('labels effectiveness', () => {
    expect(effectivenessLabel(2)).toBe('SUPER EFFECTIVE');
    expect(effectivenessLabel(0.5)).toBe('not very effective');
    expect(effectivenessLabel(0)).toBe('NO EFFECT');
    expect(effectivenessLabel(1)).toBeNull();
  });
});
