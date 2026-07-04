// 傾き（DeviceOrientation の beta、単位: 度）から音程への純粋な変換ロジック。
// 水平(0度)を中央 A4 とし、±45度を ±12半音（合計2オクターブ）へ線形マッピングする。

export const MAX_TILT_DEG = 45;
export const SEMITONE_RANGE = 12;
export const CENTER_FREQ_HZ = 440; // A4

// MIDIノート番号でのA4。音名変換に使う。
const MIDI_A4 = 69;
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SEMITONES_PER_OCTAVE = 12;

export function clampTilt(betaDeg: number): number {
  return Math.min(MAX_TILT_DEG, Math.max(-MAX_TILT_DEG, betaDeg));
}

export function tiltToSemitone(betaDeg: number): number {
  return Math.round((clampTilt(betaDeg) / MAX_TILT_DEG) * SEMITONE_RANGE);
}

export function semitoneToFrequency(semitone: number): number {
  return CENTER_FREQ_HZ * Math.pow(2, semitone / SEMITONES_PER_OCTAVE);
}

export function semitoneToNoteName(semitone: number): string {
  const midi = MIDI_A4 + semitone;
  const name = NOTE_NAMES[((midi % SEMITONES_PER_OCTAVE) + SEMITONES_PER_OCTAVE) % SEMITONES_PER_OCTAVE];
  const octave = Math.floor(midi / SEMITONES_PER_OCTAVE) - 1;
  return `${name}${octave}`;
}
