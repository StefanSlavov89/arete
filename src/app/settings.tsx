import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendTestNotification, type TestResult } from '@/lib/notifications';
import { useArete } from '@/lib/store';
import { useTheme } from '@/lib/theme';

const formatTime = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export default function SettingsScreen() {
  const t = useTheme();
  const { settings, updateSettings, userQuotes } = useArete();
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);
  const [testState, setTestState] = useState<'idle' | TestResult>('idle');

  const time = new Date();
  time.setHours(settings.hour, settings.minute, 0, 0);

  const onPickTime = (d: Date) => {
    setShowAndroidPicker(false);
    updateSettings({ hour: d.getHours(), minute: d.getMinutes() });
  };

  const onTest = async () => setTestState(await sendTestNotification(userQuotes));

  const row = [styles.row, { backgroundColor: t.card, borderColor: t.border }];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.h1, { color: t.text }]}>Settings</Text>

        <View style={row}>
          <Text style={[styles.label, { color: t.text }]}>Daily notification</Text>
          <Switch
            value={settings.enabled}
            onValueChange={(enabled) => updateSettings({ enabled })}
            trackColor={{ true: t.accent }}
          />
        </View>

        <View style={[row, !settings.enabled && { opacity: 0.4 }]} pointerEvents={settings.enabled ? 'auto' : 'none'}>
          <Text style={[styles.label, { color: t.text }]}>Time</Text>
          {Platform.OS === 'ios' && (
            <DateTimePicker
              value={time}
              mode="time"
              display="compact"
              onValueChange={(_, d) => onPickTime(d)}
            />
          )}
          {Platform.OS === 'android' && (
            <Pressable onPress={() => setShowAndroidPicker(true)} hitSlop={8}>
              <Text style={[styles.value, { color: t.accent }]}>{formatTime(time)}</Text>
            </Pressable>
          )}
          {Platform.OS === 'web' && <Text style={[styles.value, { color: t.muted }]}>{formatTime(time)}</Text>}
        </View>
        {showAndroidPicker && (
          <DateTimePicker
            value={time}
            mode="time"
            onValueChange={(_, d) => onPickTime(d)}
            onDismiss={() => setShowAndroidPicker(false)}
          />
        )}

        <StatusLine />

        <Pressable onPress={onTest} style={[styles.button, { borderColor: t.accent }]}>
          <Text style={[styles.buttonText, { color: t.accent }]}>Send a test notification</Text>
        </Pressable>
        {testState === 'sent' && (
          <Text style={{ color: t.muted, textAlign: 'center' }}>Arriving in ~3 seconds. Lock your phone to see it.</Text>
        )}
        {testState === 'blocked' && (
          <Text style={{ color: t.danger, textAlign: 'center' }}>Notifications are not allowed for Arete.</Text>
        )}
        {testState === 'error' && (
          <Text style={{ color: t.danger, textAlign: 'center' }}>
            Something went wrong sending the test. Check the terminal for details.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatusLine() {
  const t = useTheme();
  const { schedule, settings } = useArete();

  if (!schedule) return <Text style={{ color: t.muted }}>Scheduling…</Text>;
  if (schedule.permission === 'unsupported')
    return <Text style={{ color: t.muted }}>Notifications only work on a phone, not in the browser preview.</Text>;
  if (schedule.permission === 'denied')
    return (
      <Pressable onPress={() => Linking.openSettings()}>
        <Text style={{ color: t.danger }}>
          Notifications are blocked. Tap to open system settings and allow them for Arete.
        </Text>
      </Pressable>
    );
  if (!settings.enabled) return <Text style={{ color: t.muted }}>Daily notifications are off.</Text>;
  return (
    <Text style={{ color: t.muted }}>
      {schedule.count} days scheduled ahead
      {schedule.next ? ` · next ${schedule.next.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at ${formatTime(schedule.next)}` : ''}
      . Opening the app keeps the queue topped up.
    </Text>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingBottom: 48, gap: 12 },
  h1: { fontSize: 32, fontWeight: '800', marginTop: 8, marginBottom: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  label: { fontSize: 17 },
  value: { fontSize: 17, fontWeight: '600' },
  button: { borderWidth: 1.5, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  buttonText: { fontSize: 16, fontWeight: '700' },
});
