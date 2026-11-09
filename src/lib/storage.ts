import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Quote } from './quotes';

export interface Settings {
  enabled: boolean;
  hour: number;
  minute: number;
}

export const DEFAULT_SETTINGS: Settings = { enabled: true, hour: 8, minute: 0 };

const KEYS = {
  settings: 'arete.settings.v1',
  userQuotes: 'arete.userQuotes.v1',
} as const;

// The app used to be called Daymark. Read its keys as a fallback so settings
// and quotes saved before the rename survive; the next save writes the new key.
const LEGACY_KEYS: Record<string, string> = {
  [KEYS.settings]: 'daymark.settings.v1',
  [KEYS.userQuotes]: 'daymark.userQuotes.v1',
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw =
      (await AsyncStorage.getItem(key)) ?? (await AsyncStorage.getItem(LEGACY_KEYS[key] ?? key));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function loadSettings(): Promise<Settings> {
  return { ...DEFAULT_SETTINGS, ...(await readJson<Partial<Settings>>(KEYS.settings, {})) };
}

export const saveSettings = (s: Settings) => AsyncStorage.setItem(KEYS.settings, JSON.stringify(s));

export const loadUserQuotes = () => readJson<Quote[]>(KEYS.userQuotes, []);

export const saveUserQuotes = (q: Quote[]) =>
  AsyncStorage.setItem(KEYS.userQuotes, JSON.stringify(q));
