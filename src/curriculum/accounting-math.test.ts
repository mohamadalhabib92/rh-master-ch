import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  applyPerMille,
  depreciationEntry,
  entryTotals,
  formatChfCents,
  linearDepreciation,
  monthlyShare,
  paymentEntry,
  payrollEntries,
  provisionEntry,
  purchaseEntry,
  saleEntry,
  sourcedPayroll,
  vatOnNet,
} from './accounting-math.ts';

test('TVA 8,1 / 2,6 / 3,8 tombe juste au centime sur 1 000 francs', () => {
  assert.deepEqual(vatOnNet(100_000, 81), { tax: 8_100, gross: 108_100 });
  assert.deepEqual(vatOnNet(100_000, 26), { tax: 2_600, gross: 102_600 });
  assert.deepEqual(vatOnNet(100_000, 38), { tax: 3_800, gross: 103_800 });
  assert.equal(formatChfCents(8_100), "81.00");
  assert.throws(() => applyPerMille(100, 81));
});

test('salaire 6 500 : AVS 5,3 % et AC 1,1 %, parts égales, net sans les autres retenues', () => {
  const pay = sourcedPayroll(650_000);
  assert.equal(pay.avs, 34_450);
  assert.equal(pay.ac, 7_150);
  assert.equal(pay.employee, 41_600);
  assert.equal(pay.employer, 41_600);
  assert.equal(pay.net, 608_400);
  assert.equal(formatChfCents(pay.net), "6'084.00");
  const entries = payrollEntries(650_000);
  assert.equal(entryTotals(entries.employee).balanced, true);
  assert.equal(entryTotals(entries.employer).balanced, true);
  assert.equal(entryTotals(entries.employee).debit, 650_000);
});

test('écritures de vente, d’achat, de paiement, d’amortissement et de provision sont équilibrées', () => {
  const sale = saleEntry(100_000, 81);
  const purchase = purchaseEntry(20_000, 81);
  assert.equal(entryTotals(sale).balanced, true);
  assert.equal(purchase.credit[0].cents, 21_620);
  assert.equal(entryTotals(purchase).balanced, true);
  assert.equal(entryTotals(paymentEntry('2000 Créanciers', 21_620)).balanced, true);
  assert.equal(entryTotals(paymentEntry('1100 Débiteurs', 108_100)).balanced, true);
  const annual = linearDepreciation(1_000_000, 5);
  assert.equal(annual, 200_000);
  assert.equal(entryTotals(depreciationEntry(annual)).balanced, true);
  assert.equal(monthlyShare(600_000), 50_000);
  assert.equal(entryTotals(provisionEntry('5000 Salaires', 50_000)).balanced, true);
  assert.equal(entryTotals(provisionEntry('5800 Charges de personnel', 100_000)).balanced, true);
});
