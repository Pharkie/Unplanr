/**
 * Umami Analytics Utility
 * Privacy-friendly event tracking
 */

// Extend Window interface to include umami
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, string | number>) => void;
    };
  }
}

/**
 * Track a custom event with Umami
 * @param eventName - Name of the event (e.g., "login-clicked")
 * @param eventData - Optional data object with string/number values only
 */
export function trackEvent(eventName: string, eventData?: Record<string, string | number>) {
  if (typeof window !== 'undefined' && window.umami) {
    try {
      window.umami.track(eventName, eventData);
    } catch (error) {
      // Silently fail - analytics should never break the app
      console.debug('Analytics tracking failed:', error);
    }
  }
}

// Convenience functions for common events

export const analytics = {
  // Authentication events
  loginClicked: () => trackEvent('login-clicked'),
  loginSuccess: () => trackEvent('login-success'),
  loginFailed: () => trackEvent('login-failed'),
  logout: () => trackEvent('logout'),

  // Calendar events
  eventsLoaded: (count: number, calendarType: 'primary' | 'other') =>
    trackEvent('events-loaded', { count, calendar_type: calendarType }),

  calendarSwitched: (isPrimary: boolean) =>
    trackEvent('calendar-switched', { is_primary: isPrimary ? 1 : 0 }),

  // Search events
  searchUsed: (queryLength: number) =>
    trackEvent('search-used', { query_length: queryLength }),

  // Date range events
  dateRangeChanged: (rangeType: 'today' | 'week' | 'month' | 'custom') =>
    trackEvent('date-range-changed', { range_type: rangeType }),

  // Selection events
  eventsSelected: (count: number) =>
    trackEvent('events-selected', { count }),

  selectAllUsed: (eventCount: number) =>
    trackEvent('select-all-used', { event_count: eventCount }),

  // Delete events
  deleteInitiated: (count: number) =>
    trackEvent('delete-initiated', { count }),

  deleteConfirmed: (count: number) =>
    trackEvent('delete-confirmed', { count }),

  deleteSuccess: (count: number) =>
    trackEvent('delete-success', { count }),

  deleteFailed: (succeeded: number, failed: number) =>
    trackEvent('delete-failed', { succeeded, failed }),

  // UI interaction events
  darkModeToggled: (enabled: boolean) =>
    trackEvent('dark-mode-toggled', { enabled: enabled ? 1 : 0 }),

  aboutOpened: () => trackEvent('about-opened'),

  refreshClicked: () => trackEvent('refresh-clicked'),

  // Error events
  apiError: (endpoint: string) =>
    trackEvent('api-error', { endpoint }),
};
