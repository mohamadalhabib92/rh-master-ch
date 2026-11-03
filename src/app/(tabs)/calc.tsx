import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { DisclaimerBanner } from '../../components/Disclaimer';
import { Field } from '../../components/Field';
import { Badge, Body, Card, Chip, H1, H2, H3, Muted, Row, Screen } from '../../components/ui';
import { chf, formatChDate, fmtDate, net, noticeEnd, overtime, parseDate, parseNum, protectionDays, RATE_PARAMS, rateById, seniorityYears, vacation, type RateParam } from '../../lib/calc';
import { useI18n } from '../../lib/i18n';
import { colors, hit, radius } from '../../theme';

type Tab = 'net' | 'vac' | 'ot' | 'notice' | 'prot';

function Result({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <View style={styles.result}>
      {children}
      <Row gap={6}>
        <Ionicons name="warning-outline" size={14} color="#8A5A00" />
        <Text style={styles.warn}>{t('calcDisclaimer')}</Text>
      </Row>
    </View>
  );
}

const num = (s: string, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  const n = parseNum(s);
  return n === null || n < min || n > max ? null : n;
};

/** null = champ vide (non sourcé, exclu du calcul). undefined = saisie invalide. */
const optionalRate = (s: string, max: number): number | null | undefined => {
  if (!s.trim()) return null;
  const n = num(s, 0, max);
  return n === null ? undefined : n;
};

const RATE_LABEL = {
  avs_ai_apg_employee: 'rateAvsEmployee',
  avs_ai_apg_employer: 'rateAvsEmployer',
  ac_employee: 'rateAcEmployee',
  ac_employer: 'rateAcEmployer',
  ac_ceiling: 'rateAcCeiling',
  lpp_entry: 'rateLppEntry',
  lpp_coordination: 'rateLppCoordination',
  lpp_max_salary: 'rateLppMax',
  aanp: 'rateAanpParam',
  lpp_employee: 'rateLppEmployee',
  laa: 'rateLaa',
  ijm: 'rateIjm',
  family_allowance: 'rateFamily',
  lpp_age: 'rateLppAge',
} as const;

function formatParam(p: RateParam, missing: string): string {
  if (p.value === null) return missing;
  return p.unit === 'percent' ? `${p.value} %` : chf(p.value);
}

function RateParams() {
  const { t } = useI18n();
  return (
    <Card>
      <H2>{t('rateParamsTitle')}</H2>
      <Muted>{t('rateParamsIntro')}</Muted>
      {RATE_PARAMS.map((p) => {
        const labelKey = RATE_LABEL[p.id as keyof typeof RATE_LABEL];
        const label = labelKey ? t(labelKey) : p.id;
        const sourced = p.status === 'a_confirmer' && p.value !== null;
        return (
          <View key={p.id} style={styles.param}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Body style={{ flex: 1 }}>{label}</Body>
              <Badge label={sourced ? t('statusToConfirm') : t('statusToValidate')} tone="warn" />
            </Row>
            <H3>{formatParam(p, t('rateMissing'))}</H3>
            <Muted>
              {t('rateSource')} : {p.source}
              {p.consultedAt ? ` — ${t('rateConsulted', { d: formatChDate(p.consultedAt) })}` : ` — ${t('rateNoDate')}`}
            </Muted>
            {p.kind === 'employer' ? <Muted>{t('rateEmployerNote')}</Muted> : null}
            {p.kind === 'threshold' ? <Muted>{t('rateThresholdNote')}</Muted> : null}
            {p.sourceUrl.startsWith('http') ? (
              <Pressable accessibilityRole="link" onPress={() => Linking.openURL(p.sourceUrl).catch(() => undefined)}>
                <Text style={styles.link}>{p.sourceUrl}</Text>
              </Pressable>
            ) : null}
          </View>
        );
      })}
    </Card>
  );
}

