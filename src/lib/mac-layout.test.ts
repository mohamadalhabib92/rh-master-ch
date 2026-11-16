import assert from 'node:assert/strict';
import { test } from 'node:test';
import { allowsCamera, allowsHaptics, allowsNotifications, layoutForWidth } from './mac-layout.ts';

test('phone width stays a single centered column', () => {
  assert.deepEqual(layoutForWidth(390), { maxWidth: 720, columns: 1, sidebar: false });
  assert.deepEqual(layoutForWidth(430), { maxWidth: 720, columns: 1, sidebar: false });
});

test('wide windows use two columns and a sidebar without stretching past 1040', () => {
  const wide = layoutForWidth(1280);
  assert.equal(wide.columns, 2);
  assert.equal(wide.sidebar, true);
  assert.ok(wide.maxWidth >= 900 && wide.maxWidth <= 1100);
  assert.equal(layoutForWidth(960).sidebar, false);
  assert.equal(layoutForWidth(960).columns, 2);
});

test('haptics, camera and notifications stay off on Mac and Apple TV', () => {
  assert.equal(allowsHaptics({ tv: false, mac: false }), true);
  assert.equal(allowsHaptics({ tv: false, mac: true }), false);
  assert.equal(allowsHaptics({ tv: true, mac: false }), false);
  assert.equal(allowsCamera({ tv: false, mac: true }), false);
  assert.equal(allowsNotifications({ tv: true, mac: false }), false);
});
