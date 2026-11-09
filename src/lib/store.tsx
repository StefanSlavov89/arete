import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { rescheduleAll, type ScheduleResult } from './notifications';
import type { Quote } from './quotes';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  loadUserQuotes,
  saveSettings,
  saveUserQuotes,
  type Settings,
} from './storage';

interface AreteState {
  ready: boolean;
  now: Date;
  settings: Settings;
  userQuotes: Quote[];
  schedule: ScheduleResult | null;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  addQuote: (text: string, author: string) => Promise<void>;
  removeQuote: (id: string) => Promise<void>;
}

const Ctx = createContext<AreteState | null>(null);

export function AreteProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [userQuotes, setUserQuotes] = useState<Quote[]>([]);
  const [schedule, setSchedule] = useState<ScheduleResult | null>(null);

  // Latest values for async callbacks, updated eagerly so rapid edits don't race.
  const latest = useRef({ ready, settings, userQuotes });

  const resync = useCallback(async () => {
    const { settings: s, userQuotes: q } = latest.current;
    try {
      setSchedule(await rescheduleAll(s, q));
    } catch (e) {
      console.warn('Failed to schedule notifications', e);
    }
  }, []);

  // Initial load.
  useEffect(() => {
    (async () => {
      const [s, q] = await Promise.all([loadSettings(), loadUserQuotes()]);
      latest.current = { ready: true, settings: s, userQuotes: q };
      setSettings(s);
      setUserQuotes(q);
      setReady(true);
      resync();
    })();
  }, [resync]);

  // Coming back to the app: refresh "today" and top up the notification queue.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      setNow(new Date());
      if (latest.current.ready) resync();
    });
    return () => sub.remove();
  }, [resync]);

  // Roll over at midnight while the app is open.
  useEffect(() => {
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const t = setTimeout(() => setNow(new Date()), midnight.getTime() - Date.now() + 1000);
    return () => clearTimeout(t);
  }, [now]);

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      const next = { ...latest.current.settings, ...patch };
      latest.current.settings = next;
      setSettings(next);
      await saveSettings(next);
      await resync();
    },
    [resync],
  );

  const setQuotes = useCallback(
    async (next: Quote[]) => {
      latest.current.userQuotes = next;
      setUserQuotes(next);
      await saveUserQuotes(next);
      await resync();
    },
    [resync],
  );

  const addQuote = useCallback(
    (text: string, author: string) =>
      setQuotes([
        { id: `u-${Date.now().toString(36)}`, text: text.trim(), author: author.trim() || 'Me' },
        ...latest.current.userQuotes,
      ]),
    [setQuotes],
  );

  const removeQuote = useCallback(
    (id: string) => setQuotes(latest.current.userQuotes.filter((q) => q.id !== id)),
    [setQuotes],
  );

  return (
    <Ctx.Provider
      value={{ ready, now, settings, userQuotes, schedule, updateSettings, addQuote, removeQuote }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useArete() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useArete must be used inside <AreteProvider>');
  return ctx;
}
