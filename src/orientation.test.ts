import { describe, it, expect, vi, afterEach } from 'vitest';
import { requestOrientationPermission, listenTilt } from './orientation';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('requestOrientationPermission', () => {
  it('requestPermissionが無い環境(Android/PC)ではtrueを返す', async () => {
    vi.stubGlobal('DeviceOrientationEvent', class {});
    await expect(requestOrientationPermission()).resolves.toBe(true);
  });

  it('grantedならtrueを返す', async () => {
    class WithPermission {
      static requestPermission = vi.fn().mockResolvedValue('granted');
    }
    vi.stubGlobal('DeviceOrientationEvent', WithPermission);
    await expect(requestOrientationPermission()).resolves.toBe(true);
  });

  it('deniedならfalseを返す', async () => {
    class WithPermission {
      static requestPermission = vi.fn().mockResolvedValue('denied');
    }
    vi.stubGlobal('DeviceOrientationEvent', WithPermission);
    await expect(requestOrientationPermission()).resolves.toBe(false);
  });
});

describe('listenTilt', () => {
  function stubWindow() {
    const listeners: Record<string, (event: unknown) => void> = {};
    const removed: string[] = [];
    vi.stubGlobal('window', {
      addEventListener: (type: string, fn: (event: unknown) => void) => {
        listeners[type] = fn;
      },
      removeEventListener: (type: string) => {
        removed.push(type);
      },
    });
    return { listeners, removed };
  }

  it('deviceorientationイベントのbetaをコールバックへ渡す', () => {
    const { listeners } = stubWindow();
    const received: number[] = [];

    listenTilt((betaDeg) => received.push(betaDeg));
    listeners['deviceorientation']({ beta: 30 });
    listeners['deviceorientation']({ beta: -12.5 });

    expect(received).toEqual([30, -12.5]);
  });

  it('betaがnullのイベントは無視する', () => {
    const { listeners } = stubWindow();
    const received: number[] = [];

    listenTilt((betaDeg) => received.push(betaDeg));
    listeners['deviceorientation']({ beta: null });

    expect(received).toEqual([]);
  });

  it('返された関数でリスナーを解除できる', () => {
    const { removed } = stubWindow();

    const unlisten = listenTilt(() => {});
    unlisten();

    expect(removed).toEqual(['deviceorientation']);
  });
});
