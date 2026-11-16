import type { Figure } from './types';

export type FigureReview = {
  unverified: Figure[];
  expired: Figure[];
};

/**
 * Mécanisme de mise à jour annuelle.
 * Un chiffre vérifié dont l'année de validité est dépassée revient dans `expired`.
 * Tout chiffre `a_verifier` reste visible, quelle que soit l'année.
 * Éditer la fiche (valeur, validYear, consultedAt, status) dans figures-data.ts.
 */
export function figureReview(figures: Figure[], asOf: Date): FigureReview {
  const year = asOf.getUTCFullYear();
  return {
    unverified: figures.filter((figure) => figure.status === 'a_verifier'),
    expired: figures.filter((figure) => figure.status === 'verified' && figure.validYear < year),
  };
}

export function figureById(figures: Figure[], id: string): Figure | undefined {
  return figures.find((figure) => figure.id === id);
}

export function formatFigure(figure: Figure): string {
  if (figure.value === null || figure.status === 'a_verifier') return `${figure.label} — à vérifier`;
  const value = Number.isInteger(figure.value) ? String(figure.value) : String(figure.value);
  return `${value} ${figure.unit}`.trim();
}
