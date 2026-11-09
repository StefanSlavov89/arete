import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { countdownLine, getDayInfo } from './days';
import { attribution, quoteForDate, type Quote } from './quotes';
import type { Settings } from './storage';

/**
 * iOS keeps at most 64 pending local notifications per app, so instead of one
 * repeating notification (which can't change its text) we schedule one per day
 * for the next DAYS_AHEAD days and top the queue up every time the app opens.
 */
export const DAYS_AHEAD = 60;
const CHANNEL_ID = 'daily';
const supported = Platform.OS !== 'web';

export type PermissionState = 'granted' | 'denied' | 'unsupported';

export function configureNotifications() {
  if (!supported) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Creates our Android channel. Every option is set explicitly: leaving fields
 * like the vibration pattern unset made the native call throw a
 * NullPointerException in Expo Go (SDK 58). If it still fails, we fall back to
 * Expo's default channel (undefined) rather than breaking scheduling.
 */
let channelPromise: Promise<string | undefined> | null = null;
function ensureChannel(): Promise<string | undefined> {
  if (Platform.OS !== 'android') return Promise.resolve(undefined);
  channelPromise ??= Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Daily day count',
    description: 'Your daily day number and quote',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250],
    enableVibrate: true,
    lightColor: '#D9622B',
    enableLights: false,
    showBadge: false,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  })
    .then(() => CHANNEL_ID)
    .catch((e) => {
      console.warn('Could not create notification channel, using the default one', e);
      return undefined;
    });
  return channelPromise;
}

async function ensurePermission(): Promise<PermissionState> {
  if (!supported) return 'unsupported';
  // Android won't show the permission prompt until a channel exists.
  await ensureChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return 'granted';
  if (!current.canAskAgain) return 'denied';
  return (await Notifications.requestPermissionsAsync()).granted ? 'granted' : 'denied';
}

export function buildContent(date: Date, userQuotes: Quote[]) {
  const info = getDayInfo(date);
  const q = quoteForDate(date, userQuotes);
  return {
    title: countdownLine(info),
    body: `“${q.text}” — ${attribution(q)}`,
  };
}

export interface ScheduleResult {
  permission: PermissionState;
  count: number;
  next: Date | null;
}

async function doReschedule(settings: Settings, userQuotes: Quote[]): Promise<ScheduleResult> {
  if (!supported) return { permission: 'unsupported', count: 0, next: null };
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!settings.enabled) return { permission: 'granted', count: 0, next: null };

  const permission = await ensurePermission();
  if (permission !== 'granted') return { permission, count: 0, next: null };

  const channelId = await ensureChannel();
  const now = new Date();
  let count = 0;
  let next: Date | null = null;
  for (let i = 0; count < DAYS_AHEAD; i++) {
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, settings.hour, settings.minute);
    if (at <= now) continue; // today's slot already passed
    const content = buildContent(at, userQuotes);
    if (count === DAYS_AHEAD - 1) {
      content.body += '\n\nOpen Arete to keep your daily reminders coming.';
    }
    await Notifications.scheduleNotificationAsync({
      content,
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId },
    });
    next ??= at;
    count++;
  }
  return { permission, count, next };
}

// Serialize reschedules so a cancel-all never interleaves with another run's scheduling.
let queue: Promise<unknown> = Promise.resolve();
export function rescheduleAll(settings: Settings, userQuotes: Quote[]): Promise<ScheduleResult> {
  const run = queue.then(() => doReschedule(settings, userQuotes));
  queue = run.catch(() => undefined);
  return run;
}

export type TestResult = 'sent' | 'blocked' | 'error';

export async function sendTestNotification(userQuotes: Quote[]): Promise<TestResult> {
  try {
    if ((await ensurePermission()) !== 'granted') return 'blocked';
    const channelId = await ensureChannel();
    await Notifications.scheduleNotificationAsync({
      content: buildContent(new Date(), userQuotes),
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3, channelId },
    });
    return 'sent';
  } catch (e) {
    console.warn('Test notification failed', e);
    return 'error';
  }
}
