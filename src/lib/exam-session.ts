/**
 * Aide à l'examen blanc. Les marques restent dans l'écran :
 * `rhmaster:v1` ne gagne aucun champ.
 * Une source n'est affichée que si le contenu la nomme déjà.
 * Aucun numéro d'article n'est inventé.
 */

export type ItemMark = {
  ok: boolean | null;
  flagged: boolean;
};

export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

export function knownSourceLabel(name: string | null | undefined): { known: boolean; text: string } {
  const value = (name ?? '').trim();
  if (!value || value.startsWith('YOUR_')) return { known: false, text: '' };
  return { known: true, text: value };
}

export function lawSourceLabel(
  law: string | undefined,
  dictionary: Record<string, { fr: string } | undefined>,
  source?: string,
): { known: boolean; text: string } {
  const code = (law ?? '').trim();
  const named = code ? dictionary[code]?.fr : undefined;
  if (named) return { known: true, text: `${code} — ${named}` };
  const fromSource = knownSourceLabel(source);
  if (fromSource.known) return fromSource;
  if (code && !code.startsWith('YOUR_')) return { known: true, text: code };
  return { known: false, text: '' };
}

/** Les questions marquées passent devant, l'ordre du sujet est gardé dans chaque groupe. */
export function reviewOrder<T extends { id: string }>(items: readonly T[], marks: Record<string, ItemMark | undefined>): T[] {
  return items
    .map((item, index) => ({ item, index, flagged: Boolean(marks[item.id]?.flagged) }))
    .sort((a, b) => Number(b.flagged) - Number(a.flagged) || a.index - b.index)
    .map((row) => row.item);
}
