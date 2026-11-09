import { memo, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { daysLeftLine, getDayInfo, type DayInfo } from '@/lib/days';
import { attribution, quoteForDate } from '@/lib/quotes';
import { useArete } from '@/lib/store';
import { useTheme, type Theme } from '@/lib/theme';

export default function TodayScreen() {
  const t = useTheme();
  const { now, userQuotes } = useArete();
  const info = getDayInfo(now);
  const quote = useMemo(() => quoteForDate(now, userQuotes), [now, userQuotes]);
  const dateLabel = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.eyebrow, { color: t.muted }]}>{dateLabel}</Text>
        <Text style={[styles.day, { color: t.text }]}>Day {info.day}</Text>
        <Text style={[styles.sub, { color: t.muted }]}>
          of {info.year} · {daysLeftLine(info)}
        </Text>

        <View style={styles.progressRow}>
          <View style={[styles.track, { backgroundColor: t.track }]}>
            <View style={[styles.fill, { backgroundColor: t.accent, width: `${info.progress * 100}%` }]} />
          </View>
          <Text style={[styles.pct, { color: t.muted }]}>{Math.round(info.progress * 100)}%</Text>
        </View>

        <YearDots info={info} t={t} />

        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
          <Text style={[styles.quote, { color: t.text }]}>“{quote.text}”</Text>
          <Text style={[styles.author, { color: t.muted }]}>— {attribution(quote)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** One dot per day of the year: lived, today, still ahead. */
const YearDots = memo(function YearDots({ info, t }: { info: DayInfo; t: Theme }) {
  return (
    <View style={styles.dots} accessibilityLabel={`${info.day} of ${info.total} days lived this year`}>
      {Array.from({ length: info.total }, (_, i) => {
        const d = i + 1;
        const bg = d === info.day ? t.accent : d < info.day ? t.dotPast : t.dotFuture;
        return <View key={d} style={[styles.dot, { backgroundColor: bg }]} />;
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  content: { padding: 24, paddingBottom: 48, gap: 16 },
  eyebrow: { fontSize: 15, fontWeight: '500', marginTop: 8 },
  day: { fontSize: 64, fontWeight: '800', letterSpacing: -2, lineHeight: 70 },
  sub: { fontSize: 17, marginTop: -8 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  track: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  pct: { fontSize: 14, fontVariant: ['tabular-nums'], width: 40, textAlign: 'right' },
  dots: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: 20, gap: 12, marginTop: 8 },
  quote: { fontSize: 22, lineHeight: 30, fontWeight: '600' },
  author: { fontSize: 15 },
});
