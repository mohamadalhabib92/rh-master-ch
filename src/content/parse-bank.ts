import fs from 'node:fs';
import path from 'node:path';

export type BankModule = {
  id: string;
  title: string;
  questionIds: string[];
};

export type BankInventory = {
  modules: BankModule[];
  questionIds: string[];
  glossaryCount: number;
  translatedIds: string[];
};

const ROW =
  /\['((?:\\'|[^'])*)',\s*\[((?:'(?:\\'|[^'])*'\s*,?\s*)+)\],\s*(\d+),\s*'((?:\\'|[^'])*)',\s*'([A-Za-z0-9]+)']/g;

/**
 * Inventaire déterministe des fichiers de contenu, sans les exécuter
 * (les imports Expo ne se résolvent pas dans Node).
 */
export function parseBank(root: string): BankInventory {
  const dataDir = path.join(root, 'src/data');
  const sources = ['m1-3.ts', 'm4-6.ts', 'm7-9.ts'].map((name) => fs.readFileSync(path.join(dataDir, name), 'utf8')).join('\n');
  const modules: BankModule[] = [];
  const blocks = sources.split(/export const M\d: Module = \{/).slice(1);
  for (const block of blocks) {
    const id = (block.match(/id: '([^']+)'/) ?? [])[1];
    const title = (block.match(/title: \{ fr: '([^']+)'/) ?? [])[1];
    const questions = block.slice(block.indexOf('questions:'), block.indexOf(']),'));
    const prefix = (questions.match(/qs\('([^']+)'/) ?? [])[1];
    const questionIds: string[] = [];
    const re = new RegExp(ROW.source, 'g');
    let row: RegExpExecArray | null;
    while ((row = re.exec(questions))) {
      const options = [...row[2].matchAll(/'((?:\\'|[^'])*)'/g)].map((match) => match[1]);
      const answer = Number(row[3]);
      if (!prefix || options.length !== 4 || answer < 0 || answer >= options.length) {
        throw new Error(`Question illisible dans ${id ?? '?'}`);
      }
      questionIds.push(`${prefix}-${questionIds.length + 1}`);
    }
    if (!id || !title || questionIds.length === 0) throw new Error(`Module illisible: ${id ?? '?'}`);
    modules.push({ id, title, questionIds });
  }
  const glossary = fs.readFileSync(path.join(dataDir, 'glossary.ts'), 'utf8');
  const glossaryCount = [...glossary.matchAll(/^\s+\['/gm)].length;
  const translations = fs.readFileSync(path.join(dataDir, 'qtrans.ts'), 'utf8');
  const translatedIds = [...translations.matchAll(/'([a-z]+-\d+)':/g)].map((match) => match[1]);
  const questionIds = modules.flatMap((module) => module.questionIds);
  return { modules, questionIds, glossaryCount, translatedIds };
}
