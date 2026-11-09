# Arete

Every day at a time you choose, your phone shows:

> **Today is day 311 of 2026**
> 54 days left until 2027.
> “Discipline equals freedom.” — Jocko Willink

Built with Expo SDK 58 (React Native + TypeScript) and Expo Router. Runs on iPhone and Android.

## Run it on your phone

1. Install **Expo Go** from the App Store / Google Play.
2. `npm install`, then `npx expo start`.
3. Scan the QR code (iPhone: Camera app; Android: Expo Go). Your phone and PC need to be on the same Wi-Fi — if not, use `npx expo start --tunnel`.
4. Allow notifications, then open **Settings → Send a test notification**.

`npx expo start --web` gives a browser preview of the UI; notifications don't work there.

## How it works

| File | What it holds |
| --- | --- |
| `src/lib/days.ts` | Day-of-year / days-left math (leap-year and DST safe) |
| `src/lib/quotes.ts` | Built-in quotes + deterministic “quote of the day” picker |
| `src/lib/notifications.ts` | Schedules one notification per day for the next 60 days |
| `src/lib/storage.ts` | Settings + your quotes, persisted with AsyncStorage |
| `src/lib/store.tsx` | App state; re-schedules on every change and every app open |
| `src/app/*.tsx` | Screens: Today, My quotes, Settings |

**Why 60 separate notifications instead of one repeating one?** A repeating notification always shows the same text, but the day number and quote change daily. iOS allows at most 64 pending local notifications per app, so Arete schedules 60 days ahead and tops the queue up whenever you open the app. If you don't open it for two months, the last notification reminds you to.

**Quote rotation:** your quotes and the built-in ones are shuffled per year (a fixed seed per year) and indexed by day number, so every quote shows once before any repeats, and the same day always shows the same quote.

## Adding built-in quotes

Append to the `RAW` list in `src/lib/quotes.ts` (append, don't insert, so this year's order stays stable). Or add them in the app on the **My quotes** tab.

## Later: a real installable app

Expo Go is for development. For a standalone app on your phone (and later the stores):

```bash
npx eas-cli@latest build --profile preview --platform android   # APK you can install directly
npx eas-cli@latest build --platform ios                          # needs an Apple Developer account ($99/yr)
```