function NetCalc() {
  const { t } = useI18n();
  const [g, setG] = useState('6500');
  const [avs, setAvs] = useState(String(rateById('avs_ai_apg_employee').value ?? ''));
  const [ac, setAc] = useState(String(rateById('ac_employee').value ?? ''));
  const [aanp, setAanp] = useState('');
  const [lpp, setLpp] = useState('');
  const [ceil, setCeil] = useState(String(rateById('ac_ceiling').value ?? ''));
  const aanpV = optionalRate(aanp, 10);
  const lppV = optionalRate(lpp, 30);
  const v = { g: num(g), avs: num(avs, 0, 30), ac: num(ac, 0, 10), ceil: num(ceil) };
  const ok = v.g !== null && v.avs !== null && v.ac !== null && v.ceil !== null && aanpV !== undefined && lppV !== undefined;
  const r = ok ? net(v.g!, { avs: v.avs!, ac: v.ac!, aanp: aanpV, lpp: lppV, acCeiling: v.ceil! }) : null;
  const e = (x: number | null) => (x === null ? t('invalidNumber') : null);
  const sourced = (id: string) => {
    const p = rateById(id);
    const date = p.consultedAt ? t('rateConsulted', { d: formatChDate(p.consultedAt) }) : t('rateNoDate');
    return `${t('statusToConfirm')} — ${p.source}, ${date}`;
  };
  return (
    <Card>
      <H2>{t('netCalc')}</H2>
      <View style={styles.grid}>
        <Field label={t('grossMonthly')} value={g} onChange={setG} error={e(v.g)} />
        <Field label={t('rateAvs')} value={avs} onChange={setAvs} error={e(v.avs)} hint={sourced('avs_ai_apg_employee')} />
        <Field label={t('rateAc')} value={ac} onChange={setAc} error={e(v.ac)} hint={sourced('ac_employee')} />
        <Field label={t('acCeiling')} value={ceil} onChange={setCeil} error={e(v.ceil)} hint={sourced('ac_ceiling')} />
        <Field label={t('rateAanp')} value={aanp} onChange={setAanp} error={aanpV === undefined ? t('invalidNumber') : null} hint={t('rateManual')} />
        <Field label={t('rateLpp')} value={lpp} onChange={setLpp} error={lppV === undefined ? t('invalidNumber') : null} hint={t('rateManual')} />
      </View>
      {r ? (
        <Result>
          <Muted>{t('estimatedNet')}</Muted>
          <H1>{chf(r.net)}</H1>
          <H3>{t('deductions')} : {chf(r.total)}</H3>
          {r.items.map((it) => (
            <Row key={it.key} style={{ justifyContent: 'space-between' }}>
              <Body>{it.key}</Body>
              <Body>{chf(it.amount)}</Body>
            </Row>
          ))}
          {r.omitted.map((name) => (
            <Muted key={name}>{t('rateOmitted', { name })}</Muted>
          ))}
          <Muted>{t('netNote')}</Muted>
        </Result>
      ) : null}
    </Card>
  );
}

function VacCalc() {
  const { t } = useI18n();
  const [w, setW] = useState('4');
  const [mo, setMo] = useState('12');
  const [rate, setRate] = useState('100');
  const v = { w: num(w, 4, 10), mo: num(mo, 0, 12), rate: num(rate, 1, 100) };
  const r = v.w !== null && v.mo !== null && v.rate !== null ? vacation(v.w, v.mo, v.rate) : null;
  return (
    <Card>
      <H2>{t('vacCalc')}</H2>
      <View style={styles.grid}>
        <Field label={t('weeksPerYear')} value={w} onChange={setW} error={v.w === null ? t('invalidNumber') + ' (4–10)' : null} />
        <Field label={t('monthsWorked')} value={mo} onChange={setMo} error={v.mo === null ? t('invalidNumber') + ' (0–12)' : null} />
        <Field label={t('activityRate')} value={rate} onChange={setRate} error={v.rate === null ? t('invalidNumber') + ' (1–100)' : null} />
      </View>
      {r ? (
        <Result>
          <H2>{t('vacResult', { d: r.days, w: r.weeks })}</H2>
          <Body>{t('vacPct', { p: r.hourlyPct })}</Body>
          <Muted>{t('formula')} : {w} × 5 × {mo}/12 ; {w}/(52 − {w})</Muted>
        </Result>
      ) : null}
    </Card>
  );
}

function OtCalc() {
  const { t } = useI18n();
  const [g, setG] = useState('6500');
  const [wh, setWh] = useState('42');
  const [h, setH] = useState('10');
  const [p, setP] = useState('25');
  const v = { g: num(g), wh: num(wh, 1, 60), h: num(h, 0, 500), p: num(p, 0, 100) };
  const r = Object.values(v).every((x) => x !== null) ? overtime(v.g!, v.wh!, v.h!, v.p!) : null;
  return (
    <Card>
      <H2>{t('otCalc')}</H2>
      <View style={styles.grid}>
        <Field label={t('grossMonthly')} value={g} onChange={setG} error={v.g === null ? t('invalidNumber') : null} />
        <Field label={t('weeklyHours')} value={wh} onChange={setWh} error={v.wh === null ? t('invalidNumber') : null} />
        <Field label={t('otHours')} value={h} onChange={setH} error={v.h === null ? t('invalidNumber') : null} />
        <Field label={t('otRate')} value={p} onChange={setP} error={v.p === null ? t('invalidNumber') : null} hint={t('indicativeValue')} />
      </View>
      {r ? (
        <Result>
          <Muted>{t('hourlyRate')} : {chf(r.hourly)}</Muted>
          <H1>{chf(r.amount)}</H1>
          <Muted>{t('formula')} : {g} × 12 / (52 × {wh}) × {h} × (1 + {p} %)</Muted>
          <Muted>{t('otNote')}</Muted>
        </Result>
      ) : null}
    </Card>
  );
}

