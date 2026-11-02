/**
 * Drapeaux de fonction. Défaut : tout ce qui est optionnel ou payant est éteint.
 * Aucune variable d'exemple publique n'est lue (retirée en Phase 0).
 * Les clés serveur (OPENAI_API_KEY) ne sont jamais lues ici.
 */

function envFlag(value: string | undefined, fallback: boolean): boolean {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

export const FEATURE_AI = envFlag(process.env.EXPO_PUBLIC_FEATURE_AI, false);
export const FEATURE_NEWS = envFlag(process.env.EXPO_PUBLIC_FEATURE_NEWS, false);
export const FEATURE_ACCOUNT = envFlag(process.env.EXPO_PUBLIC_FEATURE_ACCOUNT, false);

/** Vrai uniquement si un DSN Sentry réel est fourni (pas un placeholder YOUR_*). */
export function sentryDsn(): string | null {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn || dsn.includes('YOUR_') || !dsn.startsWith('https://')) return null;
  return dsn;
}
