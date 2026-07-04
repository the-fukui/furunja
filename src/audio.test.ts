import { describe, it, expect, beforeEach } from 'vitest';
import {
  Voice,
  MASTER_GAIN,
  PORTAMENTO_TIME_CONSTANT,
  GAIN_RAMP_TIME_CONSTANT,
} from './audio';

class FakeAudioParam {
  value = 0;
  calls: Array<{ target: number; startTime: number; timeConstant: number }> = [];

  setTargetAtTime(target: number, startTime: number, timeConstant: number): void {
    this.calls.push({ target, startTime, timeConstant });
  }

  lastCall() {
    return this.calls[this.calls.length - 1];
  }
}

class FakeNode {
  connectedTo: unknown[] = [];

  connect(node: unknown): unknown {
    this.connectedTo.push(node);
    return node;
  }
}

class FakeOscillator extends FakeNode {
  type = 'sine';
  frequency = new FakeAudioParam();
  started = false;

  start(): void {
    this.started = true;
  }
}

class FakeBiquadFilter extends FakeNode {
  type = 'lowpass';
  frequency = new FakeAudioParam();
  Q = new FakeAudioParam();
}

class FakeGain extends FakeNode {
  gain = new FakeAudioParam();
}

class FakeAudioContext {
  currentTime = 1.5;
  destination = new FakeNode();
  oscillator = new FakeOscillator();
  filter = new FakeBiquadFilter();
  gainNode = new FakeGain();

  createOscillator() {
    return this.oscillator;
  }

  createBiquadFilter() {
    return this.filter;
  }

  createGain() {
    return this.gainNode;
  }
}

describe('Voice', () => {
  let fakeCtx: FakeAudioContext;
  let voice: Voice;

  beforeEach(() => {
    fakeCtx = new FakeAudioContext();
    voice = new Voice(fakeCtx as unknown as AudioContext);
  });

  it('オシレーター→フィルタ→ゲイン→出力のグラフを組む', () => {
    expect(fakeCtx.oscillator.connectedTo).toContain(fakeCtx.filter);
    expect(fakeCtx.filter.connectedTo).toContain(fakeCtx.gainNode);
    expect(fakeCtx.gainNode.connectedTo).toContain(fakeCtx.destination);
  });

  it('音色はsawtooth + lowpassフィルタ', () => {
    expect(fakeCtx.oscillator.type).toBe('sawtooth');
    expect(fakeCtx.filter.type).toBe('lowpass');
  });

  it('生成直後はゲイン0(無音)でオシレーターは起動済み', () => {
    expect(fakeCtx.gainNode.gain.value).toBe(0);
    expect(fakeCtx.oscillator.started).toBe(true);
    expect(voice.isPlaying).toBe(false);
  });

  it('start()でゲインをMASTER_GAINへ滑らかに上げる', () => {
    voice.start();
    expect(fakeCtx.gainNode.gain.lastCall()).toEqual({
      target: MASTER_GAIN,
      startTime: fakeCtx.currentTime,
      timeConstant: GAIN_RAMP_TIME_CONSTANT,
    });
    expect(voice.isPlaying).toBe(true);
  });

  it('stop()でゲインを0へ滑らかに落とす', () => {
    voice.start();
    voice.stop();
    expect(fakeCtx.gainNode.gain.lastCall()).toEqual({
      target: 0,
      startTime: fakeCtx.currentTime,
      timeConstant: GAIN_RAMP_TIME_CONSTANT,
    });
    expect(voice.isPlaying).toBe(false);
  });

  it('setFrequency()はポルタメント付きで周波数を変更する', () => {
    voice.setFrequency(660);
    expect(fakeCtx.oscillator.frequency.lastCall()).toEqual({
      target: 660,
      startTime: fakeCtx.currentTime,
      timeConstant: PORTAMENTO_TIME_CONSTANT,
    });
  });
});
