import { addDays, startOfDay } from 'date-fns';

/**
 * Get ISO string for a date X days from now
 */
export function getDateDaysFromNow(days: number): string {
  return addDays(startOfDay(new Date()), days).toISOString();
}

/**
 * Get ISO string for today at midnight
 */
export function getTodayISO(): string {
  return startOfDay(new Date()).toISOString();
}

/**
 * Date range presets in days
 */
export const DATE_PRESETS = {
  SEVEN_DAYS: 7,
  FOURTEEN_DAYS: 14,
  THIRTY_DAYS: 30,
} as const;

/**
 * Preset labels for UI display
 */
export const PRESET_LABELS = {
  [DATE_PRESETS.SEVEN_DAYS]: 'Next 7 days',
  [DATE_PRESETS.FOURTEEN_DAYS]: 'Next 14 days',
  [DATE_PRESETS.THIRTY_DAYS]: 'Next 30 days',
} as const;