function NoticeCalc() {
  const { t } = useI18n();
  const [start, setStart] = useState('2022-03-01');
  const [rec, setRec] = useState(new Date().toISOString().slice(0, 10));
  const [prob, setProb] = useState(false);
  const [cm, setCm] = useState('');
  const s = parseDate(start);
  const n = parseDate(rec);
  const cmv = cm.trim() === '' ? null : num(cm, 1, 12);
  const cmErr = cm.trim() !== '' && cmv === null;
  const r = s && n && n >= s && !cmErr ? noticeEnd(s, n, prob, cmv) : null;
  return (
    <Card>
      <H2>{t('noticeCalc')}</H2>
      <View style={styles.grid}>
        <Field label={t('startDate')} value={start} onChange={setStart} keyboard="numbers-and-punctuation" error={s ? null : t('invalidDate')} />
        <Field label={t('noticeDate')} value={rec} onChange={setRec} keyboard="numbers-and-punctuation" error={n && (!s || n >= s) ? null : t('invalidDate')} />
        <Field label={t('contractMonths')} value={cm} onChange={setCm} error={cmErr ? t('invalidNumber') + ' (1–12)' : null} />
      </View>
      <Row>
        <Chip label={t('probation')} active={prob} onPress={() => setProb(!prob)} />
      </Row>
      {r ? (
        <Result>
          <Muted>{t('endDate')}</Muted>
          <H1>{fmtDate(r.end)}</H1>
          <Body>{t('seniority', { y: r.years })}</Body>
          <Muted>{t('noticeNote')}</Muted>
        </Result>
      ) : null}
    </Card>
  );
}

function ProtCalc() {
  const { t } = useI18n();
  const [start, setStart] = useState('2022-03-01');
  const [at, setAt] = useState(new Date().toISOString().slice(0, 10));
  const s = parseDate(start);
  const a = parseDate(at);
  const years = s && a && a >= s ? seniorityYears(s, a) : null;
  return (
    <Card>
      <H2>{t('protCalc')}</H2>
      <View style={styles.grid}>
        <Field label={t('startDate')} value={start} onChange={setStart} keyboard="numbers-and-punctuation" error={s ? null : t('invalidDate')} />
        <Field label={t('noticeDate')} value={at} onChange={setAt} keyboard="numbers-and-punctuation" error={a && (!s || a >= s) ? null : t('invalidDate')} />
      </View>
      {years !== null ? (
        <Result>
          <H1>{t('protResult', { d: protectionDays(years) })}</H1>
          <Body>{t('seniority', { y: years })}</Body>
          <Muted>{t('protNote')}</Muted>
        </Result>
      ) : null}
    </Card>
  );
}

export default function Calc() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('net');
  const tabs: { k: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { k: 'net', label: t('netCalc'), icon: 'cash-outline' },
    { k: 'vac', label: t('vacCalc'), icon: 'sunny-outline' },
    { k: 'ot', label: t('otCalc'), icon: 'time-outline' },
    { k: 'notice', label: t('noticeCalc'), icon: 'calendar-outline' },
    { k: 'prot', label: t('protCalc'), icon: 'shield-outline' },
  ];
  return (
    <Screen>
      <H1>{t('calcTitle')}</H1>
      <DisclaimerBanner />
      <RateParams />
      <View style={styles.tabs}>
        {tabs.map((x) => (
          <Pressable key={x.k} accessibilityRole="tab" accessibilityState={{ selected: tab === x.k }} onPress={() => setTab(x.k)} style={[styles.tab, tab === x.k && styles.tabOn]}>
            <Ionicons name={x.icon} size={16} color={tab === x.k ? '#fff' : colors.primaryText} />
            <Text style={[styles.tabText, tab === x.k && { color: '#fff' }]} numberOfLines={1}>
              {x.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {tab === 'net' ? <NetCalc /> : tab === 'vac' ? <VacCalc /> : tab === 'ot' ? <OtCalc /> : tab === 'notice' ? <NoticeCalc /> : <ProtCalc />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  result: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 14, gap: 6, marginTop: 4 },
  warn: { flex: 1, fontSize: 12, color: '#8A5A00', fontWeight: '600' },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, minHeight: hit, borderRadius: 999, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface, maxWidth: '100%' },
  tabOn: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.primaryText, flexShrink: 1 },
  param: { gap: 2, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  link: { fontSize: 13, color: colors.accent, textDecorationLine: 'underline' },
});
