// On Vercel, API is on same domain at /api/*
// For local dev with separate backend, use VITE_API_URL env var
const API_URL = import.meta.env.VITE_API_URL || '';

class ApiService {
  private async fetch(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // Include cookies for session
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async getAuthUrl() {
    return this.fetch('/api/auth/google');
  }

  async checkAuthStatus() {
    return this.fetch('/api/auth/status');
  }

  async logout() {
    return this.fetch('/api/auth/logout', { method: 'POST' });
  }

  // Calendar endpoints
  async getCalendars() {
    return this.fetch('/api/calendars/list');
  }

  async getEvents(
    calendarId = 'primary',
    options: {
      maxResults?: number;
      timeMin?: string;
      timeMax?: string;
      searchQuery?: string;
    } = {}
  ) {
    const params = new URLSearchParams({
      calendarId,
      maxResults: String(options.maxResults || 100),
    });

    if (options.timeMin) {
      params.append('timeMin', options.timeMin);
    }

    if (options.timeMax) {
      params.append('timeMax', options.timeMax);
    }

    if (options.searchQuery) {
      params.append('q', options.searchQuery);
    }

    return this.fetch(`/api/calendar/events?${params.toString()}`);
  }

  async deleteEvents(calendarId: string, eventIds: string[]) {
    return this.fetch('/api/calendar/delete', {
      method: 'POST',
      body: JSON.stringify({ calendarId, eventIds }),
    });
  }
}

export const api = new ApiService();
