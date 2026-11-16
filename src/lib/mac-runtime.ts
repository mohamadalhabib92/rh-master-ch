import { EventEmitter, requireOptionalNativeModule } from 'expo-modules-core';

type MacNative = {
  isiOSAppOnMac?: () => boolean;
};

let cached: boolean | null = null;

function nativeModule(): MacNative | null {
  try {
    return requireOptionalNativeModule<MacNative>('MacInput');
  } catch {
    return null;
  }
}

/** Sync. False on iPhone, web, tests, and tvOS. True only for the iOS app on a Mac. */
export function isMacApp(): boolean {
  if (cached !== null) return cached;
  const native = nativeModule();
  cached = native?.isiOSAppOnMac?.() === true;
  return cached;
}

export function subscribeMacKeys(listener: (key: string) => void): () => void {
  const native = nativeModule();
  if (!native || !isMacApp()) return () => undefined;
  const emitter = new EventEmitter<{ onKey: (key: string) => void }>(native as never);
  const sub = emitter.addListener('onKey', (key) => listener(typeof key === 'string' ? key : ''));
  return () => sub.remove();
}

const findListeners = new Set<() => void>();

export function requestGlossaryFind() {
  findListeners.forEach((listener) => listener());
}

export function onGlossaryFind(listener: () => void): () => void {
  findListeners.add(listener);
  return () => findListeners.delete(listener);
}
