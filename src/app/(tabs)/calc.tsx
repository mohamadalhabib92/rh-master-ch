import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DisclaimerBanner } from '../../components/Disclaimer';
import { Field } from '../../components/Field';
import { Body, Card, Chip, H1, H2, H3, Muted, Row, Screen } from '../../components/ui';
import { chf, DEFAULT_RATES, fmtDate, net, noticeEnd, overtime, parseDate, parseNum, protectionDays, seniorityYears, vacation } from '../../lib/calc';
import { useI18n } from '../../lib/i18n';
import { colors, radius } from '../../theme';

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

function NetCalc() {
  const { t } = useI18n();
  const [g, setG] = useState('6500');
  const [avs, setAvs] = useState(String(DEFAULT_RATES.avs));
  const [ac, setAc] = useState(String(DEFAULT_RATES.ac));
  const [aanp, setAanp] = useState(String(DEFAULT_RATES.aanp));
  const [lpp, setLpp] = useState(String(DEFAULT_RATES.lpp));
  const [ceil, setCeil] = useState(String(DEFAULT_RATES.acCeiling));
  const v = { g: num(g), avs: num(avs, 0, 30), ac: num(ac, 0, 10), aanp: num(aanp, 0, 10), lpp: num(lpp, 0, 30), ceil: num(ceil) };
  const ok = Object.values(v).every((x) => x !== null);
  const r = ok ? net(v.g!, { avs: v.avs!, ac: v.ac!, aanp: v.aanp!, lpp: v.lpp!, acCeiling: v.ceil! }) : null;
  const e = (x: number | null) => (x === null ? t('invalidNumber') : null);
  const ind = t('indicativeValue');
  return (
    <Card>
      <H2>{t('netCalc')}</H2>
      <View style={styles.grid}>
        <Field label={t('grossMonthly')} value={g} onChange={setG} error={e(v.g)} />
        <Field label={t('rateAvs')} value={avs} onChange={setAvs} error={e(v.avs)} hint={ind} />
        <Field label={t('rateAc')} value={ac} onChange={setAc} error={e(v.ac)} hint={ind} />
        <Field label={t('acCeiling')} value={ceil} onChange={setCeil} error={e(v.ceil)} hint={ind} />
        <Field label={t('rateAanp')} value={aanp} onChange={setAanp} error={e(v.aanp)} hint={ind} />
        <Field label={t('rateLpp')} value={lpp} onChange={setLpp} error={e(v.lpp)} hint={ind} />
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
      <View style={styles.tabs}>
        {tabs.map((x) => (
          <Pressable key={x.k} accessibilityRole="tab" accessibilityState={{ selected: tab === x.k }} onPress={() => setTab(x.k)} style={[styles.tab, tab === x.k && styles.tabOn]}>
            <Ionicons name={x.icon} size={16} color={tab === x.k ? '#fff' : colors.primary} />
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
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, minHeight: 38, borderRadius: 999, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface, maxWidth: '100%' },
  tabOn: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.primary, flexShrink: 1 },
});
