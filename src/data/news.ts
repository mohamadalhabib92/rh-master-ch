/**
 * Actualités RH. Tableau vide tant que Mohamed ne fournit pas
 * titre, date, source et URL réels. Aucune actualité inventée, aucun fetch.
 */
export type NewsItem = {
  id: string;
  title: string;
  date: string;
  source: string;
  url: string;
};

export const NEWS: NewsItem[] = [];
