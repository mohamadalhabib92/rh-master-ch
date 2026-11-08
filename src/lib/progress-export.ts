/**
 * Copie explicite d'un état sain, vérifiée par empreinte et comptes.
 * Aucune écriture ici : la restauration reste un plan isolé.
 */

export const EXPORT_FORMAT = 'rhmaster-export-v1' as const;
export const SIDE_KEY_SUFFIX = ':before-rewrite';

export type ProgressCounts = {
  modules: number;
  correctIds: number;
  mistakeIds: number;
  ficheRead: number;
};

export type ProgressExportV1 = {
  format: typeof EXPORT_FORMAT;
  storageKey: 'rhmaster:v1';
  source: 'disk-before-rewrite';
  sha256: string;
  counts: ProgressCounts;
  payload: string;
};

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(x: number, n: number) {
  return (x >>> n) | (x << (32 - n));
}

/** SHA-256 hex, indépendant de node:crypto pour rester identique dans l'app. */
export function sha256Hex(message: string): string {
  const data = new TextEncoder().encode(message);
  const bitLen = data.length * 8;
  const padded = new Uint8Array((((data.length + 9 + 63) >> 6) << 6));
  padded.set(data);
  padded[data.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000));
  view.setUint32(padded.length - 4, bitLen >>> 0);
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  const w = new Uint32Array(64);
  for (let i = 0; i < padded.length; i += 64) {
    for (let t = 0; t < 16; t++) w[t] = view.getUint32(i + t * 4);
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
      const s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let t = 0; t < 64; t++) {
      const s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + s1 + ch + K[t] + w[t]) >>> 0;
      const s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (s0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }
  return [h0, h1, h2, h3, h4, h5, h6, h7].map((x) => x.toString(16).padStart(8, '0')).join('');
}

export function countProgressPayload(payload: string): ProgressCounts | null {
  try {
    const value = JSON.parse(payload) as unknown;
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const record = value as Record<string, unknown>;
    const progress = record.progress;
    let modules = 0;
    let correctIds = 0;
    if (progress && typeof progress === 'object' && !Array.isArray(progress)) {
      for (const item of Object.values(progress as Record<string, unknown>)) {
        modules += 1;
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          const correct = (item as { correct?: unknown }).correct;
          if (Array.isArray(correct)) correctIds += correct.length;
        }
      }
    }
    const mistakes = Array.isArray(record.mistakes) ? record.mistakes.length : 0;
    const fiche = record.ficheRead;
    const ficheRead = fiche && typeof fiche === 'object' && !Array.isArray(fiche) ? Object.keys(fiche).length : 0;
    return { modules, correctIds, mistakeIds: mistakes, ficheRead };
  } catch {
    return null;
  }
}

export function buildProgressExport(payload: string): ProgressExportV1 | null {
  const counts = countProgressPayload(payload);
  if (!counts) return null;
  return {
    format: EXPORT_FORMAT,
    storageKey: 'rhmaster:v1',
    source: 'disk-before-rewrite',
    sha256: sha256Hex(payload),
    counts,
    payload,
  };
}

export function verifyProgressExport(input: unknown): { ok: true; value: ProgressExportV1 } | { ok: false; reason: 'format' | 'fingerprint' | 'counts' | 'payload' } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, reason: 'format' };
  const raw = input as Partial<ProgressExportV1>;
  if (raw.format !== EXPORT_FORMAT || raw.storageKey !== 'rhmaster:v1' || typeof raw.payload !== 'string' || typeof raw.sha256 !== 'string') {
    return { ok: false, reason: 'format' };
  }
  if (sha256Hex(raw.payload) !== raw.sha256) return { ok: false, reason: 'fingerprint' };
  const counts = countProgressPayload(raw.payload);
  if (!counts) return { ok: false, reason: 'payload' };
  const declared = raw.counts;
  if (
    !declared ||
    declared.modules !== counts.modules ||
    declared.correctIds !== counts.correctIds ||
    declared.mistakeIds !== counts.mistakeIds ||
    declared.ficheRead !== counts.ficheRead
  ) {
    return { ok: false, reason: 'counts' };
  }
  return {
    ok: true,
    value: {
      format: EXPORT_FORMAT,
      storageKey: 'rhmaster:v1',
      source: 'disk-before-rewrite',
      sha256: raw.sha256,
      counts,
      payload: raw.payload,
    },
  };
}

/** Plan isolé : aucune écriture. Le payload n'est applicable qu'après cette vérification. */
export function planRestore(input: unknown): { ok: true; payload: string; sha256: string; counts: ProgressCounts } | { ok: false; reason: 'format' | 'fingerprint' | 'counts' | 'payload' } {
  const checked = verifyProgressExport(input);
  if (!checked.ok) return checked;
  return { ok: true, payload: checked.value.payload, sha256: checked.value.sha256, counts: checked.value.counts };
}
