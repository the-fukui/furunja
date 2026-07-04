import { describe, it, expect } from 'vitest';
import {
  clampTilt,
  tiltToSemitone,
  semitoneToFrequency,
  semitoneToNoteName,
} from './pitch';

describe('clampTilt', () => {
  it('範囲内の値はそのまま返す', () => {
    expect(clampTilt(30)).toBe(30);
    expect(clampTilt(-30)).toBe(-30);
  });

  it('+45度を超える値は+45にクランプする', () => {
    expect(clampTilt(80)).toBe(45);
  });

  it('-45度未満の値は-45にクランプする', () => {
    expect(clampTilt(-90)).toBe(-45);
  });
});

describe('tiltToSemitone', () => {
  it('水平(0度)は中央の0半音', () => {
    expect(tiltToSemitone(0)).toBe(0);
  });

  it('+45度は+12半音(1オクターブ上)', () => {
    expect(tiltToSemitone(45)).toBe(12);
  });

  it('-45度は-12半音(1オクターブ下)', () => {
    expect(tiltToSemitone(-45)).toBe(-12);
  });

  it('中間の傾きは最も近い半音にスナップする', () => {
    // 5度 → 5/45*12 = 1.33半音 → 1半音
    expect(tiltToSemitone(5)).toBe(1);
  });

  it('可動域の外はクランプされる', () => {
    expect(tiltToSemitone(90)).toBe(12);
    expect(tiltToSemitone(-180)).toBe(-12);
  });
});

describe('semitoneToFrequency', () => {
  it('0半音は440Hz(A4)', () => {
    expect(semitoneToFrequency(0)).toBeCloseTo(440);
  });

  it('+12半音は880Hz(A5)', () => {
    expect(semitoneToFrequency(12)).toBeCloseTo(880);
  });

  it('-12半音は220Hz(A3)', () => {
    expect(semitoneToFrequency(-12)).toBeCloseTo(220);
  });

  it('+1半音は約466.16Hz(A#4)', () => {
    expect(semitoneToFrequency(1)).toBeCloseTo(466.16, 1);
  });
});

describe('semitoneToNoteName', () => {
  it('0半音はA4', () => {
    expect(semitoneToNoteName(0)).toBe('A4');
  });

  it('+12半音はA5', () => {
    expect(semitoneToNoteName(12)).toBe('A5');
  });

  it('-12半音はA3', () => {
    expect(semitoneToNoteName(-12)).toBe('A3');
  });

  it('+3半音はC5(オクターブ境界を正しく跨ぐ)', () => {
    expect(semitoneToNoteName(3)).toBe('C5');
  });

  it('-10半音はB3', () => {
    expect(semitoneToNoteName(-10)).toBe('B3');
  });
});
