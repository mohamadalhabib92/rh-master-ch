import { sentryDsn } from './flags';

/**
 * Journal de crash. Aucun envoi si EXPO_PUBLIC_SENTRY_DSN est absent ou vaut YOUR_SENTRY_DSN.
 * N'est jamais appelé au démarrage. N'envoie ni progression, ni saisies, ni secrets.
 */
export function reportCrash(error: unknown): void {
  const dsn = sentryDsn();
  if (!dsn) return;
  try {
    const parsed = parseDsn(dsn);
    if (!parsed) return;
    const eventId = randomId();
    const message = (error instanceof Error ? error.message : 'Erreur').slice(0, 300);
    const stack = (error instanceof Error ? error.stack : undefined)?.slice(0, 2000);
    const sentAt = new Date().toISOString();
    const header = JSON.stringify({ event_id: eventId, dsn, sent_at: sentAt });
    const item = JSON.stringify({ type: 'event' });
    const payload = JSON.stringify({
      event_id: eventId,
      timestamp: Date.now() / 1000,
      platform: 'javascript',
      level: 'error',
      message,
      exception: { values: [{ type: error instanceof Error ? error.name : 'Error', value: message, stacktrace: stack ? { frames: [] } : undefined }] },
      extra: stack ? { stack } : undefined,
    });
    const body = `${header}\n${item}\n${payload}`;
    void fetch(parsed.envelopeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${parsed.key}, sentry_client=rh-master-ch/1.0`,
      },
      body,
    }).catch(() => undefined);
  } catch {
    // Le journal ne doit jamais faire planter l'app.
  }
}

function parseDsn(dsn: string): { envelopeUrl: string; key: string } | null {
  try {
    const url = new URL(dsn);
    const projectId = url.pathname.replace(/\//g, '');
    if (!url.username || !projectId) return null;
    return { envelopeUrl: `${url.protocol}//${url.host}/api/${projectId}/envelope/`, key: url.username };
  } catch {
    return null;
  }
}

function randomId(): string {
  const bytes = new Uint8Array(16);
  const cryptoObj = globalThis.crypto;
  if (cryptoObj?.getRandomValues) cryptoObj.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
