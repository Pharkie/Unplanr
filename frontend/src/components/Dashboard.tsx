import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { api } from '../services/api';
import type { CalendarEvent, Calendar } from '../types';
import { EventList } from './EventList';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { DateRangeFilter } from './DateRangeFilter';
import { SearchBar } from './SearchBar';
import { About } from './About';
import { getTodayISO, getDateDaysFromNow } from '../utils/dateHelpers';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('primary');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Date range filter (default: today → 14 days)
  const [timeMin, setTimeMin] = useState<string>(getTodayISO());
  const [timeMax, setTimeMax] = useState<string | null>(getDateDaysFromNow(14));

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const loadCalendars = async () => {
    try {
      const fetchedCalendars = await api.getCalendars();
      setCalendars(fetchedCalendars);
      // Set first calendar as selected, or keep primary if it exists
      const primaryCal = fetchedCalendars.find((c: Calendar) => c.primary);
      if (primaryCal) {
        setSelectedCalendarId(primaryCal.id);
      } else if (fetchedCalendars.length > 0) {
        setSelectedCalendarId(fetchedCalendars[0].id);
      }
    } catch (error) {
      console.error('Failed to load calendars:', error);
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      // Only send search query if it's 3+ characters
      const effectiveSearchQuery = debouncedSearchQuery && debouncedSearchQuery.length >= 3
        ? debouncedSearchQuery
        : undefined;

      const { events: fetchedEvents } = await api.getEvents(selectedCalendarId, {
        maxResults: 100,
        timeMin,
        timeMax: timeMax || undefined,
        searchQuery: effectiveSearchQuery,
      });
      setEvents(fetchedEvents);
      // Only clear selections when switching calendars, not when filters change
    } catch (error) {
      console.error('Failed to load events:', error);
      alert('Failed to load calendar events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCalendarChange = (newCalendarId: string) => {
    setSelectedCalendarId(newCalendarId);
    setSelectedIds(new Set()); // Clear selections when switching calendars
  };

  const handleDateRangeChange = (newTimeMin: string, newTimeMax: string | null) => {
    setTimeMin(newTimeMin);
    setTimeMax(newTimeMax);
    // Don't clear selections when date range changes
  };

  useEffect(() => {
    loadCalendars();
  }, []);

  useEffect(() => {
    if (selectedCalendarId) {
      loadEvents();
    }
  }, [selectedCalendarId, timeMin, timeMax, debouncedSearchQuery]);

  const handleSelectAll = () => {
    if (selectedIds.size === events.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(events.map((e) => e.id)));
    }
  };

  const handleToggleEvent = (eventId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const result = await api.deleteEvents(selectedCalendarId, Array.from(selectedIds));

      alert(`Successfully deleted ${result.succeeded} event(s).${result.failed > 0 ? ` Failed to delete ${result.failed} event(s).` : ''}`);

      setSelectedIds(new Set());
      setShowDeleteModal(false);
      await loadEvents();
    } catch (error) {
      console.error('Failed to delete events:', error);
      alert('Failed to delete events. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 32 32" fill="none">
                    {/* Calendar background */}
                    <rect x="4" y="6" width="24" height="22" rx="2" fill="currentColor"/>
                    {/* Calendar header */}
                    <rect x="4" y="6" width="24" height="6" rx="2" fill="currentColor" opacity="0.8"/>
                    <rect x="4" y="10" width="24" height="2" fill="currentColor" opacity="0.8"/>
                    {/* Binding rings */}
                    <circle cx="10" cy="8" r="1.5" fill="currentColor" opacity="0.9"/>
                    <circle cx="22" cy="8" r="1.5" fill="currentColor" opacity="0.9"/>
                    {/* X mark (delete symbol) */}
                    <line x1="12" y1="16" x2="20" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    <line x1="20" y1="16" x2="12" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    Unplanr
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{user?.email}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedIds(new Set());
                  loadEvents();
                }}
                disabled={loading}
                className="p-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Refresh events"
                title="Refresh events"
              >
                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={() => setShowAbout(true)}
                className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="About"
              >
                About
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Filters Section */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800">
            <div className="space-y-4">
              {/* Title and event count */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Upcoming Events</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {selectedIds.size > 0
                    ? `✓ ${selectedIds.size} event(s) selected`
                    : `📅 ${events.length} event(s) found${events.length === 100 ? ' (max 100 shown at once)' : ''}`}
                </p>
              </div>

              {/* Filters row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Calendar selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Calendar:</label>
                  <select
                    value={selectedCalendarId}
                    onChange={(e) => handleCalendarChange(e.target.value)}
                    className="px-4 py-2 text-sm font-medium bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                >
                  {calendars.map((calendar) => (
                    <option key={calendar.id} value={calendar.id}>
                      {calendar.summary} {calendar.primary && '(Primary)'}
                    </option>
                  ))}
                </select>
                </div>

                {/* Date range filter */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Date range:</label>
                  <DateRangeFilter
                    timeMin={timeMin}
                    timeMax={timeMax}
                    onChange={handleDateRangeChange}
                  />
                </div>

                {/* Search bar */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Search:</label>
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search events..."
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <button
                  onClick={handleSelectAll}
                  disabled={loading || events.length === 0}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedIds.size === events.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={selectedIds.size === 0}
                  className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:scale-105 active:scale-95"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </div>

          <EventList
            events={events}
            selectedIds={selectedIds}
            searchQuery={searchQuery}
            onToggle={handleToggleEvent}
            loading={loading}
          />
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          count={selectedIds.size}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          deleting={deleting}
        />
      )}

      {/* About Modal */}
      {showAbout && <About onClose={() => setShowAbout(false)} />}
    </div>
  );
}
