// DeviceOrientation まわりの薄いラッパー。
// iOS Safari だけが requestPermission を要求するため、存在チェックで分岐する。

type PermissionRequester = {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

export async function requestOrientationPermission(): Promise<boolean> {
  const eventClass = DeviceOrientationEvent as unknown as PermissionRequester;
  if (typeof eventClass.requestPermission !== 'function') {
    return true;
  }
  return (await eventClass.requestPermission()) === 'granted';
}

export function listenTilt(onTilt: (betaDeg: number) => void): () => void {
  const handler = (event: DeviceOrientationEvent) => {
    if (event.beta === null) {
      return;
    }
    onTilt(event.beta);
  };
  window.addEventListener('deviceorientation', handler);
  return () => window.removeEventListener('deviceorientation', handler);
}
