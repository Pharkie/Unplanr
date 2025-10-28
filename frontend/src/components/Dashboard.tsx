import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api, AuthError } from '../services/api';
import type { CalendarEvent, Calendar } from '../types';
import { EventList } from './EventList';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { DateRangeFilter } from './DateRangeFilter';
import { SearchBar } from './SearchBar';
import { About } from './About';
import { Toast } from './Toast';
import { getTodayISO, getDateDaysFromNow } from '../utils/dateHelpers';
import { stripHtml } from '../utils/stripHtml';
import { analytics } from '../utils/analytics';

export function Dashboard() {
  const { logout } = useAuth();
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('primary');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Date range filter (default: today → 14 days)
  const [timeMin, setTimeMin] = useState<string>(getTodayISO());
  const [timeMax, setTimeMax] = useState<string | null>(getDateDaysFromNow(14));

  // Search filter (instant, client-side only)
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Ref for select all checkbox indeterminate state
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  const loadCalendars = async () => {
    try {
      const fetchedCalendars = await api.getCalendars();

      // Sort calendars alphabetically by summary
      const sortedCalendars = [...fetchedCalendars].sort((a: Calendar, b: Calendar) => {
        return (a.summary || '').localeCompare(b.summary || '');
      });

      setCalendars(sortedCalendars);

      // Set first calendar as selected, or keep primary if it exists
      const primaryCal = sortedCalendars.find((c: Calendar) => c.primary);
      if (primaryCal) {
        setSelectedCalendarId(primaryCal.id);
      } else if (sortedCalendars.length > 0) {
        setSelectedCalendarId(sortedCalendars[0].id);
      }
    } catch (error) {
      console.error('Failed to load calendars:', error);

      // Handle token expiration
      if (error instanceof AuthError && error.code === 'TOKEN_EXPIRED') {
        setToast({ message: 'Your session has expired. Please sign in again.', type: 'info' });
        setTimeout(() => logout(), 2000); // Give user time to see the message
      }
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      // Don't send search query to backend - we'll filter on frontend only
      // Backend only handles date range filtering (Google Calendar API search is unreliable for partials)
      const { events: fetchedEvents } = await api.getEvents(selectedCalendarId, {
        maxResults: 100,
        timeMin,
        timeMax: timeMax || undefined,
      });
      setEvents(fetchedEvents);

      // Track events loaded
      const isPrimary = selectedCalendarId === 'primary';
      analytics.eventsLoaded(fetchedEvents.length, isPrimary ? 'primary' : 'other');

      // Only clear selections when switching calendars, not when filters change
    } catch (error) {
      console.error('Failed to load events:', error);

      // Handle token expiration
      if (error instanceof AuthError && error.code === 'TOKEN_EXPIRED') {
        setToast({ message: 'Your session has expired. Please sign in again.', type: 'info' });
        setTimeout(() => logout(), 2000); // Give user time to see the message
        return;
      }

      setToast({ message: 'Failed to load calendar events. Please try again.', type: 'error' });
      analytics.apiError('get-events');
    } finally {
      setLoading(false);
    }
  };

  const handleCalendarChange = (newCalendarId: string) => {
    const isPrimary = newCalendarId === 'primary';
    analytics.calendarSwitched(isPrimary);
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
  }, [selectedCalendarId, timeMin, timeMax]);

  // Client-side filtering for search queries (instant, no backend call)
  const filteredEvents = useMemo(() => {
    // Don't filter if no query
    if (!searchQuery) return events;

    // Normalize string to remove accents for better matching (e.g., "ces" matches "César")
    const normalizeString = (str: string) =>
      str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    const normalizedQuery = normalizeString(searchQuery);

    return events.filter(event => {
      // Search in title
      if (event.summary && normalizeString(event.summary).includes(normalizedQuery)) return true;
      // Search in description
      if (event.description && normalizeString(stripHtml(event.description)).includes(normalizedQuery)) return true;
      // Search in location
      if (event.location && normalizeString(event.location).includes(normalizedQuery)) return true;
      return false;
    });
  }, [events, searchQuery]);

  // Update select all checkbox indeterminate state
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const hasSelection = selectedIds.size > 0;
      const isFullSelection = selectedIds.size === filteredEvents.length && filteredEvents.length > 0;
      selectAllCheckboxRef.current.indeterminate = hasSelection && !isFullSelection;
    }
  }, [selectedIds, filteredEvents.length]);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredEvents.length) {
      setSelectedIds(new Set());
    } else {
      analytics.selectAllUsed(filteredEvents.length);
      setSelectedIds(new Set(filteredEvents.map((e) => e.id)));
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

    // Track selection count when user toggles
    if (newSelected.size > 0) {
      analytics.eventsSelected(newSelected.size);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      analytics.searchUsed(query.length);
    }
  };

  const handleRefresh = () => {
    analytics.refreshClicked();
    setSelectedIds(new Set());
    loadEvents();
  };

  const handleAboutOpen = () => {
    analytics.aboutOpened();
    setShowAbout(true);
  };

  const handleDeleteModalOpen = () => {
    analytics.deleteInitiated(selectedIds.size);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const deleteCount = selectedIds.size;
      analytics.deleteConfirmed(deleteCount);

      const result = await api.deleteEvents(selectedCalendarId, Array.from(selectedIds));

      if (result.failed > 0) {
        analytics.deleteFailed(result.succeeded, result.failed);
        setToast({
          message: `Deleted ${result.succeeded} event(s). Failed to delete ${result.failed} event(s).`,
          type: 'error'
        });
      } else {
        analytics.deleteSuccess(result.succeeded);
        setToast({
          message: `Successfully deleted ${result.succeeded} event(s)`,
          type: 'success'
        });
      }

      setSelectedIds(new Set());
      setShowDeleteModal(false);
      await loadEvents();
    } catch (error) {
      console.error('Failed to delete events:', error);

      // Handle token expiration
      if (error instanceof AuthError && error.code === 'TOKEN_EXPIRED') {
        setToast({ message: 'Your session has expired. Please sign in again.', type: 'info' });
        setTimeout(() => logout(), 2000); // Give user time to see the message
        return;
      }

      analytics.apiError('delete-events');
      setToast({ message: 'Failed to delete events. Please try again.', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 11l4 4m0-4l-4 4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    Unplanr
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5 hidden sm:block">
                    Bulk Google Calendar delete
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={handleAboutOpen}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="About"
              >
                About
              </button>
              <button
                onClick={logout}
                className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="flex gap-6 items-start">
          {/* Content Area */}
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Filters Section */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800">
            <div className="space-y-4">
              {/* Title and event count */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Upcoming Events</h2>
                    <button
                      onClick={handleRefresh}
                      disabled={loading}
                      className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Refresh from Google"
                    >
                      <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Refresh from Google</span>
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {selectedIds.size > 0
                      ? `✓ ${selectedIds.size} event(s) selected`
                      : `${filteredEvents.length} event(s) found${filteredEvents.length === 100 ? ' (max 100 shown at once)' : ''}`}
                  </p>
                </div>
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
                    onChange={handleSearchChange}
                    placeholder="Search events..."
                  />
                </div>
              </div>

              {/* Select All checkbox */}
              <div className="flex items-center gap-2">
                <input
                  ref={selectAllCheckboxRef}
                  type="checkbox"
                  checked={selectedIds.size === filteredEvents.length && filteredEvents.length > 0}
                  onChange={handleSelectAll}
                  disabled={loading || filteredEvents.length === 0}
                  className="h-5 w-5 text-blue-600 dark:text-blue-500 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Select all events"
                />
                <label
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none cursor-pointer"
                  onClick={() => !loading && filteredEvents.length > 0 && handleSelectAll()}
                >
                  Select All
                </label>
              </div>
            </div>
          </div>

          <EventList
            events={filteredEvents}
            selectedIds={selectedIds}
            searchQuery={searchQuery}
            onToggle={handleToggleEvent}
            loading={loading}
          />
          </div>

          {/* Sticky Sidebar (Desktop) */}
          {events.length > 0 && (
            <div className="hidden md:block sticky top-24 w-40">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex flex-col items-center gap-4">
                  {/* Selected count */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedIds.size}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Selected
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={handleDeleteModalOpen}
                    disabled={selectedIds.size === 0}
                    className="w-full px-4 py-3 text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:scale-105 active:scale-95 flex flex-col items-center gap-1"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Bar (Mobile) */}
        {events.length > 0 && selectedIds.size > 0 && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-xl p-4 z-20">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {selectedIds.size}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Selected
                </div>
              </div>
              <button
                onClick={handleDeleteModalOpen}
                className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all transform active:scale-95 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        )}
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

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
