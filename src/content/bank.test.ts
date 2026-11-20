import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { CALCULATOR_IDS } from '../lib/calc.ts';
import { visibleOfficialSources, OFFICIAL_SOURCES } from '../data/laws.ts';
import { parseBank } from './parse-bank.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('bank inventory matches the versioned contract and keeps every id', () => {
  const bank = parseBank(root);
  const contract = JSON.parse(fs.readFileSync(path.join(root, 'content/content-contract.json'), 'utf8')) as {
    counts: { modules: number; questions: number; glossaryTerms: number; calculators: string[] };
    moduleIds: string[];
    validity: { reviewerStatus: string; automaticValidation: boolean; alignment: string; licence: string };
  };
  const snapshot = JSON.parse(fs.readFileSync(path.join(root, 'content/question-ids.json'), 'utf8')) as {
    questionIds: string[];
    modules: { id: string; title: string; count: number }[];
  };
  assert.deepEqual(bank.modules.map((module) => module.id), contract.moduleIds);
  assert.equal(bank.questionIds.length, contract.counts.questions);
  assert.equal(bank.questionIds.length, 137);
  assert.equal(new Set(bank.questionIds).size, 137);
  assert.equal(bank.glossaryCount, contract.counts.glossaryTerms);
  assert.equal(bank.glossaryCount, 108);
  assert.deepEqual(bank.questionIds, snapshot.questionIds);
  assert.deepEqual(
    bank.modules.map((module) => ({ id: module.id, count: module.questionIds.length })),
    snapshot.modules.map((module) => ({ id: module.id, count: module.count })),
  );
  assert.equal(contract.validity.automaticValidation, false);
  assert.equal(contract.validity.reviewerStatus, 'a_valider');
  assert.equal(contract.validity.alignment, 'non_evalue');
  assert.equal(contract.validity.licence, 'non_etablie');
  assert.deepEqual([...CALCULATOR_IDS], contract.counts.calculators);
  const calcSource = fs.readFileSync(path.join(root, 'src/app/(tabs)/calc.tsx'), 'utf8');
  for (const id of CALCULATOR_IDS) assert.match(calcSource, new RegExp(`k: '${id}'`));
});

test('no question is marked validated and none is mapped to an exam competency', () => {
  const sources = ['m1-3.ts', 'm4-6.ts', 'm7-9.ts', 'qtrans.ts', 'modules.ts']
    .map((name) => fs.readFileSync(path.join(root, 'src/data', name), 'utf8'))
    .join('\n');
  assert.equal(sources.includes("status: 'valide'"), false);
  assert.equal(/\bart\.\s*\d+/i.test(sources), false);
  assert.equal(/\barticles?\s+\d+/i.test(sources), false);
  const exam = JSON.parse(fs.readFileSync(path.join(root, 'content/exam-reference.json'), 'utf8')) as {
    mappedQuestionCount: number;
    alignment: string;
    tracks: { id: string; ambiguities: string[]; federal?: boolean }[];
  };
  assert.equal(exam.mappedQuestionCount, 0);
  assert.equal(exam.alignment, 'non_evalue');
  assert.equal(exam.tracks.length, 2);
  assert.equal(exam.tracks[0].id, 'hrse-certificat-gestionnaire-rh');
  assert.equal(exam.tracks[1].id, 'brevet-federal-specialiste-rh');
  assert.equal(exam.tracks[1].federal, true);
  assert.ok(exam.tracks.every((track) => track.ambiguities.length > 0));
  assert.match(JSON.stringify(exam), /"weights":"non_affirme"/);
});

test('translations keep the same option count and placeholder sources stay hidden', () => {
  const bank = parseBank(root);
  const qtrans = fs.readFileSync(path.join(root, 'src/data/qtrans.ts'), 'utf8');
  const blocks = qtrans.split(/\n  '([a-z]+-\d+)': \{/).slice(1);
  assert.equal(blocks.length / 2, bank.translatedIds.length);
  assert.equal(bank.translatedIds.length, 18);
  for (let i = 0; i < blocks.length; i += 2) {
    const id = blocks[i];
    assert.ok(bank.questionIds.includes(id));
    const body = blocks[i + 1];
    for (const lang of ['de', 'it', 'en']) {
      const slice = body.slice(body.indexOf(`${lang}:`));
      const options = slice.match(/o:\s*\[([\s\S]*?)\]/);
      assert.ok(options, `${id} ${lang}`);
      const count = [...options[1].matchAll(/'((?:\\'|[^'])*)'/g)].length;
      assert.equal(count, 4, `${id} ${lang}`);
    }
  }
  const visible = visibleOfficialSources(OFFICIAL_SOURCES);
  assert.ok(OFFICIAL_SOURCES.some((source) => source.url.startsWith('YOUR_')));
  assert.equal(visible.some((source) => source.url.startsWith('YOUR_')), false);
  assert.ok(visible.length >= 8);
});

test('visible copy does not claim accreditation or name a server key', () => {
  const strings = fs.readFileSync(path.join(root, 'src/i18n/strings.ts'), 'utf8');
  assert.equal(strings.includes('YOUR_OPENAI_API_KEY'), false);
  assert.match(strings, /brevet fédéral/);
  assert.match(strings, /certificat HRSE/i);
  assert.equal(/taux de réussite|accrédité/i.test(strings), false);
  assert.equal(/\bgaranti\b/i.test(strings), false);
  const quiz = fs.readFileSync(path.join(root, 'src/app/quiz/[id].tsx'), 'utf8');
  const moduleScreen = fs.readFileSync(path.join(root, 'src/app/module/[id].tsx'), 'utf8');
  assert.match(quiz, /questionPending/);
  assert.match(moduleScreen, /startQuiz/);
});
