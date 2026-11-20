/**
 * Geste des Réglages. La langue n'est réécrite qu'après une suppression tenue.
 * Si la lecture n'est pas finie, reset() n'appelle pas le rappel : rien n'est effacé.
 */
export function confirmProgressReset<T extends { lang: string }>(store: {
  get(): T;
  reset(afterRemoved?: () => void): void;
  set(patch: { lang: T['lang'] }): void;
}) {
  const keep = store.get().lang;
  store.reset(() => {
    store.set({ lang: keep });
  });
}
