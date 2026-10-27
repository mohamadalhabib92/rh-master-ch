import type { QText } from './types';

/**
 * Traductions provisoires (DE/IT/EN) d’une partie des questions.
 * Les questions non traduites s’affichent en français avec un avis.
 * L’ordre des options doit rester identique à la version française.
 */
type Tr = { de?: QText; it?: QText; en?: QText };

export const QUESTION_TRANSLATIONS: Record<string, Tr> = {
  'contrat-1': {
    de: { q: 'Welche Form muss der Einzelarbeitsvertrag grundsätzlich haben?', o: ['Zwingend schriftlich', 'Keine besondere Form (mündlich oder stillschweigend möglich)', 'Eine notarielle Urkunde', 'Eine Registrierung beim Kanton'], e: 'Das OR sieht grundsätzlich keine Form vor. Gewisse Klauseln (Verlängerung der Probezeit, Konkurrenzverbot, Abweichungen) und gewisse Verträge (Lehrvertrag) erfordern jedoch Schriftlichkeit.' },
    it: { q: 'Quale forma deve avere in principio il contratto individuale di lavoro?', o: ['Forma scritta obbligatoria', 'Nessuna forma particolare (orale o tacito possibile)', 'Un atto notarile', 'Una registrazione presso il cantone'], e: 'Il CO non prevede in principio alcuna forma. Alcune clausole (proroga del periodo di prova, divieto di concorrenza, deroghe) e alcuni contratti (tirocinio) richiedono però la forma scritta.' },
    en: { q: 'What form must an individual employment contract take in principle?', o: ['Mandatory written form', 'No particular form (oral or implied possible)', 'A notarised deed', 'Registration with the canton'], e: 'The Code of Obligations requires no form in principle. Some clauses (longer probation, non-compete, derogations) and some contracts (apprenticeship) must however be in writing.' },
  },
  'contrat-2': {
    de: { q: 'Welche Probezeit gilt standardmässig bei einem unbefristeten Vertrag?', o: ['Keine', 'Der erste Monat', 'Drei Monate', 'Sechs Monate'], e: 'Der erste Monat gilt als Probezeit, sofern nichts anderes vereinbart ist.' },
    it: { q: 'Qual è il periodo di prova predefinito di un contratto a tempo indeterminato?', o: ['Nessuno', 'Il primo mese', 'Tre mesi', 'Sei mesi'], e: 'Il primo mese è considerato periodo di prova, salvo accordo contrario.' },
    en: { q: 'What is the default probation period for an open-ended contract?', o: ['None', 'The first month', 'Three months', 'Six months'], e: 'The first month is deemed the probation period unless otherwise agreed.' },
  },
  'temps-1': {
    de: { q: 'Wöchentliche Höchstarbeitszeit (ArG) für Büropersonal?', o: ['40 Stunden', '45 Stunden', '50 Stunden', '42 Stunden'], e: 'Die Grenze von 45 Stunden gilt für Industrie, Büros, technisches Personal und Verkauf in Grossbetrieben des Detailhandels.' },
    it: { q: 'Durata massima settimanale (LL) per il personale d’ufficio?', o: ['40 ore', '45 ore', '50 ore', '42 ore'], e: 'Il limite di 45 ore vale per l’industria, gli uffici, il personale tecnico e la vendita nelle grandi aziende del commercio al dettaglio.' },
    en: { q: 'Maximum weekly working time (Labour Act) for office staff?', o: ['40 hours', '45 hours', '50 hours', '42 hours'], e: 'The 45-hour limit applies to industry, offices, technical staff and sales staff in large retail businesses.' },
  },
  'temps-2': {
    de: { q: 'Wöchentliche Höchstarbeitszeit (ArG) für die übrigen Arbeitnehmenden, z. B. im Gewerbe?', o: ['45 Stunden', '48 Stunden', '50 Stunden', '55 Stunden'], e: 'Für alle übrigen Arbeitnehmenden beträgt die gesetzliche Grenze 50 Stunden.' },
    it: { q: 'Durata massima settimanale (LL) per gli altri lavoratori, ad es. nell’artigianato?', o: ['45 ore', '48 ore', '50 ore', '55 ore'], e: 'Per tutti gli altri lavoratori il limite legale è di 50 ore.' },
    en: { q: 'Maximum weekly working time (Labour Act) for other employees, e.g. in crafts?', o: ['45 hours', '48 hours', '50 hours', '55 hours'], e: 'For all other employees the statutory limit is 50 hours.' },
  },
  'salaire-1': {
    de: { q: 'Ist der 13. Monatslohn obligatorisch?', o: ['Ja, immer', 'Nein, nur wenn vereinbart (Vertrag, GAV, Übung)', 'Ja, ab einem Dienstjahr', 'Nur in der Romandie'], e: 'Ein vereinbarter 13. Monatslohn ist Lohnbestandteil und bei Austritt im Lauf des Jahres pro rata geschuldet.' },
    it: { q: 'La 13a mensilità è obbligatoria?', o: ['Sì, sempre', 'No, solo se pattuita (contratto, CCL, uso)', 'Sì, dopo un anno di servizio', 'Solo nella Svizzera romanda'], e: 'La 13a pattuita fa parte del salario ed è dovuta pro rata in caso di partenza durante l’anno.' },
    en: { q: 'Is a 13th-month salary mandatory?', o: ['Yes, always', 'No, only if agreed (contract, CLA, custom)', 'Yes, after one year of service', 'Only in French-speaking Switzerland'], e: 'An agreed 13th salary is part of pay and is due pro rata if the employee leaves during the year.' },
  },
  'salaire-2': {
    de: { q: 'Gibt es einen eidgenössischen Mindestlohn?', o: ['Ja, vom Bundesrat festgelegt', 'Nein; einige Kantone und GAV sehen einen vor', 'Ja, nur für Lernende', 'Ja, für alle Teilzeitstellen'], e: 'Mehrere Kantone haben einen kantonalen Mindestlohn eingeführt; allgemeinverbindliche GAV legen oft Branchenmindestlöhne fest.' },
    it: { q: 'Esiste un salario minimo federale?', o: ['Sì, fissato dal Consiglio federale', 'No; alcuni cantoni e CCL lo prevedono', 'Sì, solo per gli apprendisti', 'Sì, per tutti i tempi parziali'], e: 'Diversi cantoni hanno introdotto un salario minimo cantonale; i CCL di obbligatorietà generale ne fissano spesso per settore.' },
    en: { q: 'Is there a federal minimum wage?', o: ['Yes, set by the Federal Council', 'No; some cantons and CLAs provide one', 'Yes, only for apprentices', 'Yes, for all part-time jobs'], e: 'Several cantons have introduced a cantonal minimum wage; generally binding CLAs often set sector minimums.' },
  },
  'vacances-1': {
    de: { q: 'Wie viele Wochen Mindestferien hat eine erwachsene Person?', o: ['3 Wochen', '4 Wochen', '5 Wochen', '6 Wochen'], e: 'Vertrag oder GAV können mehr vorsehen, nie weniger.' },
    it: { q: 'Quante settimane di vacanze minime per un adulto?', o: ['3 settimane', '4 settimane', '5 settimane', '6 settimane'], e: 'Contratto o CCL possono prevederne di più, mai di meno.' },
    en: { q: 'How many weeks of minimum holidays for an adult?', o: ['3 weeks', '4 weeks', '5 weeks', '6 weeks'], e: 'A contract or CLA may provide more, never less.' },
  },
  'vacances-2': {
    de: { q: 'Und für Jugendliche bis zum vollendeten 20. Altersjahr?', o: ['4 Wochen', '5 Wochen', '6 Wochen', '3 Wochen'], e: 'Die Altersgrenze wird mit Blick auf das betreffende Kalenderjahr beurteilt (im Einzelfall zu prüfen).' },
    it: { q: 'E per un giovane fino ai 20 anni compiuti?', o: ['4 settimane', '5 settimane', '6 settimane', '3 settimane'], e: 'Il limite d’età si valuta rispetto all’anno civile interessato (da verificare caso per caso).' },
    en: { q: 'And for a young person up to age 20?', o: ['4 weeks', '5 weeks', '6 weeks', '3 weeks'], e: 'The age limit is assessed with regard to the calendar year concerned (to be checked case by case).' },
  },
  'maladie-1': {
    de: { q: 'Welche Skalen verwenden Gerichte für die Lohnfortzahlung bei Krankheit?', o: ['Berner, Zürcher, Basler', 'Genfer, Waadtländer, Walliser', 'Eine einheitliche eidgenössische Skala', 'Eine europäische Skala'], e: 'Die angewandte Skala hängt von der Region ab; sie legen die Dauer nach Dienstjahren fest.' },
    it: { q: 'Quali scale usano i tribunali per la durata del salario in caso di malattia?', o: ['Bernese, zurighese, basilese', 'Ginevrina, vodese, vallesana', 'Una scala federale unica', 'Una scala europea'], e: 'La scala applicata dipende dalla regione; fissano la durata secondo gli anni di servizio.' },
    en: { q: 'Which scales do courts use for continued pay during illness?', o: ['Bern, Zurich, Basel', 'Geneva, Vaud, Valais', 'A single federal scale', 'A European scale'], e: 'The scale applied depends on the region; they set the duration according to years of service.' },
  },
  'maladie-2': {
    de: { q: 'Kann eine Krankentaggeldversicherung die gesetzliche Lohnfortzahlungspflicht ersetzen?', o: ['Ja, wenn die Leistungen mindestens gleichwertig sind (schriftlich oder GAV)', 'Nie', 'Ja, wenn sie günstiger ist', 'Ja, automatisch'], e: 'Die Prämien werden oft geteilt; die Gleichwertigkeit wird gesamthaft beurteilt.' },
    it: { q: 'Un’assicurazione d’indennità giornaliera può sostituire l’obbligo legale di pagare il salario?', o: ['Sì, se le prestazioni sono almeno equivalenti (accordo scritto o CCL)', 'Mai', 'Sì, se costa meno', 'Sì, automaticamente'], e: 'I premi sono spesso ripartiti; l’equivalenza si valuta globalmente.' },
    en: { q: 'Can daily sickness benefit insurance replace the statutory duty to pay salary?', o: ['Yes, if benefits are at least equivalent (written agreement or CLA)', 'Never', 'Yes, if it is cheaper', 'Yes, automatically'], e: 'Premiums are often shared; equivalence is assessed overall.' },
  },
  'fin-1': {
    de: { q: 'Dispositive Kündigungsfrist im 1. Dienstjahr (nach der Probezeit)?', o: ['1 Monat', '2 Monate', '3 Monate', '2 Wochen'], e: 'Sie kann durch schriftliche Abrede, NAV oder GAV geändert werden (gesetzliche Grenzen beachten).' },
    it: { q: 'Termine di disdetta dispositivo nel 1° anno di servizio (dopo la prova)?', o: ['1 mese', '2 mesi', '3 mesi', '2 settimane'], e: 'Può essere modificato per accordo scritto, CNL o CCL (rispettando i limiti legali).' },
    en: { q: 'Default notice period in the first year of service (after probation)?', o: ['1 month', '2 months', '3 months', '2 weeks'], e: 'It may be changed by written agreement, standard contract or CLA (within statutory limits).' },
  },
  'fin-2': {
    de: { q: 'Vom 2. bis 9. Dienstjahr?', o: ['1 Monat', '2 Monate', '3 Monate', '6 Monate'], e: 'Auf Ende eines Monats, sofern nichts anderes vereinbart ist.' },
    it: { q: 'Dal 2° al 9° anno di servizio?', o: ['1 mese', '2 mesi', '3 mesi', '6 mesi'], e: 'Per la fine di un mese, salvo accordo contrario.' },
    en: { q: 'From the 2nd to the 9th year of service?', o: ['1 month', '2 months', '3 months', '6 months'], e: 'To the end of a month, unless otherwise agreed.' },
  },
  'egalite-1': {
    de: { q: 'Was verbietet das GlG?', o: ['Jede direkte oder indirekte Diskriminierung aufgrund des Geschlechts im Arbeitsverhältnis', 'Nur Lohnunterschiede', 'Nur im öffentlichen Sektor', 'Nichts Verbindliches'], e: 'Erfasst sind Anstellung, Aufgabenzuteilung, Arbeitsbedingungen, Lohn, Weiterbildung, Beförderung und Kündigung.' },
    it: { q: 'Che cosa vieta la LPar?', o: ['Ogni discriminazione basata sul sesso, diretta o indiretta, nei rapporti di lavoro', 'Solo le differenze salariali', 'Solo nel settore pubblico', 'Niente di vincolante'], e: 'Sono interessati assunzione, attribuzione dei compiti, condizioni di lavoro, salario, formazione, promozione e licenziamento.' },
    en: { q: 'What does the Gender Equality Act prohibit?', o: ['Any direct or indirect sex discrimination in employment', 'Only pay gaps', 'Only in the public sector', 'Nothing binding'], e: 'It covers hiring, task allocation, working conditions, pay, training, promotion and dismissal.' },
  },
  'egalite-2': {
    de: { q: 'Welche Arbeitgeber müssen eine Lohngleichheitsanalyse durchführen?', o: ['Jene mit mindestens 100 Arbeitnehmenden', 'Jene mit mindestens 10 Arbeitnehmenden', 'Jene mit mindestens 500 Arbeitnehmenden', 'Alle Arbeitgeber'], e: 'Die Analyse wird von einer unabhängigen Stelle überprüft und das Ergebnis den Mitarbeitenden mitgeteilt (Modalitäten zu prüfen).' },
    it: { q: 'Quali datori devono svolgere un’analisi della parità salariale?', o: ['Quelli con almeno 100 lavoratori', 'Quelli con almeno 10 lavoratori', 'Quelli con almeno 500 lavoratori', 'Tutti i datori'], e: 'L’analisi è verificata da un organo indipendente e i risultati comunicati ai lavoratori (modalità da verificare).' },
    en: { q: 'Which employers must carry out an equal-pay analysis?', o: ['Those with at least 100 employees', 'Those with at least 10 employees', 'Those with at least 500 employees', 'All employers'], e: 'The analysis is reviewed by an independent body and the results communicated to staff (details to be checked).' },
  },
  'recrutement-1': {
    de: { q: 'Wann muss eine offene Stelle dem RAV gemeldet werden?', o: ['Für Berufsarten, deren Arbeitslosenquote den gesetzlichen Schwellenwert (5 %) erreicht', 'Nie', 'Für alle Stellen', 'Nur im öffentlichen Sektor'], e: 'Die Liste der betroffenen Berufe wird jährlich veröffentlicht (arbeit.swiss).' },
    it: { q: 'Quando bisogna annunciare un posto vacante all’URC?', o: ['Per i generi di professioni il cui tasso di disoccupazione raggiunge la soglia legale (5 %)', 'Mai', 'Per tutti i posti', 'Solo nel settore pubblico'], e: 'L’elenco delle professioni interessate è pubblicato ogni anno (lavoro.swiss).' },
    en: { q: 'When must a vacancy be reported to the RAV?', o: ['For occupations whose unemployment rate reaches the statutory threshold (5 %)', 'Never', 'For all jobs', 'Only in the public sector'], e: 'The list of occupations concerned is published every year (work.swiss).' },
  },
  'recrutement-2': {
    de: { q: 'EU/EFTA-Staatsangehörige: welches Regime?', o: ['Personenfreizügigkeit, mit Bewilligung oder Meldung je nach Dauer', 'Strikte Kontingente', 'Arbeitsverbot', 'Keine Formalitäten für einen dauerhaften Aufenthalt'], e: 'Kurzeinsätze unterliegen dem Meldeverfahren.' },
    it: { q: 'Cittadini UE/AELS: quale regime?', o: ['Libera circolazione delle persone, con permesso o notifica secondo la durata', 'Contingenti rigidi', 'Divieto di lavorare', 'Nessuna formalità per un soggiorno durevole'], e: 'Le missioni di breve durata sono soggette alla procedura di notifica.' },
    en: { q: 'EU/EFTA nationals: which regime?', o: ['Free movement of persons, with permit or notification depending on duration', 'Strict quotas', 'Ban on working', 'No formalities for a long stay'], e: 'Short assignments are subject to the notification procedure.' },
  },
  'sante-1': {
    de: { q: 'Wer muss die Massnahmen zur Verhütung von Berufsunfällen treffen?', o: ['Der Arbeitgeber, unter Mitwirkung der Arbeitnehmenden', 'Die Arbeitnehmenden allein', 'Nur die Suva', 'Niemand'], e: 'Die Massnahmen müssen nach der Erfahrung notwendig, technisch anwendbar und angemessen sein.' },
    it: { q: 'Chi deve adottare le misure di prevenzione degli infortuni professionali?', o: ['Il datore di lavoro, con la collaborazione dei lavoratori', 'Il lavoratore da solo', 'Solo la Suva', 'Nessuno'], e: 'Le misure devono essere necessarie secondo l’esperienza, tecnicamente applicabili e adeguate.' },
    en: { q: 'Who must take measures to prevent occupational accidents?', o: ['The employer, with the cooperation of employees', 'The employee alone', 'Only Suva', 'Nobody'], e: 'Measures must be necessary according to experience, technically feasible and appropriate.' },
  },
  'sante-2': {
    de: { q: 'Was regelt die EKAS-Richtlinie (ASA)?', o: ['Den Beizug von Arbeitsärzten und anderen Spezialisten der Arbeitssicherheit', 'Die Mindestlöhne', 'Die Ferien', 'Die Aufenthaltsbewilligungen'], e: 'Je nach Gefährdung kann der Betrieb eine Branchenlösung nutzen.' },
    it: { q: 'Che cosa disciplina la direttiva CFSL (MSSL)?', o: ['Il ricorso a medici del lavoro e altri specialisti della sicurezza sul lavoro', 'I salari minimi', 'Le vacanze', 'I permessi di soggiorno'], e: 'Secondo il livello di rischio, l’azienda può adottare una soluzione settoriale.' },
    en: { q: 'What does the FCOS guideline (ASA) govern?', o: ['Involving occupational physicians and other workplace safety specialists', 'Minimum wages', 'Holidays', 'Residence permits'], e: 'Depending on the risk level, a company may use an industry solution.' },
  },
};
