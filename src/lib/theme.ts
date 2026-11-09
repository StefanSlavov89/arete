import { useColorScheme } from 'react-native';

const light = {
  bg: '#F7F5F0',
  card: '#FFFFFF',
  text: '#1C1B19',
  muted: '#6F6B63',
  accent: '#D9622B',
  track: '#E7E2D8',
  dotPast: '#1C1B19',
  dotFuture: '#DDD7CB',
  border: '#E7E2D8',
  danger: '#B3261E',
};

const dark: typeof light = {
  bg: '#121110',
  card: '#1D1C1A',
  text: '#F2EFE9',
  muted: '#9C978E',
  accent: '#F07A3E',
  track: '#2C2A27',
  dotPast: '#F2EFE9',
  dotFuture: '#34312D',
  border: '#2C2A27',
  danger: '#F2B8B5',
};

export type Theme = typeof light;

export const useTheme = (): Theme => (useColorScheme() === 'dark' ? dark : light);
