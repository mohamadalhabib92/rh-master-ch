import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildProgressExport, planRestore, sha256Hex, verifyProgressExport } from './progress-export.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('sha256 matches known vectors', () => {
  assert.equal(sha256Hex(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.equal(sha256Hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('a healthy legacy export round-trips and a tampered fingerprint is refused', () => {
  const payload = fs.readFileSync(path.join(root, 'fixtures/learning/legacy-without-version.json'), 'utf8');
  const envelope = buildProgressExport(payload);
  assert.ok(envelope);
  assert.equal(envelope.counts.correctIds, 3);
  assert.equal(envelope.counts.mistakeIds, 1);
  assert.equal(envelope.counts.modules, 2);
  assert.equal(envelope.counts.ficheRead, 1);
  assert.deepEqual(verifyProgressExport(envelope), { ok: true, value: envelope });
  const planned = planRestore(JSON.parse(JSON.stringify(envelope)));
  assert.equal(planned.ok, true);
  if (!planned.ok) return;
  assert.equal(planned.payload, payload);
  assert.equal(planned.sha256, envelope.sha256);
  const tampered = { ...envelope, sha256: '0'.repeat(64) };
  assert.equal(verifyProgressExport(tampered).ok, false);
  const badCounts = { ...envelope, counts: { ...envelope.counts, correctIds: 0 } };
  assert.deepEqual(verifyProgressExport(badCounts), { ok: false, reason: 'counts' });
});
