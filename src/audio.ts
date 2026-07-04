// Web Audio による発音エンジン。
// sawtooth + lowpass で「にゃー」寄りの音色を1種だけ持つ。
// 鳴りっぱなし方式のため、start/stop はオシレーターではなくゲインで制御する
// （オシレーターの stop は不可逆で、都度再生成するとクリックノイズが出やすいため）。

export const MASTER_GAIN = 0.4;
export const PORTAMENTO_TIME_CONSTANT = 0.06; // 半音間を滑らかに繋ぐポルタメント
export const GAIN_RAMP_TIME_CONSTANT = 0.02; // 発音・停止時のクリックノイズ防止

const FILTER_FREQUENCY_HZ = 1100;
const FILTER_Q = 5;
const INITIAL_FREQUENCY_HZ = 440;

export class Voice {
  private readonly ctx: AudioContext;
  private readonly oscillator: OscillatorNode;
  private readonly gain: GainNode;
  private playing = false;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;

    this.oscillator = ctx.createOscillator();
    this.oscillator.type = 'sawtooth';
    this.oscillator.frequency.value = INITIAL_FREQUENCY_HZ;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = FILTER_FREQUENCY_HZ;
    filter.Q.value = FILTER_Q;

    this.gain = ctx.createGain();
    this.gain.gain.value = 0;

    this.oscillator.connect(filter);
    filter.connect(this.gain);
    this.gain.connect(ctx.destination);
    this.oscillator.start();
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  start(): void {
    this.gain.gain.setTargetAtTime(MASTER_GAIN, this.ctx.currentTime, GAIN_RAMP_TIME_CONSTANT);
    this.playing = true;
  }

  stop(): void {
    this.gain.gain.setTargetAtTime(0, this.ctx.currentTime, GAIN_RAMP_TIME_CONSTANT);
    this.playing = false;
  }

  setFrequency(frequencyHz: number): void {
    this.oscillator.frequency.setTargetAtTime(
      frequencyHz,
      this.ctx.currentTime,
      PORTAMENTO_TIME_CONSTANT,
    );
  }
}
