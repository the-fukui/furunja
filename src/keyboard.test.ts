import { describe, it, expect } from 'vitest';
import { buildKeyboardLayout, semitoneCenter } from './keyboard';

describe('buildKeyboardLayout', () => {
  it('白鍵は等間隔の行として上(高音)から並ぶ', () => {
    const { whiteKeys } = buildKeyboardLayout(2);
    // range=2 → 2,1,0,-1,-2 のうち白鍵は B4(2), A4(0), G4(-2)
    expect(whiteKeys.map((k) => k.semitone)).toEqual([2, 0, -2]);
    expect(whiteKeys[0].top).toBeCloseTo(0);
    expect(whiteKeys[1].top).toBeCloseTo(1 / 3);
    expect(whiteKeys[2].top).toBeCloseTo(2 / 3);
    for (const key of whiteKeys) {
      expect(key.height).toBeCloseTo(1 / 3);
    }
  });

  it('黒鍵は隣接する白鍵の境界に中心を揃える', () => {
    const { blackKeys } = buildKeyboardLayout(2);
    // A#4: B4/A4の境界(1/3)が中心
    const aSharp = blackKeys.find((k) => k.semitone === 1);
    expect(aSharp?.top).toBeCloseTo(1 / 3 - ((1 / 3) * 0.55) / 2);
    expect(aSharp?.height).toBeCloseTo((1 / 3) * 0.55);

    // G#4: A4/G4の境界(2/3)が中心
    const gSharp = blackKeys.find((k) => k.semitone === -1);
    expect(gSharp?.top).toBeCloseTo(2 / 3 - ((1 / 3) * 0.55) / 2);
  });

  it('鍵の総数(白+黒)は range*2+1 になる', () => {
    const { whiteKeys, blackKeys } = buildKeyboardLayout(12);
    expect(whiteKeys.length + blackKeys.length).toBe(25);
    expect(whiteKeys).toHaveLength(15);
    expect(blackKeys).toHaveLength(10);
  });
});

describe('semitoneCenter', () => {
  it('白鍵の中心位置を返す', () => {
    const layout = buildKeyboardLayout(2);
    expect(semitoneCenter(layout, 0)).toBeCloseTo(0.5);
  });

  it('黒鍵の中心位置を返す', () => {
    const layout = buildKeyboardLayout(2);
    expect(semitoneCenter(layout, 1)).toBeCloseTo(1 / 3);
  });

  it('存在しない半音は0を返す', () => {
    const layout = buildKeyboardLayout(2);
    expect(semitoneCenter(layout, 99)).toBe(0);
  });
});
