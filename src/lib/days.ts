const MS_PER_DAY = 86_400_000;

export const isLeapYear = (year: number) =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

export const daysInYear = (year: number) => (isLeapYear(year) ? 366 : 365);

/** 1-based day of the year for the *local* calendar date. DST-safe. */
export function dayOfYear(date: Date): number {
  const today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const jan1 = Date.UTC(date.getFullYear(), 0, 1);
  return (today - jan1) / MS_PER_DAY + 1;
}

export interface DayInfo {
  year: number;
  /** 1-based day number, e.g. 285 */
  day: number;
  /** 365 or 366 */
  total: number;
  /** Days remaining after today, e.g. 80 on day 285 of 365 */
  left: number;
  /** 0..1, fraction of the year completed including today */
  progress: number;
}

export function getDayInfo(date: Date = new Date()): DayInfo {
  const year = date.getFullYear();
  const day = dayOfYear(date);
  const total = daysInYear(year);
  return { year, day, total, left: total - day, progress: day / total };
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** "80 days left until 2027." */
export function daysLeftLine(info: DayInfo): string {
  if (info.left === 0) return `Last day of ${info.year}. Make it count.`;
  return `${plural(info.left, 'day')} left until ${info.year + 1}.`;
}

/** Notification title: "313 down. 52 to go." */
export function countdownLine(info: DayInfo): string {
  if (info.left === 0) return `${info.day} down. Last day — make it count.`;
  return `${info.day} down. ${info.left} to go.`;
}

/** "Today is day 285 of 2026. 80 days left until 2027." */
export function headline(info: DayInfo): string {
  return `Today is day ${info.day} of ${info.year}. ${daysLeftLine(info)}`;
}
