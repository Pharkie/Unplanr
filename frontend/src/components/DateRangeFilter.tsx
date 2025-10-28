import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { startOfDay, addDays } from 'date-fns';
import { DATE_PRESETS, PRESET_LABELS, getTodayISO, getDateDaysFromNow } from '../utils/dateHelpers';

interface DateRangeFilterProps {
  timeMin: string;
  timeMax: string | null;
  onChange: (timeMin: string, timeMax: string | null) => void;
}

type PresetValue = 'all' | number;

export function DateRangeFilter({ timeMin, timeMax, onChange }: DateRangeFilterProps) {
  // Determine current preset or 'custom'
  const getActivePreset = (): PresetValue | 'custom' => {
    if (!timeMax) return 'all';

    const todayISO = getTodayISO();
    if (timeMin !== todayISO) return 'custom';

    const sevenDays = getDateDaysFromNow(DATE_PRESETS.SEVEN_DAYS);
    const fourteenDays = getDateDaysFromNow(DATE_PRESETS.FOURTEEN_DAYS);
    const thirtyDays = getDateDaysFromNow(DATE_PRESETS.THIRTY_DAYS);

    if (timeMax === sevenDays) return DATE_PRESETS.SEVEN_DAYS;
    if (timeMax === fourteenDays) return DATE_PRESETS.FOURTEEN_DAYS;
    if (timeMax === thirtyDays) return DATE_PRESETS.THIRTY_DAYS;

    return 'custom';
  };

  const [activePreset, setActivePreset] = useState<PresetValue | 'custom'>(getActivePreset());
  const [showCustomDates, setShowCustomDates] = useState(getActivePreset() === 'custom');

  const handlePresetChange = (value: string) => {
    if (value === 'all') {
      setActivePreset('all');
      setShowCustomDates(false);
      onChange(getTodayISO(), null);
    } else if (value === 'custom') {
      setActivePreset('custom');
      setShowCustomDates(true);
    } else {
      const days = parseInt(value);
      setActivePreset(days);
      setShowCustomDates(false);
      onChange(getTodayISO(), getDateDaysFromNow(days));
    }
  };

  const handleCustomDateChange = (start: Date | null, end: Date | null, isStartChange: boolean = false) => {
    if (start) {
      const startISO = startOfDay(start).toISOString();
      // If start date is being changed, ALWAYS default end to start + 14 days
      const endISO = isStartChange
        ? addDays(startOfDay(start), 14).toISOString()
        : end ? startOfDay(end).toISOString() : null;
      onChange(startISO, endISO);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <select
        value={activePreset === 'custom' ? 'custom' : activePreset}
        onChange={(e) => handlePresetChange(e.target.value)}
        className="px-4 py-2 text-sm font-medium bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
      >
        <option value={DATE_PRESETS.SEVEN_DAYS}>{PRESET_LABELS[DATE_PRESETS.SEVEN_DAYS]}</option>
        <option value={DATE_PRESETS.FOURTEEN_DAYS}>{PRESET_LABELS[DATE_PRESETS.FOURTEEN_DAYS]}</option>
        <option value={DATE_PRESETS.THIRTY_DAYS}>{PRESET_LABELS[DATE_PRESETS.THIRTY_DAYS]}</option>
        <option value="all">All upcoming events</option>
        <option value="custom">Custom range...</option>
      </select>

      {showCustomDates && (
        <div className="flex gap-2 items-center flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600 dark:text-slate-400">From:</label>
            <DatePicker
              selected={new Date(timeMin)}
              onChange={(date) => handleCustomDateChange(date, timeMax ? new Date(timeMax) : null, true)}
              className="px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              dateFormat="MMM d, yyyy"
              withPortal
              portalId="date-picker-portal"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600 dark:text-slate-400">To:</label>
            <DatePicker
              selected={timeMax ? new Date(timeMax) : null}
              onChange={(date) => handleCustomDateChange(new Date(timeMin), date)}
              className="px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              dateFormat="MMM d, yyyy"
              minDate={new Date(timeMin)}
              isClearable
              placeholderText="No end date"
              withPortal
              portalId="date-picker-portal"
            />
          </div>
        </div>
      )}
    </div>
  );
}
