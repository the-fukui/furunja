// 縦型鍵盤のレイアウトを組み立てる純粋ロジックと、それをDOMへ反映する処理。
// 白鍵だけで等間隔の行を作り、黒鍵はその境界に本物のピアノと同じ寄り方でオーバーレイする。

import { semitoneToNoteName } from './pitch';

const NOTE_TO_PITCH_CLASS: Record<string, number> = {
  C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11,
};

// 黒鍵がどちらの白鍵に寄るか。+1: 高い方(上側)、-1: 低い方(下側)、0: 中央。
// 実物のピアノ配置（C#はC側、D#はE側、F#はF側、G#は中央、A#はB側）に合わせている。
const BLACK_KEY_LEAN: Record<number, number> = { 1: -1, 3: 1, 6: -1, 8: 0, 10: 1 };

const BLACK_KEY_HEIGHT_RATIO = 0.55; // 白鍵の高さに対する黒鍵の高さの比率
const BLACK_KEY_SHIFT_RATIO = 0.3; // 白鍵の高さに対する黒鍵の中心ずらし量の比率

function pitchClass(semitone: number): number {
  const noteName = semitoneToNoteName(semitone).replace(/-?\d+$/, '');
  return NOTE_TO_PITCH_CLASS[noteName];
}

export interface KeyRect {
  semitone: number;
  top: number; // コンテナ高さに対する比率(0-1)
  height: number; // 同上
}

export interface KeyboardLayout {
  whiteKeys: KeyRect[];
  blackKeys: KeyRect[];
}

export function buildKeyboardLayout(range: number): KeyboardLayout {
  const semitones: number[] = [];
  for (let semitone = range; semitone >= -range; semitone--) {
    semitones.push(semitone);
  }

  const whiteSemitones = semitones.filter((s) => BLACK_KEY_LEAN[pitchClass(s)] === undefined);
  const whiteRowHeight = 1 / whiteSemitones.length;
  const whiteRowIndex = new Map(whiteSemitones.map((s, i) => [s, i]));

  const whiteKeys: KeyRect[] = whiteSemitones.map((semitone, i) => ({
    semitone,
    top: i * whiteRowHeight,
    height: whiteRowHeight,
  }));

  const blackKeys: KeyRect[] = semitones
    .filter((s) => BLACK_KEY_LEAN[pitchClass(s)] !== undefined)
    .map((semitone): KeyRect | null => {
      const upperRow = whiteRowIndex.get(semitone + 1);
      const lowerRow = whiteRowIndex.get(semitone - 1);
      if (upperRow === undefined || lowerRow === undefined) {
        return null; // 音域の端で隣接する白鍵が無い場合は描画しない
      }
      const boundary = (upperRow + 1) * whiteRowHeight;
      const lean = BLACK_KEY_LEAN[pitchClass(semitone)];
      const height = whiteRowHeight * BLACK_KEY_HEIGHT_RATIO;
      const center = boundary - lean * whiteRowHeight * BLACK_KEY_SHIFT_RATIO;
      return { semitone, top: center - height / 2, height };
    })
    .filter((key): key is KeyRect => key !== null);

  return { whiteKeys, blackKeys };
}

export function renderKeyboard(container: HTMLElement, layout: KeyboardLayout): void {
  container.innerHTML = '';
  for (const key of layout.whiteKeys) {
    const keyElement = document.createElement('div');
    keyElement.className = 'key key--white';
    keyElement.style.top = `${key.top * 100}%`;
    keyElement.style.height = `${key.height * 100}%`;
    container.appendChild(keyElement);
  }
  for (const key of layout.blackKeys) {
    const keyElement = document.createElement('div');
    keyElement.className = 'key key--black';
    keyElement.style.top = `${key.top * 100}%`;
    keyElement.style.height = `${key.height * 100}%`;
    container.appendChild(keyElement);
  }
}

export function semitoneCenter(layout: KeyboardLayout, semitone: number): number {
  const key = layout.whiteKeys.find((k) => k.semitone === semitone)
    ?? layout.blackKeys.find((k) => k.semitone === semitone);
  return key ? key.top + key.height / 2 : 0;
}
