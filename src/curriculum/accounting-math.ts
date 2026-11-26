/**
 * Calculs d'écriture pour la comptabilité suisse.
 * Les taux 2026 repris ici sont ceux déjà vérifiés dans les fiches (AVS/AI/APG, AC)
 * ou les taux de TVA en vigueur depuis le 1.1.2024 (8,1 / 2,6 / 3,8).
 * LAA, LAAC, IJM, LPP salarié, impôt à la source et TDFN ne sont pas calculés :
 * pas de taux fédéral unique dans l'app.
 */

/** Pour-mille : 81 = 8,1 %. On refuse un résultat qui ne tombe pas juste au centime. */
export function applyPerMille(cents: number, perMille: number): number {
  if (!Number.isInteger(cents) || !Number.isInteger(perMille)) throw new Error('centimes entiers');
  const raw = (cents * perMille) / 1000;
  if (!Number.isInteger(raw)) throw new Error('résultat non entier au centime');
  return raw;
}

export const TVA_PER_MILLE = { normale: 81, reduite: 26, speciale: 38 } as const;
export const AVS_AI_APG_PER_MILLE = 53;
export const AC_PER_MILLE = 11;

export function formatChfCents(cents: number): string {
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const francs = Math.floor(abs / 100);
  const rest = abs % 100;
  const grouped = francs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `${negative ? '-' : ''}${grouped}.${String(rest).padStart(2, '0')}`;
}

export function vatOnNet(netCents: number, perMille: number): { tax: number; gross: number } {
  const tax = applyPerMille(netCents, perMille);
  return { tax, gross: netCents + tax };
}

/** Retenues dont le taux 2026 est déjà dans les fiches. Le net exclut LPP, LAA, IJM et l'impôt à la source. */
export function sourcedPayroll(grossCents: number): {
  avs: number;
  ac: number;
  employee: number;
  employer: number;
  net: number;
} {
  const avs = applyPerMille(grossCents, AVS_AI_APG_PER_MILLE);
  const ac = applyPerMille(grossCents, AC_PER_MILLE);
  const employee = avs + ac;
  return { avs, ac, employee, employer: employee, net: grossCents - employee };
}

export function linearDepreciation(costCents: number, years: number): number {
  if (!Number.isInteger(costCents) || !Number.isInteger(years) || years <= 0) throw new Error('durée');
  if (costCents % years !== 0) throw new Error('amortissement non entier');
  return costCents / years;
}

export function monthlyShare(annualCents: number, months = 12): number {
  if (annualCents % months !== 0) throw new Error('part mensuelle non entière');
  return annualCents / months;
}

export type EntryLine = { account: string; cents: number };

export type JournalEntry = { debit: EntryLine[]; credit: EntryLine[] };

export function entryTotals(entry: JournalEntry): { debit: number; credit: number; balanced: boolean } {
  const debit = entry.debit.reduce((sum, line) => sum + line.cents, 0);
  const credit = entry.credit.reduce((sum, line) => sum + line.cents, 0);
  return { debit, credit, balanced: debit === credit && debit > 0 };
}

export function saleEntry(netCents: number, perMille: number): JournalEntry {
  const { tax, gross } = vatOnNet(netCents, perMille);
  return {
    debit: [{ account: '1100 Débiteurs', cents: gross }],
    credit: [
      { account: '3000 Ventes', cents: netCents },
      { account: '2200 TVA due', cents: tax },
    ],
  };
}

export function purchaseEntry(netCents: number, perMille: number): JournalEntry {
  const { tax, gross } = vatOnNet(netCents, perMille);
  return {
    debit: [
      { account: '4000 Achats', cents: netCents },
      { account: '1170 Impôt préalable', cents: tax },
    ],
    credit: [{ account: '2000 Créanciers', cents: gross }],
  };
}

export function paymentEntry(account: '1100 Débiteurs' | '2000 Créanciers', cents: number): JournalEntry {
  if (account === '2000 Créanciers') {
    return { debit: [{ account, cents }], credit: [{ account: '1020 Banque', cents }] };
  }
  return { debit: [{ account: '1020 Banque', cents }], credit: [{ account, cents }] };
}

/** Salaires : seulement AVS/AI/APG et AC, parts égales. Les autres retenues restent hors écriture. */
export function payrollEntries(grossCents: number): { employee: JournalEntry; employer: JournalEntry } {
  const pay = sourcedPayroll(grossCents);
  return {
    employee: {
      debit: [{ account: '5000 Salaires', cents: grossCents }],
      credit: [
        { account: '1020 Banque', cents: pay.net },
        { account: '2270 Dettes AVS/AC', cents: pay.employee },
      ],
    },
    employer: {
      debit: [{ account: '5700 Charges sociales', cents: pay.employer }],
      credit: [{ account: '2270 Dettes AVS/AC', cents: pay.employer }],
    },
  };
}

export function depreciationEntry(annualCents: number): JournalEntry {
  return {
    debit: [{ account: '6800 Amortissements', cents: annualCents }],
    credit: [{ account: '1500 Machines (en diminution)', cents: annualCents }],
  };
}

export function provisionEntry(charge: string, cents: number): JournalEntry {
  return {
    debit: [{ account: charge, cents }],
    credit: [{ account: '2300 Passifs transitoires', cents }],
  };
}
