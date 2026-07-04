import './style.css';
import { tiltToSemitone, semitoneToFrequency, semitoneToNoteName } from './pitch';
import { Voice } from './audio';
import { requestOrientationPermission, listenTilt } from './orientation';

function mustQuery<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`必須のUI要素が見つかりません: ${selector}`);
  }
  return element;
}

const toggleButton = mustQuery<HTMLButtonElement>('#toggle');
const noteDisplay = mustQuery<HTMLParagraphElement>('#note');
const statusDisplay = mustQuery<HTMLParagraphElement>('#status');

let voice: Voice | null = null;
let currentSemitone: number | null = null;

function handleTilt(betaDeg: number): void {
  if (!voice?.isPlaying) {
    return;
  }
  const semitone = tiltToSemitone(betaDeg);
  if (semitone === currentSemitone) {
    return;
  }
  currentSemitone = semitone;
  voice.setFrequency(semitoneToFrequency(semitone));
  noteDisplay.textContent = semitoneToNoteName(semitone);
}

async function startPlaying(): Promise<void> {
  // iOSではセンサー許可もAudioContext生成もユーザー操作起点が必須のため、
  // どちらもこのクリックハンドラ内で行う。
  // requestPermission や resume はジェスチャ消費済み等の理由で reject しうるため、
  // まとめて捕捉してユーザーに再試行を案内する。
  try {
    const granted = await requestOrientationPermission();
    if (!granted) {
      statusDisplay.textContent = 'センサーの利用が許可されませんでした。ページを再読み込みしてやり直せます。';
      return;
    }

    if (!voice) {
      const ctx = new AudioContext();
      await ctx.resume();
      voice = new Voice(ctx);
      listenTilt(handleTilt);
    }

    voice.start();
    toggleButton.textContent = 'とめる';
    statusDisplay.textContent = '本体を前後にかたむけて音程をかえよう';
  } catch {
    statusDisplay.textContent = '開始できませんでした。もう一度タップするか、ページを再読み込みしてください。';
  }
}

function stopPlaying(): void {
  voice?.stop();
  toggleButton.textContent = 'ならす';
  statusDisplay.textContent = '';
}

toggleButton.addEventListener('click', () => {
  if (voice?.isPlaying) {
    stopPlaying();
  } else {
    void startPlaying();
  }
});
